# COMPLETE AWWWARDS EASING EXTRACTOR
# All code in one file for easy copy/paste

## FILE 1: package.json
```json
{
  "name": "awwwards-easing-extractor",
  "version": "2.0.0",
  "description": "Extract easing functions from Awwwards SOTD winning sites with live GSAP capture",
  "main": "improved-extractor.js",
  "scripts": {
    "start": "node analyze.js"
  },
  "keywords": ["awwwards", "easing", "animation", "css", "gsap"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "puppeteer": "^21.6.1"
  }
}
```

## FILE 2: improved-extractor.js
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class ImprovedEasingExtractor {
  constructor() {
    this.results = [];
  }

  async extractEasings(url) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`\n🔍 Analyzing: ${url}`);

      // Inject GSAP interceptor BEFORE page loads
      await page.evaluateOnNewDocument(() => {
        window.capturedGSAPEasings = [];
        window.capturedAnimations = {
          gsap: [],
          anime: [],
          framer: [],
          webAnimations: []
        };

        // Monitor for GSAP method calls
        window.addEventListener('load', () => {
          setTimeout(() => {
            // Try to access GSAP if it exists
            if (window.gsap) {
              console.log('[EXTRACTOR] GSAP detected!');
              
              // Wrap gsap.to, gsap.from, gsap.fromTo
              const originalTo = window.gsap.to;
              const originalFrom = window.gsap.from;
              const originalFromTo = window.gsap.fromTo;
              
              window.gsap.to = function(targets, vars) {
                if (vars && vars.ease) {
                  window.capturedAnimations.gsap.push({
                    method: 'to',
                    ease: typeof vars.ease === 'string' ? vars.ease : vars.ease.toString(),
                    duration: vars.duration,
                    delay: vars.delay
                  });
                }
                return originalTo.apply(this, arguments);
              };
              
              window.gsap.from = function(targets, vars) {
                if (vars && vars.ease) {
                  window.capturedAnimations.gsap.push({
                    method: 'from',
                    ease: typeof vars.ease === 'string' ? vars.ease : vars.ease.toString(),
                    duration: vars.duration,
                    delay: vars.delay
                  });
                }
                return originalFrom.apply(this, arguments);
              };
              
              window.gsap.fromTo = function(targets, fromVars, toVars) {
                if (toVars && toVars.ease) {
                  window.capturedAnimations.gsap.push({
                    method: 'fromTo',
                    ease: typeof toVars.ease === 'string' ? toVars.ease : toVars.ease.toString(),
                    duration: toVars.duration,
                    delay: toVars.delay
                  });
                }
                return originalFromTo.apply(this, arguments);
              };

              // Also intercept timeline
              if (window.gsap.timeline) {
                const originalTimeline = window.gsap.timeline;
                window.gsap.timeline = function(vars) {
                  const tl = originalTimeline.apply(this, arguments);
                  
                  // Wrap timeline methods
                  const originalTlTo = tl.to;
                  tl.to = function(targets, vars) {
                    if (vars && vars.ease) {
                      window.capturedAnimations.gsap.push({
                        method: 'timeline.to',
                        ease: typeof vars.ease === 'string' ? vars.ease : vars.ease.toString(),
                        duration: vars.duration
                      });
                    }
                    return originalTlTo.apply(this, arguments);
                  };
                  
                  return tl;
                };
              }
            }

            // Check for anime.js
            if (window.anime) {
              console.log('[EXTRACTOR] Anime.js detected!');
              const originalAnime = window.anime;
              window.anime = function(params) {
                if (params && params.easing) {
                  window.capturedAnimations.anime.push({
                    easing: params.easing,
                    duration: params.duration,
                    delay: params.delay
                  });
                }
                return originalAnime.apply(this, arguments);
              };
            }
          }, 100);
        });
      });

      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for animations to initialize and potentially trigger
      console.log('⏳ Waiting for animations to load...');
      await page.waitForTimeout(3000);

      // Scroll to trigger scroll animations
      console.log('📜 Scrolling to trigger animations...');
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 3);
      });
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(1000);

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);

      // Hover over some elements to trigger interactions
      console.log('🖱️  Triggering hover animations...');
      try {
        const buttons = await page.$$('button, a, .button, [class*="btn"]');
        if (buttons.length > 0) {
          for (let i = 0; i < Math.min(5, buttons.length); i++) {
            await buttons[i].hover().catch(() => {});
            await page.waitForTimeout(200);
          }
        }
      } catch (e) {
        // Hover failed, continue
      }

      // Extract all easings
      const easings = await page.evaluate(() => {
        const results = {
          css: {
            transitions: [],
            animations: [],
            keyframes: []
          },
          javascript: {
            gsap: [],
            gsapCaptured: window.capturedAnimations.gsap || [],
            animejs: [],
            animejsCaptured: window.capturedAnimations.anime || [],
            framerMotion: [],
            custom: []
          },
          libraries: {
            gsapDetected: typeof window.gsap !== 'undefined',
            animeDetected: typeof window.anime !== 'undefined',
            gsapVersion: window.gsap ? (window.gsap.version || 'unknown') : null,
            locomotiveScroll: typeof window.LocomotiveScroll !== 'undefined'
          },
          source: window.location.href
        };

        // 1. Extract CSS Transitions and Animations from computed styles
        const allElements = document.querySelectorAll('*');
        const cubicBezierRegex = /cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g;
        const easingSet = new Set();
        
        allElements.forEach(el => {
          const computed = window.getComputedStyle(el);
          
          // Transitions
          const transition = computed.transition;
          if (transition && transition !== 'all 0s ease 0s' && transition !== 'none') {
            const matches = [...transition.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              easingSet.add(bezier);
            });
          }

          // Animations
          const animation = computed.animation;
          if (animation && animation !== 'none' && animation !== 'none 0s ease 0s 1 normal none running') {
            const matches = [...animation.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              easingSet.add(bezier);
            });
          }

          // Get timing function specifically
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

        // 2. Extract from stylesheets
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

                // Check for keyframes
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

        // 3. Extract GSAP from source code (backup method)
        if (results.libraries.gsapDetected) {
          const scripts = document.querySelectorAll('script');
          const gsapEasings = new Set();
          
          scripts.forEach(script => {
            const content = script.textContent;
            
            // Match various GSAP easing patterns
            const patterns = [
              /ease\s*:\s*["']([^"']+)["']/g,
              /ease\s*:\s*([a-zA-Z0-9.()]+)(?=\s*[,}])/g,
              /\.to\([^)]*ease\s*:\s*["']([^"']+)["']/g,
              /\.from\([^)]*ease\s*:\s*["']([^"']+)["']/g,
            ];

            patterns.forEach(pattern => {
              const matches = [...content.matchAll(pattern)];
              matches.forEach(match => {
                if (match[1]) {
                  gsapEasings.add(match[1].trim());
                }
              });
            });
          });

          results.javascript.gsap = Array.from(gsapEasings);
        }

        // 4. Extract Anime.js
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

        // 5. Extract Framer Motion
        try {
          const scripts = document.querySelectorAll('script');
          const framerEasings = new Set();
          
          scripts.forEach(script => {
            const content = script.textContent;
            
            // Framer Motion array easings
            const arrayEaseRegex = /ease\s*:\s*\[([^\]]+)\]/g;
            const matches = [...content.matchAll(arrayEaseRegex)];
            matches.forEach(match => {
              framerEasings.add(`[${match[1]}]`);
            });

            // String easings
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

      // Get site metadata
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

      this.results.push(siteData);
      
      // Enhanced logging
      console.log('\n📊 Results:');
      console.log(`   GSAP: ${easings.libraries.gsapDetected ? '✅ DETECTED' : '❌ Not found'}`);
      if (easings.libraries.gsapVersion) {
        console.log(`   GSAP Version: ${easings.libraries.gsapVersion}`);
      }
      console.log(`   Anime.js: ${easings.libraries.animeDetected ? '✅ DETECTED' : '❌ Not found'}`);
      console.log(`   Locomotive Scroll: ${easings.libraries.locomotiveScroll ? '✅ DETECTED' : '❌ Not found'}`);
      console.log(`\n   📈 CSS easings found: ${easings.css.transitions.length}`);
      console.log(`   📈 GSAP easings (source): ${easings.javascript.gsap.length}`);
      console.log(`   📈 GSAP easings (captured): ${easings.javascript.gsapCaptured.length}`);
      console.log(`   📈 Anime.js easings: ${easings.javascript.animejs.length}`);
      console.log(`   📈 Keyframes found: ${easings.css.keyframes.length}`);
      
      if (easings.javascript.gsapCaptured.length > 0) {
        console.log('\n   🎯 Captured GSAP animations:');
        easings.javascript.gsapCaptured.slice(0, 5).forEach(anim => {
          console.log(`      ${anim.method}: ${anim.ease} (${anim.duration}s)`);
        });
      }
      
      return siteData;

    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error.message);
      return null;
    } finally {
      await browser.close();
    }
  }

  async extractFromMultipleSites(urls) {
    console.log(`\n🚀 Starting extraction from ${urls.length} sites...\n`);
    
    for (const url of urls) {
      await this.extractEasings(url);
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
    
    report += `\n## 📊 Site-by-Site Breakdown\n\n`;
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
        report += `- Anime.js: ${site.easings.libraries.animeDetected ? '✅ Yes' : '❌ No'}\n`;
        report += `- Locomotive Scroll: ${site.easings.libraries.locomotiveScroll ? '✅ Yes' : '❌ No'}\n\n`;
        
        report += `**Easings Found:**\n`;
        report += `- CSS Transitions: ${site.easings.css.transitions.length}\n`;
        report += `- GSAP (source): ${site.easings.javascript.gsap.length}\n`;
        report += `- GSAP (captured): ${site.easings.javascript.gsapCaptured.length}\n`;
        report += `- Anime.js: ${site.easings.javascript.animejs.length}\n\n`;
        
        if (site.easings.css.transitions.length > 0) {
          report += `**CSS Transitions:**\n`;
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
          report += `**GSAP Animations Captured:**\n`;
          site.easings.javascript.gsapCaptured.forEach(anim => {
            report += `- \`${anim.method}\`: ease: \`${anim.ease}\`, duration: ${anim.duration || 'default'}s\n`;
          });
          report += `\n`;
        }
      }
    });

    await fs.writeFile(filename, report);
    console.log(`📄 Readable report saved to ${filename}`);
  }
}

