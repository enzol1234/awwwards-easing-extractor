const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const MAX_CAPTURED_SCRIPT_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_CAPTURED_SCRIPTS = 40;
const MAX_SAMPLED_NON_HINT_SCRIPTS = 15;

function textLooksLikeJavaScript(contentType, url) {
  const ct = String(contentType || '').toLowerCase();
  if (ct.includes('javascript') || ct.includes('ecmascript')) return true;
  return /\.m?js(\?|#|$)/i.test(String(url || ''));
}

function hasGsapHint(textOrUrl) {
  const haystack = String(textOrUrl || '');
  return /(\bgsap\b|greensock|scrolltrigger|customease|tweenmax|tweenlite|timelinemax|timelinelite)/i.test(haystack);
}

function extractGsapEasingsFromText(text) {
  const results = new Set();
  const content = String(text || '');

  const stringEase = /ease\s*:\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(stringEase)) {
    if (match[1]) results.add(match[1].trim());
  }

  const identifierEase = /ease\s*:\s*([a-zA-Z_$][\w$]*(?:\.[\w$]+)*(?:\([^)]*\))?)(?=\s*[,}])/g;
  for (const match of content.matchAll(identifierEase)) {
    if (match[1]) results.add(match[1].trim());
  }

  const customEase = /CustomEase\.create\([^)]*\)/g;
  for (const match of content.matchAll(customEase)) {
    if (match[0]) results.add(match[0]);
  }

  return Array.from(results);
}

class ImprovedEasingExtractor {
  constructor() {
    this.results = [];
  }

