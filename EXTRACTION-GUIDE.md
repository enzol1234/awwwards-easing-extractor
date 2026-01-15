#!/usr/bin/env node

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    ENHANCED FEATURE GUIDE                                  ║
║              Deep Animation Extraction Capabilities                         ║
╚════════════════════════════════════════════════════════════════════════════╝

🎯 WHAT'S EXTRACTED
═══════════════════════════════════════════════════════════════════════════════

1. 📚 ANIMATION LIBRARIES
   ✓ GSAP (with version detection)
   ✓ ScrollTrigger (with active trigger count)
   ✓ Lenis (smooth scroll detection)
   ✓ Anime.js
   ✓ Locomotive Scroll

2. 🎬 GSAP ANIMATIONS
   ✓ Standard animations (.to, .from, .fromTo)
   ✓ ScrollTrigger-based animations
   ✓ Easing functions (ease-secondary, power1, etc.)
   ✓ Duration and delay values
   ✓ Stagger patterns
   ✓ Custom easing functions
   ✓ Timeline-based animations

3. 🌊 SCROLL ANIMATIONS
   ✓ ScrollTrigger parameters (trigger, start, end, etc.)
   ✓ Scroll-linked animation properties
   ✓ Data attributes used for animation triggers
   ✓ CSS classes for scroll control
   ✓ Smooth scroll configuration (Lenis)

4. 🎨 CSS ANIMATIONS & TRANSITIONS
   ✓ Cubic-bezier easing functions
   ✓ Animation durations
   ✓ Transition delays
   ✓ Timing functions
   ✓ Animation iteration counts
   ✓ Keyframe names

5. 🎪 ELEMENT PATTERNS
   ✓ HTML elements with animations
   ✓ CSS classes on animated elements
   ✓ Data attributes (data-gsap, data-scroll, etc.)
   ✓ Element structure (tags, classes)

6. 📊 ANIMATION PATTERNS
   ✓ Has scroll-linked animations
   ✓ Uses data attributes for triggers
   ✓ Uses CSS classes for animation control
   ✓ Total count of animated elements

═══════════════════════════════════════════════════════════════════════════════

📖 SAMPLE OUTPUT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

{
  "libraries": {
    "gsapDetected": true,
    "gsapVersion": "3.12.7",
    "scrollTriggerDetected": true,
    "scrollTriggerInfo": {
      "available": true,
      "triggers": 19
    },
    "lenisDetected": true,
    "lenisInfo": {
      "smooth": true,
      "duration": "custom"
    }
  },
  
  "javascript": {
    "gsapCaptured": [
      {
        "method": "to",
        "ease": "ease-secondary",
        "duration": 0.875,
        "delay": 0,
        "stagger": 0.1,
        "scrollTrigger": null,
        "customEase": null
      }
    ],
    "gsapScrollTrigger": [
      {
        "method": "to",
        "ease": "power2.out",
        "duration": 1,
        "scrollTrigger": "{trigger: '.section', start: 'top 80%'}"
      }
    ]
  },
  
  "css": {
    "transitions": [
      "cubic-bezier(0.16, 1, 0.3, 1)",
      "cubic-bezier(0.42, 0, 0.58, 1)"
    ],
    "animationDetails": [
      {
        "type": "transition",
        "property": "all",
        "duration": "0.3s",
        "timingFunction": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    ]
  },
  
  "animationPatterns": {
    "hasScrollAnimations": true,
    "hasDataAttributes": true,
    "hasScrollClasses": true
  },
  
  "elementPatterns": [
    {
      "tag": "DIV",
      "classes": "section scroll-trigger",
      "dataAttributes": "data-gsap=true; data-scroll=animate"
    }
  ]
}

═══════════════════════════════════════════════════════════════════════════════

🚀 HOW TO USE FOR REPLICATION
═══════════════════════════════════════════════════════════════════════════════

1. RUN THE ANALYZER
   $ node analyze.js <URL>
   
   Examples:
   - Single site: node analyze.js https://example.com
   - Multiple categories: node analyze.js awwwards
   - All sites: node analyze.js all

2. REVIEW THE GENERATED FILES

   single-site-results.json
   └─ Raw data in JSON format
   └─ Import into your project
   └─ Has all animation properties and configurations
   
   single-site-report.md
   └─ Readable markdown report
   └─ Easy to share with team
   └─ Shows library versions, animation counts, easing values

3. EXTRACT REPLICATION DATA

   For ScrollTrigger animations:
   └─ Check 'gsapScrollTrigger' array
   └─ Look at trigger conditions
   └─ Copy easing and duration values
   └─ Note stagger patterns if used
   
   For Lenis setup:
   └─ Check 'lenisInfo' object
   └─ See if smooth scrolling is enabled
   └─ Note any custom duration settings
   
   For CSS animations:
   └─ Extract cubic-bezier values from 'css.transitions'
   └─ Use in your own CSS or GSAP animations
   └─ Match animation durations and delays

4. IMPLEMENT ON YOUR SITE

   // Install required libraries
   npm install gsap lenis
   
   // Setup Lenis (if detected)
   import Lenis from 'lenis'
   
   const lenis = new Lenis({
     // Use extracted config
   })
   
   // Setup GSAP with ScrollTrigger
   gsap.registerPlugin(ScrollTrigger)
   
   // Apply extracted animations
   gsap.to('.element', {
     ease: 'ease-secondary', // from extraction
     duration: 0.875,         // from extraction
     scrollTrigger: {
       trigger: '.element',
       start: 'top center',   // configure based on site behavior
     }
   })

═══════════════════════════════════════════════════════════════════════════════

💡 TIPS FOR BEST RESULTS
═══════════════════════════════════════════════════════════════════════════════

✓ Scroll through the entire page during analysis
  - More scrolling = more triggers captured
  - Hover over interactive elements
  - Try to trigger all animations

✓ Check both JSON and Markdown reports
  - JSON has all technical details
  - Markdown is better for documentation

✓ Look at 'elementPatterns' for DOM structure
  - Understand how elements are marked for animation
  - Copy similar class/data-attribute patterns

✓ ScrollTrigger triggers count shows animation complexity
  - Higher count = more sophisticated scroll interactions
  - Use as a reference for your site's complexity

✓ CSS animation details contain timing information
  - Use these as defaults for your GSAP animations
  - Match the easing for consistency

═══════════════════════════════════════════════════════════════════════════════

📊 REPORT INCLUDES
═══════════════════════════════════════════════════════════════════════════════

✓ Library overview (which sites use what)
✓ Library distribution (percentage of sites)
✓ Most common CSS easings
✓ GSAP easings (both standard and ScrollTrigger)
✓ Site-by-site breakdown with all extracted data
✓ Element patterns showing animation structure
✓ Animation details with durations and timing

═══════════════════════════════════════════════════════════════════════════════
`);
