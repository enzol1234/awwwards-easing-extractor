const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class EasingExtractor {
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
      
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`\n🔍 Analyzing: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for potential animations to initialize
      await page.waitForTimeout(2000);

      // Extract all easing functions from the page
      const easings = await page.evaluate(() => {
        const results = {
          css: {
            transitions: [],
            animations: []
          },
          javascript: {
            gsap: [],
            animejs: [],
            framerMotion: [],
            custom: []
          },
          source: window.location.href
        };

        // 1. Extract CSS Transitions and Animations
        const allElements = document.querySelectorAll('*');
        const cubicBezierRegex = /cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g;
        const namedEasings = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
        
        allElements.forEach(el => {
          const computed = window.getComputedStyle(el);
          
          // Transitions
          const transition = computed.transition;
          if (transition && transition !== 'all 0s ease 0s') {
            const matches = [...transition.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              if (!results.css.transitions.includes(bezier)) {
                results.css.transitions.push(bezier);
              }
            });
            
            // Check for named easings
            namedEasings.forEach(easing => {
              if (transition.includes(easing) && !results.css.transitions.includes(easing)) {
                results.css.transitions.push(easing);
              }
            });
          }

          // Animations
          const animation = computed.animation;
          if (animation && animation !== 'none 0s ease 0s 1 normal none running') {
            const matches = [...animation.matchAll(cubicBezierRegex)];
            matches.forEach(match => {
              const bezier = `cubic-bezier(${match[1]}, ${match[2]}, ${match[3]}, ${match[4]})`;
              if (!results.css.animations.includes(bezier)) {
                results.css.animations.push(bezier);
              }
            });
          }
        });

        // 2. Extract GSAP easings
        const scriptEls = Array.from(document.scripts || []);
        const anyScriptSrcMatches = (re) => scriptEls.some(s => re.test(String(s.src || '')));
        const anyInlineMatches = (re) => scriptEls.some(s => re.test(String(s.textContent || '')));

        const gsapDetected = (() => {
          if (typeof window.gsap !== 'undefined') return true;
          if (
            typeof window.TweenMax !== 'undefined' ||
            typeof window.TweenLite !== 'undefined' ||
            typeof window.TimelineMax !== 'undefined' ||
            typeof window.TimelineLite !== 'undefined'
          ) return true;
          if (anyScriptSrcMatches(/(gsap|greensock|tweenmax|tweenlite|scrolltrigger)/i)) return true;
          if (anyInlineMatches(/(\bgsap\b|CustomEase|ScrollTrigger|TweenMax|TweenLite)/i)) return true;
          try {
            const resources = performance.getEntriesByType?.('resource') || [];
            if (resources.some(r => /(gsap|greensock|scrolltrigger|tweenmax|tweenlite)/i.test(String(r.name || '')))) {
              return true;
            }
          } catch (e) {}
          return false;
        })();

        results.libraries = { gsapDetected };

        if (gsapDetected) {
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
          } catch (e) {
            console.error('GSAP extraction error:', e);
          }
        }

        // 3. Extract Anime.js easings
        if (window.anime) {
          try {
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
              const content = script.textContent;
              const animeEaseRegex = /easing:\s*["']([^"']+)["']/g;
              const matches = [...content.matchAll(animeEaseRegex)];
              matches.forEach(match => {
                if (!results.javascript.animejs.includes(match[1])) {
                  results.javascript.animejs.push(match[1]);
                }
              });
            });
          } catch (e) {
            console.error('Anime.js extraction error:', e);
          }
        }

        // 4. Extract Framer Motion easings (if React is used)
        try {
          const scripts = document.querySelectorAll('script');
          scripts.forEach(script => {
            const content = script.textContent;
            
            // Framer Motion transition patterns
            const framerEaseRegex = /ease:\s*\[([^\]]+)\]/g;
            const matches = [...content.matchAll(framerEaseRegex)];
            matches.forEach(match => {
              const easeArray = `[${match[1]}]`;
              if (!results.javascript.framerMotion.includes(easeArray)) {
                results.javascript.framerMotion.push(easeArray);
              }
            });

            // Named Framer easings
            const namedFramerRegex = /ease:\s*["']([^"']+)["']/g;
            const namedMatches = [...content.matchAll(namedFramerRegex)];
            namedMatches.forEach(match => {
              if (!results.javascript.framerMotion.includes(match[1])) {
                results.javascript.framerMotion.push(match[1]);
              }
            });
          });
        } catch (e) {
          console.error('Framer Motion extraction error:', e);
        }

        // 5. Extract custom JavaScript easings
        try {
          const scripts = document.querySelectorAll('script');
          scripts.forEach(script => {
            const content = script.textContent;
            
            // Look for custom easing functions
            const customFunctionRegex = /function\s+(\w*ease\w*)\s*\([^)]*\)\s*{/gi;
            const matches = [...content.matchAll(customFunctionRegex)];
            matches.forEach(match => {
              if (match[1] && !results.javascript.custom.includes(match[1])) {
                results.javascript.custom.push(match[1]);
              }
            });
          });
        } catch (e) {
          console.error('Custom easing extraction error:', e);
        }

        return results;
      });

      // Get site metadata
      const metadata = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          url: window.location.href
        };
      });

      const siteData = {
        ...metadata,
        easings,
        extractedAt: new Date().toISOString()
      };

      this.results.push(siteData);
      
      console.log(`✅ Found ${easings.css.transitions.length} CSS transitions`);
      console.log(`✅ Found ${easings.css.animations.length} CSS animations`);
      console.log(`✅ Found ${easings.javascript.gsap.length} GSAP easings`);
      if (easings.libraries?.gsapDetected) {
        console.log(`   └─ GSAP detected on page (heuristic)`);
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
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 3000));
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
    const allAnimations = [];
    const allGsap = [];
    const allAnime = [];
    const allFramer = [];

    this.results.forEach(site => {
      if (site && site.easings) {
        allTransitions.push(...site.easings.css.transitions);
        allAnimations.push(...site.easings.css.animations);
        allGsap.push(...site.easings.javascript.gsap);
        allAnime.push(...site.easings.javascript.animejs);
        allFramer.push(...site.easings.javascript.framerMotion);
      }
    });

    // Count frequency
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
      cssAnimations: {
        unique: [...new Set(allAnimations)],
        frequency: countFrequency(allAnimations)
      },
      gsapEasings: {
        unique: [...new Set(allGsap)],
        frequency: countFrequency(allGsap)
      },
      animeEasings: {
        unique: [...new Set(allAnime)],
        frequency: countFrequency(allAnime)
      },
      framerEasings: {
        unique: [...new Set(allFramer)],
        frequency: countFrequency(allFramer)
      }
    };
  }

  async generateReadableReport(filename = 'easing-report.md') {
    const summary = this.generateSummary();
    
    let report = `# Awwwards Easing Analysis Report\n\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Sites Analyzed: ${this.results.length}\n\n`;
    
    report += `## 🎯 Most Common CSS Transitions\n\n`;
    const sortedTransitions = Object.entries(summary.cssTransitions.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    sortedTransitions.forEach(([easing, count]) => {
      report += `- \`${easing}\` (used ${count}x)\n`;
    });
    
    report += `\n## 🎨 Most Common GSAP Easings\n\n`;
    const sortedGsap = Object.entries(summary.gsapEasings.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    sortedGsap.forEach(([easing, count]) => {
      report += `- \`${easing}\` (used ${count}x)\n`;
    });
    
    report += `\n## 📊 Site-by-Site Breakdown\n\n`;
    this.results.forEach((site, index) => {
      if (site) {
        report += `### ${index + 1}. ${site.title}\n`;
        report += `URL: ${site.url}\n\n`;
        report += `**CSS Transitions:** ${site.easings.css.transitions.length}\n`;
        report += `**CSS Animations:** ${site.easings.css.animations.length}\n`;
        report += `**GSAP Easings:** ${site.easings.javascript.gsap.length}\n\n`;
        
        if (site.easings.css.transitions.length > 0) {
          report += `CSS Transitions:\n`;
          site.easings.css.transitions.forEach(t => {
            report += `- \`${t}\`\n`;
          });
          report += `\n`;
        }
      }
    });

    await fs.writeFile(filename, report);
    console.log(`📄 Readable report saved to ${filename}`);
  }
}

// Main execution
async function main() {
  const extractor = new EasingExtractor();

  // Example Awwwards SOTD URLs - replace with actual SOTD URLs you want to analyze
  const awwwardsUrls = [
    'https://www.awwwards.com/sites/resn',
    'https://www.awwwards.com/sites/active-theory',
    // Add more SOTD URLs here
  ];

  // If you want to analyze actual winner sites (not awwwards.com pages),
  // use their actual URLs:
  const winnerSites = [
    'https://resn.co.nz/',
    'https://activetheory.net/',
    // Add actual SOTD winner URLs here
  ];

  console.log('Choose which URLs to analyze:');
  console.log('Using winner sites for better easing extraction...\n');

  await extractor.extractFromMultipleSites(winnerSites);
  await extractor.saveResults('easing-results.json');
  await extractor.generateReadableReport('easing-report.md');

  console.log('\n✨ Analysis complete!');
  console.log('📁 Check easing-results.json for raw data');
  console.log('📄 Check easing-report.md for readable report');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EasingExtractor;