  async extractEasings(url) {
    let browser = null;
    let page = null;
    const capturedScripts = [];
    let sampledNonHintScripts = 0;
    let sawGsapScriptUrl = false;
    let sawScrollTriggerScriptUrl = false;
    let seenScriptResponses = 0;
    let attemptedNonHintCaptures = 0;
    const scriptUrlsSeen = [];
    
    try {
      // Launch browser with more conservative settings
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions'
        ],
        // Reduce resource usage
        timeout: 60000
      });

      page = await browser.newPage();
      
      // More conservative timeout settings
      page.setDefaultTimeout(90000);
      page.setDefaultNavigationTimeout(90000);
      
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Handle request interception safely
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort('blockedbyclient').catch(() => {});
        } else {
          request.continue().catch(() => {});
        }
      });
      
      // Handle page errors
      page.on('error', (err) => console.log('Page error:', err));
      page.on('pageerror', (err) => console.log('Page error:', err));
      
      console.log(`\n🔍 Analyzing: ${url}`);

      // Capture external JS bundles so we can detect GSAP even when it isn't exposed as `window.gsap`
      page.on('response', async (response) => {
        try {
          if (capturedScripts.length >= MAX_CAPTURED_SCRIPTS) return;
          const request = response.request();
          if (request.resourceType() !== 'script') return;

          const scriptUrl = response.url();
          seenScriptResponses++;
          if (scriptUrlsSeen.length < 8) scriptUrlsSeen.push(scriptUrl);

          if (hasGsapHint(scriptUrl)) sawGsapScriptUrl = true;
          if (/scrolltrigger/i.test(scriptUrl)) sawScrollTriggerScriptUrl = true;

          const headers = response.headers();
          const contentType = headers['content-type'] || headers['Content-Type'];
          if (!textLooksLikeJavaScript(contentType, scriptUrl)) return;

          const urlHasHint = hasGsapHint(scriptUrl);
          const contentLengthHeader = headers['content-length'] || headers['Content-Length'];
          const contentLength = Number(contentLengthHeader);

          if (!urlHasHint) {
            if (sampledNonHintScripts >= MAX_SAMPLED_NON_HINT_SCRIPTS) return;
            sampledNonHintScripts++;
            attemptedNonHintCaptures++;
            if (Number.isFinite(contentLength) && contentLength > MAX_CAPTURED_SCRIPT_BYTES) return;
          } else {
            if (Number.isFinite(contentLength) && contentLength > MAX_CAPTURED_SCRIPT_BYTES) return;
          }

          const buffer = await response.buffer();
          if (!buffer || buffer.length > MAX_CAPTURED_SCRIPT_BYTES) return;

          const text = buffer.toString('utf8');
          if (!urlHasHint && !hasGsapHint(text)) return;

          capturedScripts.push({ url: scriptUrl, text });
        } catch {
          // Ignore script capture failures
        }
      });

      // Inject comprehensive animation interceptor BEFORE page loads
      await page.evaluateOnNewDocument(() => {
        window.capturedAnimations = {
          gsap: [],
          gsapScrollTrigger: [],
          lenis: [],
          anime: [],
          framer: [],
          webAnimations: [],
          scrollBehaviors: [],
          transforms: [],
          transitions: []
        };

        window.addEventListener('load', () => {
          setTimeout(() => {
            // ===== GSAP Detection and Interception =====
            const hookGsapIfPresent = () => {
              if (!window.gsap) return false;
              if (window.gsap.__easingExtractorHooked) return true;
              window.gsap.__easingExtractorHooked = true;

              console.log('[EXTRACTOR] GSAP detected!');

              const captureAnimationProps = (vars) => {
                if (!vars) return {};
                return {
                  ease: vars.ease ? (typeof vars.ease === 'string' ? vars.ease : vars.ease.toString()) : 'power1.inOut',
                  duration: vars.duration || 0.5,
                  delay: vars.delay || 0,
                  yoyo: vars.yoyo || false,
                  repeat: vars.repeat || 0,
                  paused: vars.paused || false,
                  scrollTrigger: vars.scrollTrigger ? JSON.stringify(vars.scrollTrigger) : null,
                  stagger: vars.stagger || null,
                  onComplete: vars.onComplete ? 'callback' : null,
                  customEase: typeof vars.ease === 'object' ? JSON.stringify(vars.ease) : null
                };
              };

              const wrapMethod = (methodName) => {
                const original = window.gsap[methodName];
                if (typeof original !== 'function') return;
                window.gsap[methodName] = function(...args) {
                  const vars = methodName === 'fromTo' ? args[2] : args[1];
                  const props = captureAnimationProps(vars);
                  const bucket = props.scrollTrigger ? 'gsapScrollTrigger' : 'gsap';
                  window.capturedAnimations[bucket].push({
                    method: methodName,
                    ...props
                  });
                  return original.apply(this, args);
                };
              };

              wrapMethod('to');
              wrapMethod('from');
              wrapMethod('fromTo');

              // Capture ScrollTrigger details (when available globally or via GSAP globals)
              let scrollTrigger = window.ScrollTrigger;
              try {
                scrollTrigger = scrollTrigger || (window.gsap && window.gsap.core && window.gsap.core.globals && window.gsap.core.globals().ScrollTrigger);
              } catch {}

              if (window.gsap.registerPlugin && scrollTrigger) {
                console.log('[EXTRACTOR] ScrollTrigger detected!');
                window.capturedAnimations.scrollTriggerInfo = {
                  available: true,
                  version: scrollTrigger.version,
                  triggers: scrollTrigger.getAll ? scrollTrigger.getAll().length : 'unknown'
                };
              }

              return true;
            };

            // GSAP is often loaded after `load`; poll briefly to hook when it appears
            const maxMs = 15000;
            const start = Date.now();
            const interval = setInterval(() => {
              const hooked = hookGsapIfPresent();
              if (hooked || Date.now() - start > maxMs) clearInterval(interval);
            }, 250);

            // ===== Lenis Smooth Scroll Detection =====
            if (window.Lenis) {
              console.log('[EXTRACTOR] Lenis detected!');
              window.capturedAnimations.lenisInfo = {
                available: true,
                smooth: window.Lenis.prototype?.smooth !== undefined,
                duration: 'custom',
                options: 'default'
              };
            }

            // ===== Anime.js Detection =====
            if (window.anime) {
              console.log('[EXTRACTOR] Anime.js detected!');
              const originalAnime = window.anime;
              window.anime = function(params) {
                if (params && params.easing) {
                  window.capturedAnimations.anime.push({
                    easing: params.easing,
                    duration: params.duration || 1000,
                    delay: params.delay || 0,
                    loop: params.loop || false
                  });
                }
                return originalAnime.apply(this, arguments);
              };
            }

            // ===== Extract scroll behavior patterns =====
            const allElements = document.querySelectorAll('[data-scroll], [class*="scroll"], [class*="trigger"]');
            allElements.forEach(el => {
              const styles = window.getComputedStyle(el);
              const transform = styles.transform;
              const opacity = styles.opacity;
              const transition = styles.transition;
              
              if (transform !== 'none' || opacity !== '1' || transition !== 'all 0s ease 0s') {
                window.capturedAnimations.scrollBehaviors.push({
                  class: el.className,
                  transform: transform,
                  opacity: opacity,
                  transition: transition
                });
              }
            });
          }, 500);
        });
      });

      // Navigate with multiple retry attempts
      let navigationSuccess = false;
      let lastError = null;
      
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          console.log(`🌐 Loading page (attempt ${attempt}/4)...`);
          
          // Try different waitUntil strategies
          let waitStrategies;
          if (attempt === 1) {
            waitStrategies = ['domcontentloaded'];
          } else if (attempt === 2) {
            waitStrategies = ['networkidle2'];
          } else {
            waitStrategies = ['networkidle0'];
          }
          
          for (const waitUntil of waitStrategies) {
            try {
              console.log(`  └─ Trying with waitUntil: ${waitUntil}`);
              await page.goto(url, { 
                waitUntil: waitUntil,
                timeout: 60000
              });
              navigationSuccess = true;
              console.log(`✅ Page loaded successfully with ${waitUntil}`);
              break;
            } catch (e) {
              // Try next strategy
            }
          }
          
          if (navigationSuccess) break;
          
        } catch (error) {
          lastError = error;
          console.log(`⚠️  Attempt ${attempt} failed: ${error.message.substring(0, 60)}...`);
          
          if (attempt < 4) {
            const waitTime = 3000 * attempt;
            console.log(`⏳ Waiting ${waitTime}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
      
      if (!navigationSuccess) {
        throw new Error(`Socket error: Failed to establish connection. ${lastError?.message || 'Unknown error'}`);
      }

      // Wait for animations to initialize
      console.log('⏳ Waiting for animations to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll to trigger scroll animations
      console.log('📜 Scrolling to trigger animations...');
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 3);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Hover over elements to trigger interactions
      console.log('🖱️  Triggering hover animations...');
      try {
        const buttons = await page.$$('button, a, .button, [class*="btn"]');
        if (buttons.length > 0) {
          for (let i = 0; i < Math.min(5, buttons.length); i++) {
            await buttons[i].hover().catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      } catch (e) {
        // Hover failed, continue
      }

      // Extract all easings and animation details
      const easings = await page.evaluate(() => {
        const scriptEls = Array.from(document.scripts || []);

        const anyScriptSrcMatches = (re) => scriptEls.some(s => re.test(String(s.src || '')));
        const anyInlineMatches = (re) => scriptEls.some(s => re.test(String(s.textContent || '')));

        const gsapEvidence = [];
        const scrollTriggerEvidence = [];
        const animeEvidence = [];
        const lenisEvidence = [];

        if (typeof window.gsap !== 'undefined') gsapEvidence.push('global.gsap');
        if (
          typeof window.TweenMax !== 'undefined' ||
          typeof window.TweenLite !== 'undefined' ||
          typeof window.TimelineMax !== 'undefined' ||
          typeof window.TimelineLite !== 'undefined'
        ) gsapEvidence.push('global.legacy');
        if (anyScriptSrcMatches(/(gsap|greensock|tweenmax|tweenlite|scrolltrigger)/i)) gsapEvidence.push('script-src');
        if (anyInlineMatches(/(\bgsap\b|CustomEase|ScrollTrigger|TweenMax|TweenLite)/i)) gsapEvidence.push('inline-code');
        try {
          const resources = performance.getEntriesByType?.('resource') || [];
          if (resources.some(r => /(gsap|greensock|scrolltrigger|tweenmax|tweenlite)/i.test(String(r.name || '')))) {
            gsapEvidence.push('resource');
          }
        } catch {}

        if (typeof window.ScrollTrigger !== 'undefined') scrollTriggerEvidence.push('global.ScrollTrigger');
        if (anyScriptSrcMatches(/scrolltrigger/i)) scrollTriggerEvidence.push('script-src');
        if (anyInlineMatches(/\bScrollTrigger\b/i)) scrollTriggerEvidence.push('inline-code');

        if (typeof window.anime !== 'undefined') animeEvidence.push('global.anime');
        if (anyScriptSrcMatches(/anime(\.min)?\.js/i)) animeEvidence.push('script-src');
        if (anyInlineMatches(/\banime\b/i)) animeEvidence.push('inline-code');

        if (typeof window.Lenis !== 'undefined') lenisEvidence.push('global.Lenis');
        if (anyScriptSrcMatches(/\blenis\b/i)) lenisEvidence.push('script-src');

        const results = {
          css: {
            transitions: [],
            animations: [],
            keyframes: []
          },
          javascript: {
            gsap: [],
            gsapCaptured: window.capturedAnimations.gsap || [],
            gsapScrollTrigger: window.capturedAnimations.gsapScrollTrigger || [],
            animejs: [],
            animejsCaptured: window.capturedAnimations.anime || [],
            framerMotion: [],
            custom: []
          },
          libraries: {
            gsapDetected: gsapEvidence.length > 0,
            scrollTriggerDetected: scrollTriggerEvidence.length > 0,
            lenisDetected: lenisEvidence.length > 0,
            animeDetected: animeEvidence.length > 0,
            gsapEvidence,
            scrollTriggerEvidence,
            gsapVersion: window.gsap ? (window.gsap.version || 'unknown') : (window.TweenMax ? (window.TweenMax.version || 'unknown') : null),
            scrollTriggerInfo: window.capturedAnimations.scrollTriggerInfo || null,
            lenisInfo: window.capturedAnimations.lenisInfo || null,
            locomotiveScroll: typeof window.LocomotiveScroll !== 'undefined'
          },
          scrollBehaviors: window.capturedAnimations.scrollBehaviors || [],
          animationPatterns: {
            hasScrollAnimations: (window.capturedAnimations.gsapScrollTrigger || []).length > 0,
            hasDataAttributes: document.querySelectorAll('[data-gsap], [data-scroll], [data-trigger]').length > 0,
            hasScrollClasses: document.querySelectorAll('[class*="scroll"], [class*="trigger"], [class*="animate"]').length > 0
          },
          source: window.location.href
        };

        // Extract enhanced CSS animation data
        const allElements = document.querySelectorAll('*');
        const cubicBezierRegex = /cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g;
        const easingSet = new Set();
        const animationDetails = [];
        
        allElements.forEach(el => {
          const computed = window.getComputedStyle(el);
          
          const transition = computed.transition;
          if (transition && transition !== 'all 0s ease 0s' && transition !== 'none') {
            const matches = [...transition.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              easingSet.add(bezier);
            });
            
            // Extract transition details
            const duration = computed.transitionDuration;
            const delay = computed.transitionDelay;
            const property = computed.transitionProperty;
            animationDetails.push({
              type: 'transition',
              property: property,
              duration: duration,
              delay: delay,
              timingFunction: computed.transitionTimingFunction
            });
          }

          const animation = computed.animation;
          if (animation && animation !== 'none' && animation !== 'none 0s ease 0s 1 normal none running') {
            const matches = [...animation.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              easingSet.add(bezier);
            });
            
            animationDetails.push({
              type: 'keyframe',
              animation: animation,
              duration: computed.animationDuration,
              delay: computed.animationDelay,
              iterationCount: computed.animationIterationCount
            });
          }

          const timingFunction = computed.transitionTimingFunction;
          if (timingFunction && timingFunction !== 'ease') {
            const matches = [...timingFunction.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              easingSet.add(bezier);
            });
          }
        });

        results.css.transitions = Array.from(easingSet);
        results.css.animationDetails = animationDetails.slice(0, 50); // Limit to first 50 for size

        // Extract data attributes that indicate animation triggers
        const animatedElements = document.querySelectorAll('[data-gsap], [data-scroll], [data-trigger], [class*="scroll-trigger"]');
        results.animatedElementsCount = animatedElements.length;
        
        const elementPatterns = [];
        animatedElements.forEach((el, idx) => {
          if (idx < 20) { // Limit to first 20
            elementPatterns.push({
              tag: el.tagName,
              classes: el.className,
              dataAttributes: Array.from(el.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => `${attr.name}=${attr.value}`)
                .join('; ')
            });
          }
        });
        results.elementPatterns = elementPatterns;


        try {
          Array.from(document.styleSheets).forEach(sheet => {
            try {
              Array.from(sheet.cssRules || sheet.rules || []).forEach(rule => {
                const cssText = rule.cssText || '';
                const matches = [...cssText.matchAll(cubicBezierRegex)];
                matches.forEach(match => {
                  const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
                  if (!results.css.transitions.includes(bezier)) {
                    results.css.transitions.push(bezier);
                  }
                });

                if (rule.type === CSSRule.KEYFRAMES_RULE) {
                  results.css.keyframes.push({
                    name: rule.name,
                    rules: rule.cssText
                  });
                }
              });
            } catch (e) {
              // CORS or other stylesheet access error
            }
          });
        } catch (e) {}

        // Extract GSAP-like easings from inline scripts (external bundles are handled in Node via response capture)
        try {
          const gsapEasings = new Set();
          scriptEls.forEach(script => {
            const content = String(script.textContent || '');
            if (!content) return;
            if (!/(\bgsap\b|CustomEase|ScrollTrigger|TweenMax|TweenLite)/i.test(content)) return;

            const patterns = [
              /ease\s*:\s*["']([^"']+)["']/g,
              /ease\s*:\s*([a-zA-Z_$][\w$]*(?:\.[\w$]+)*(?:\([^)]*\))?)(?=\s*[,}])/g,
              /CustomEase\.create\([^)]*\)/g
            ];

            patterns.forEach(pattern => {
              const matches = [...content.matchAll(pattern)];
              matches.forEach(match => {
                if (match[1]) gsapEasings.add(match[1].trim());
                else if (match[0]) gsapEasings.add(match[0]);
              });
            });
          });
          results.javascript.gsap = Array.from(gsapEasings);
        } catch {}

        if (results.libraries.animeDetected) {
          const scripts = document.querySelectorAll('script');
          const animeEasings = new Set();
          
          scripts.forEach(script => {
            const content = script.textContent;
            const animeEaseRegex = /easing\s*:\s*["']([^"']+)["']/g;
            const matches = [...content.matchAll(animeEaseRegex)];
            matches.forEach(match => {
              if (match[1]) {
                animeEasings.add(match[1]);
              }
            });
          });

          results.javascript.animejs = Array.from(animeEasings);
        }

        try {
          const scripts = document.querySelectorAll('script');
          const framerEasings = new Set();
          
          scripts.forEach(script => {
            const content = script.textContent;
            
            const arrayEaseRegex = /ease\s*:\s*\[([^\]]+)\]/g;
            const matches = [...content.matchAll(arrayEaseRegex)];
            matches.forEach(match => {
              framerEasings.add(`[${match[1]}]`);
            });

            const stringEaseRegex = /ease\s*:\s*["']([^"']+)["']/g;
            const stringMatches = [...content.matchAll(stringEaseRegex)];
            stringMatches.forEach(match => {
              if (!match[1].includes('power') && !match[1].includes('expo')) {
                framerEasings.add(match[1]);
              }
            });
          });

          results.javascript.framerMotion = Array.from(framerEasings);
        } catch (e) {}

        return results;
      });

      const metadata = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });

      const siteData = {
        ...metadata,
        easings,
        extractedAt: new Date().toISOString()
      };

      // Merge in GSAP evidence/easings extracted from external JS bundles (via network responses)
      try {
        const gsapEasings = new Set(siteData.easings.javascript.gsap || []);
        const gsapEvidence = new Set(siteData.easings.libraries.gsapEvidence || []);
        let sawGsapInNetwork = false;

        if (sawGsapScriptUrl) {
          sawGsapInNetwork = true;
          gsapEvidence.add('network-js-url');
        }
        if (sawScrollTriggerScriptUrl) {
          siteData.easings.libraries.scrollTriggerDetected = true;
          siteData.easings.libraries.scrollTriggerEvidence = Array.from(new Set([
            ...(siteData.easings.libraries.scrollTriggerEvidence || []),
            'network-js-url'
          ]));
        }

        for (const script of capturedScripts) {
          if (hasGsapHint(script.text) || hasGsapHint(script.url)) {
            sawGsapInNetwork = true;
            gsapEvidence.add('network-js');
          }

          if (/scrolltrigger/i.test(script.text)) {
            siteData.easings.libraries.scrollTriggerDetected = true;
            siteData.easings.libraries.scrollTriggerEvidence = Array.from(new Set([
              ...(siteData.easings.libraries.scrollTriggerEvidence || []),
              'network-js'
            ]));
          }

          for (const easing of extractGsapEasingsFromText(script.text)) {
            gsapEasings.add(easing);
          }
        }

        if (sawGsapInNetwork) siteData.easings.libraries.gsapDetected = true;
        siteData.easings.libraries.gsapEvidence = Array.from(gsapEvidence);
        siteData.easings.javascript.gsap = Array.from(gsapEasings);
      } catch {
        // Ignore merge failures
      }

      this.results.push(siteData);
      
      console.log('\n📊 Animation Libraries Detected:');
      console.log(`   GSAP: ${easings.libraries.gsapDetected ? '✅ DETECTED' : '❌ Not found'}`);
      if (easings.libraries.gsapVersion) {
        console.log(`   └─ Version: ${easings.libraries.gsapVersion}`);
      }
      if (Array.isArray(easings.libraries.gsapEvidence) && easings.libraries.gsapEvidence.length > 0) {
        console.log(`   └─ Evidence: ${easings.libraries.gsapEvidence.join(', ')}`);
      } else {
        console.log(`   └─ Evidence: (none)`);
      }
      console.log(`   └─ Network scripts: seen=${seenScriptResponses}, captured=${capturedScripts.length}, nonhint-attempts=${attemptedNonHintCaptures}`);
      if (!easings.libraries.gsapDetected && capturedScripts.length === 0 && scriptUrlsSeen.length > 0) {
        console.log(`   └─ Sample script URLs: ${scriptUrlsSeen.slice(0, 3).join(' | ')}`);
      }
      console.log(`   ScrollTrigger: ${easings.libraries.scrollTriggerDetected ? '✅ DETECTED' : '❌ Not found'}`);
      if (easings.libraries.scrollTriggerInfo) {
        console.log(`   └─ Active Triggers: ${easings.libraries.scrollTriggerInfo.triggers}`);
      }
      if (Array.isArray(easings.libraries.scrollTriggerEvidence) && easings.libraries.scrollTriggerEvidence.length > 0) {
        console.log(`   └─ Evidence: ${easings.libraries.scrollTriggerEvidence.join(', ')}`);
      }
      console.log(`   Lenis (Smooth Scroll): ${easings.libraries.lenisDetected ? '✅ DETECTED' : '❌ Not found'}`);
      if (easings.libraries.lenisInfo) {
        console.log(`   └─ Smooth Scrolling: ${easings.libraries.lenisInfo.smooth ? 'Enabled' : 'Disabled'}`);
      }
      console.log(`   Anime.js: ${easings.libraries.animeDetected ? '✅ DETECTED' : '❌ Not found'}`);
      console.log(`   Locomotive Scroll: ${easings.libraries.locomotiveScroll ? '✅ DETECTED' : '❌ Not found'}`);
      
      console.log(`\n📈 Animation Data Extracted:`);
      console.log(`   CSS easings: ${easings.css.transitions.length}`);
      console.log(`   CSS animation details: ${easings.css.animationDetails?.length || 0}`);
      console.log(`   GSAP animations (standard): ${easings.javascript.gsapCaptured.length}`);
      console.log(`   GSAP animations (ScrollTrigger): ${easings.javascript.gsapScrollTrigger.length}`);
      console.log(`   Anime.js animations: ${easings.javascript.animejsCaptured.length}`);
      console.log(`   Scroll-triggered elements: ${easings.animatedElementsCount || 0}`);
      
      if (easings.animationPatterns.hasScrollAnimations) {
        console.log(`\n⚡ Scroll Animation Patterns Detected:`);
        console.log(`   └─ ScrollTrigger animations found`);
      }
      if (easings.animationPatterns.hasDataAttributes) {
        console.log(`   └─ Data attributes used for animations`);
      }
      if (easings.animationPatterns.hasScrollClasses) {
        console.log(`   └─ CSS classes for scroll/animation control`);
      }
      
      if (easings.javascript.gsapScrollTrigger.length > 0) {
        console.log('\n🔗 ScrollTrigger Animations (Top 5):');
        easings.javascript.gsapScrollTrigger.slice(0, 5).forEach((anim, idx) => {
          console.log(`   ${idx + 1}. ${anim.method}: ease=${anim.ease}, duration=${anim.duration}s`);
          if (anim.scrollTrigger) {
            console.log(`      └─ ScrollTrigger: ${anim.scrollTrigger.substring(0, 60)}...`);
          }
        });
      }
      
      if (easings.javascript.gsapCaptured.length > 0) {
        console.log('\n🎯 Standard GSAP Animations (Top 5):');
        easings.javascript.gsapCaptured.slice(0, 5).forEach((anim, idx) => {
          console.log(`   ${idx + 1}. ${anim.method}: ease=${anim.ease}, duration=${anim.duration}s`);
        });
      }
      
      if (easings.elementPatterns && easings.elementPatterns.length > 0) {
        console.log(`\n🎪 Sample Animated Elements:`);
        easings.elementPatterns.slice(0, 3).forEach((el, idx) => {
          console.log(`   ${idx + 1}. <${el.tag}> - ${el.classes.substring(0, 40)}`);
          if (el.dataAttributes) {
            console.log(`      └─ ${el.dataAttributes.substring(0, 60)}`);
          }
        });
      }
      
      return siteData;

    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error.message);
      return null;
    } finally {
      try {
        if (page) {
          await page.close().catch(() => {});
        }
        if (browser) {
          await browser.close().catch(() => {});
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async extractFromMultipleSites(urls) {
    console.log(`\n🚀 Starting extraction from ${urls.length} sites...\n`);
    
    for (const url of urls) {
      try {
        await this.extractEasings(url);
      } catch (error) {
        console.error(`❌ Failed to analyze ${url}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return this.results;
  }

  async saveResults(filename = 'easing-results.json') {
    const output = {
      extractedAt: new Date().toISOString(),
      totalSites: this.results.length,
      sites: this.results,
      summary: this.generateSummary()
    };

    await fs.writeFile(filename, JSON.stringify(output, null, 2));
    console.log(`\n💾 Results saved to ${filename}`);
    
    return output;
  }

  generateSummary() {
    const allTransitions = [];
    const allGsap = [];
    const allGsapCaptured = [];
    const allAnime = [];

    this.results.forEach(site => {
      if (site && site.easings) {
        allTransitions.push(...site.easings.css.transitions);
        allGsap.push(...site.easings.javascript.gsap);
        allGsapCaptured.push(...site.easings.javascript.gsapCaptured.map(a => a.ease));
        allAnime.push(...site.easings.javascript.animejs);
      }
    });

    const countFrequency = (arr) => {
      return arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
    };

    return {
      cssTransitions: {
        unique: [...new Set(allTransitions)],
        frequency: countFrequency(allTransitions)
      },
      gsapEasings: {
        unique: [...new Set(allGsap)],
        frequency: countFrequency(allGsap)
      },
      gsapCaptured: {
        unique: [...new Set(allGsapCaptured)],
        frequency: countFrequency(allGsapCaptured)
      },
      animeEasings: {
        unique: [...new Set(allAnime)],
        frequency: countFrequency(allAnime)
      }
    };
  }

  async generateReadableReport(filename = 'easing-report.md') {
    const summary = this.generateSummary();
    
    let report = `# Awwwards Easing Analysis Report\n\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Sites Analyzed: ${this.results.length}\n\n`;
    
    report += `## 🎯 Most Common CSS Easings\n\n`;
    const sortedTransitions = Object.entries(summary.cssTransitions.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    if (sortedTransitions.length > 0) {
      sortedTransitions.forEach(([easing, count]) => {
        report += `- \`${easing}\` (used ${count}x)\n`;
      });
    } else {
      report += `No CSS easings found.\n`;
    }
    
    report += `\n## 🎨 GSAP Easings (from source code)\n\n`;
    const sortedGsap = Object.entries(summary.gsapEasings.frequency)
      .sort((a, b) => b[1] - a[1]);
    if (sortedGsap.length > 0) {
      sortedGsap.forEach(([easing, count]) => {
        report += `- \`${easing}\` (used ${count}x)\n`;
      });
    } else {
      report += `No GSAP easings found in source.\n`;
    }

    report += `\n## 🎬 GSAP Easings (captured live)\n\n`;
    const sortedCaptured = Object.entries(summary.gsapCaptured.frequency)
      .sort((a, b) => b[1] - a[1]);
    if (sortedCaptured.length > 0) {
      sortedCaptured.forEach(([easing, count]) => {
        report += `- \`${easing}\` (used ${count}x)\n`;
      });
    } else {
      report += `No GSAP animations were captured during page interactions.\n`;
    }
    
    report += `\n## � Libraries Overview\n\n`;
    let gsapSites = 0, scrollTriggerSites = 0, lenisSites = 0, animeSites = 0;
    this.results.forEach(site => {
      if (site?.easings?.libraries) {
        if (site.easings.libraries.gsapDetected) gsapSites++;
        if (site.easings.libraries.scrollTriggerDetected) scrollTriggerSites++;
        if (site.easings.libraries.lenisDetected) lenisSites++;
        if (site.easings.libraries.animeDetected) animeSites++;
      }
    });
    
    report += `### Library Distribution\n`;
    report += `- **GSAP**: ${gsapSites}/${this.results.length} sites\n`;
    report += `- **ScrollTrigger**: ${scrollTriggerSites}/${this.results.length} sites\n`;
    report += `- **Lenis**: ${lenisSites}/${this.results.length} sites\n`;
    report += `- **Anime.js**: ${animeSites}/${this.results.length} sites\n`;
    
    report += `\n## �📊 Site-by-Site Breakdown\n\n`;
    this.results.forEach((site, index) => {
      if (site) {
        report += `### ${index + 1}. ${site.title}\n`;
        report += `URL: ${site.url}\n\n`;
        report += `**Libraries Detected:**\n`;
        report += `- GSAP: ${site.easings.libraries.gsapDetected ? '✅ Yes' : '❌ No'}`;
        if (site.easings.libraries.gsapVersion) {
          report += ` (v${site.easings.libraries.gsapVersion})`;
        }
        report += `\n`;
        report += `- ScrollTrigger: ${site.easings.libraries.scrollTriggerDetected ? '✅ Yes' : '❌ No'}`;
        if (site.easings.libraries.scrollTriggerInfo) {
          report += ` (${site.easings.libraries.scrollTriggerInfo.triggers} active triggers)`;
        }
        report += `\n`;
        report += `- Lenis: ${site.easings.libraries.lenisDetected ? '✅ Yes' : '❌ No'}\n`;
        report += `- Anime.js: ${site.easings.libraries.animeDetected ? '✅ Yes' : '❌ No'}\n`;
        report += `- Locomotive Scroll: ${site.easings.libraries.locomotiveScroll ? '✅ Yes' : '❌ No'}\n\n`;
        
        report += `**Animation Data:**\n`;
        report += `- CSS Transitions: ${site.easings.css.transitions.length}\n`;
        report += `- CSS Animation Details: ${site.easings.css.animationDetails?.length || 0}\n`;
        report += `- GSAP Animations: ${site.easings.javascript.gsapCaptured.length}\n`;
        report += `- GSAP ScrollTrigger Animations: ${site.easings.javascript.gsapScrollTrigger?.length || 0}\n`;
        report += `- Anime.js Animations: ${site.easings.javascript.animejsCaptured.length}\n`;
        report += `- Scroll-Animated Elements: ${site.easings.animatedElementsCount || 0}\n\n`;
        
        if (site.easings.elementPatterns && site.easings.elementPatterns.length > 0) {
          report += `**Element Patterns (Animation Triggers):**\n`;
          site.easings.elementPatterns.forEach(el => {
            report += `- \`<${el.tag}>\` - ${el.classes}\n`;
            if (el.dataAttributes) {
              report += `  - Data: ${el.dataAttributes}\n`;
            }
          });
          report += `\n`;
        }
        
        if (site.easings.css.transitions.length > 0) {
          report += `**CSS Transition Easings:**\n`;
          site.easings.css.transitions.forEach(t => {
            report += `- \`${t}\`\n`;
          });
          report += `\n`;
        }

        if (site.easings.javascript.gsap.length > 0) {
          report += `**GSAP Easings (from code):**\n`;
          site.easings.javascript.gsap.forEach(t => {
            report += `- \`${t}\`\n`;
          });
          report += `\n`;
        }

        if (site.easings.javascript.gsapCaptured.length > 0) {
          report += `**GSAP Standard Animations:**\n`;
          site.easings.javascript.gsapCaptured.forEach(anim => {
            report += `- **${anim.method}**\n`;
            report += `  - Ease: \`${anim.ease}\`\n`;
            report += `  - Duration: ${anim.duration || 'default'}s\n`;
            if (anim.delay) report += `  - Delay: ${anim.delay}s\n`;
            if (anim.stagger) report += `  - Stagger: ${anim.stagger}\n`;
            if (anim.customEase) report += `  - Custom Ease: ${anim.customEase}\n`;
          });
          report += `\n`;
        }
        
        if (site.easings.javascript.gsapScrollTrigger && site.easings.javascript.gsapScrollTrigger.length > 0) {
          report += `**GSAP ScrollTrigger Animations:**\n`;
          site.easings.javascript.gsapScrollTrigger.forEach(anim => {
            report += `- **${anim.method}** (Scroll-Triggered)\n`;
            report += `  - Ease: \`${anim.ease}\`\n`;
            report += `  - Duration: ${anim.duration || 'default'}s\n`;
            if (anim.scrollTrigger) {
              report += `  - ScrollTrigger Config: \`${anim.scrollTrigger.substring(0, 100)}...\`\n`;
            }
          });
          report += `\n`;
        }
        
        if (site.easings.css.animationDetails && site.easings.css.animationDetails.length > 0) {
          report += `**CSS Animation Details:**\n`;
          site.easings.css.animationDetails.slice(0, 10).forEach(detail => {
            report += `- **${detail.type}**: \`${detail.property || detail.animation}\`\n`;
            report += `  - Duration: ${detail.duration}\n`;
            report += `  - Timing: ${detail.timingFunction || detail.iterationCount}\n`;
          });
          if (site.easings.css.animationDetails.length > 10) {
            report += `- ... and ${site.easings.css.animationDetails.length - 10} more\n`;
          }
          report += `\n`;
        }
      }
    });

    await fs.writeFile(filename, report);
    console.log(`📄 Readable report saved to ${filename}`);
  }
}

module.exports = ImprovedEasingExtractor;