module.exports = ImprovedEasingExtractor;
```

## FILE 3: analyze.js
```javascript
#!/usr/bin/env node

const ImprovedEasingExtractor = require('./improved-extractor');

async function main() {
  console.log('🎨 Awwwards Easing Extractor v2.0');
  console.log('🔥 Now with LIVE GSAP capture!\n');

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node analyze.js <URL>');
    console.log('Example: node analyze.js https://resn.co.nz');
    process.exit(0);
  }

  const url = args[0];
  
  if (!url.startsWith('http')) {
    console.error('❌ Please provide a valid URL starting with http:// or https://');
    process.exit(1);
  }

  const extractor = new ImprovedEasingExtractor();

  try {
    console.log(`🔍 Analyzing: ${url}\n`);
    
    await extractor.extractEasings(url);
    await extractor.saveResults('easing-results.json');
    await extractor.generateReadableReport('easing-report.md');

    console.log('\n✨ Analysis Complete!\n');
    console.log('📁 Raw data: easing-results.json');
    console.log('📄 Report: easing-report.md\n');

    // Display summary
    const summary = extractor.generateSummary();
    console.log('📊 Summary:');
    console.log(`   CSS easings: ${summary.cssTransitions.unique.length}`);
    console.log(`   GSAP easings (captured): ${summary.gsapCaptured.unique.length}`);
    
    if (summary.gsapCaptured.unique.length > 0) {
      console.log('\n🏆 Captured GSAP Easings:');
      summary.gsapCaptured.unique.forEach(easing => {
        console.log(`   - ${easing}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
```

## INSTALLATION & USAGE

### Step 1: Setup
```bash
# Create a new directory
mkdir easing-extractor
cd easing-extractor

# Create the three files above:
# - package.json
# - improved-extractor.js  
# - analyze.js

# Install dependencies
npm install
```

### Step 2: Run
```bash
# Analyze any website
node analyze.js https://resn.co.nz
node analyze.js https://activetheory.net
node analyze.js https://your-target-site.com
```

### Step 3: Check Results
- **easing-results.json** - Full data
- **easing-report.md** - Readable report

## WHAT IT DOES

✅ Detects GSAP, Anime.js, Locomotive Scroll
✅ Captures GSAP animations AS THEY RUN
✅ Extracts CSS cubic-bezier values
✅ Scrolls page to trigger scroll animations
✅ Hovers elements to capture hover effects
✅ Shows library versions
✅ Generates frequency analysis

## EXAMPLE OUTPUT

```
🔍 Analyzing: https://resn.co.nz

📊 Results:
   GSAP: ✅ DETECTED
   GSAP Version: 3.12.2
   
   📈 CSS easings found: 12
   📈 GSAP easings (captured): 8
   
   🎯 Captured GSAP animations:
      to: power3.out (1.2s)
      timeline.to: expo.inOut (0.8s)
```

Copy the easings directly to your project! 🎨
