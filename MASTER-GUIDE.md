# 🎨 Master Guide - Enhanced Awwwards Easing Extractor

## ✨ You Now Have Deep Animation Extraction Powers!

Your analyzer has been enhanced with powerful features to extract **Lenis smooth scroll**, **ScrollTrigger configurations**, **GSAP animations**, and **CSS animation details** from any website.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Analyze a Website
```bash
node analyze.js https://www.example.com
```

This creates two files:
- `single-site-results.json` - Raw technical data (14KB)
- `single-site-report.md` - Human-readable report (2KB)

### Step 2: View the Report
```bash
cat single-site-report.md
```

See what libraries are used, animation counts, and patterns.

### Step 3: Extract Specific Data
```bash
# Get GSAP animations
node extract-data.js gsap-animations single-site-results.json

# Get all easing functions
node extract-data.js easings single-site-results.json

# Get ScrollTrigger config
node extract-data.js scroll-triggers single-site-results.json
```

---

## 📊 What Gets Extracted

### 1. **Lenis Smooth Scroll** 🌊
```json
{
  "lenisDetected": true,
  "lenisInfo": {
    "smooth": true,
    "duration": "custom"
  }
}
```

### 2. **ScrollTrigger** 🔗
```json
{
  "scrollTriggerDetected": true,
  "scrollTriggerInfo": {
    "triggers": 19
  }
}
```

### 3. **GSAP Animations** 🎬
```json
{
  "gsapCaptured": [
    {
      "method": "to",
      "ease": "ease-secondary",
      "duration": 0.875,
      "stagger": 0.1
    }
  ],
  "gsapScrollTrigger": [
    {
      "method": "to",
      "ease": "power2.out",
      "duration": 1,
      "scrollTrigger": "{trigger: '.section'...}"
    }
  ]
}
```

### 4. **CSS Animations** 🎨
```json
{
  "transitions": [
    "cubic-bezier(0.16, 1, 0.3, 1)",
    "cubic-bezier(0.42, 0, 0.58, 1)"
  ],
  "animationDetails": [
    {
      "type": "transition",
      "property": "all",
      "duration": "0.3s",
      "timingFunction": "cubic-bezier(...)"
    }
  ]
}
```

### 5. **Element Patterns** 🎪
```json
{
  "elementPatterns": [
    {
      "tag": "DIV",
      "classes": "section scroll-trigger",
      "dataAttributes": "data-gsap=true; data-scroll=animate"
    }
  ]
}
```

---

## 🛠 All Available Commands

### Analyze Websites
```bash
# Single website
node analyze.js https://www.example.com

# Awwwards SOTD winners
node analyze.js awwwards

# Top agency sites
node analyze.js agencies

# E-commerce examples
node analyze.js ecommerce

# Portfolio sites
node analyze.js portfolios

# Analyze everything
node analyze.js all
```

### Extract Data
```bash
# All easing functions
node extract-data.js easings single-site-results.json

# GSAP animation code
node extract-data.js gsap-animations single-site-results.json

# ScrollTrigger configuration
node extract-data.js scroll-triggers single-site-results.json

# Lenis smooth scroll setup
node extract-data.js lenis-config single-site-results.json

# Animated element patterns
node extract-data.js element-patterns single-site-results.json

# Complete animation summary
node extract-data.js animation-summary single-site-results.json

# CSS animation details
node extract-data.js css-animations single-site-results.json

# Generate implementation code
node extract-data.js generate-code single-site-results.json > my-code.js
```

### Test & Troubleshoot
```bash
# Test Puppeteer connection
node test-puppeteer.js
```

---

## 📋 Implementation Workflow

### Scenario: You want to replicate animations from OH Architecture

#### 1. Analyze
```bash
node analyze.js https://www.oharchitecture.com.au/
```

#### 2. Review the Report
```bash
cat single-site-report.md
```

**Output shows:**
```
GSAP: ✅ DETECTED (v3.12.7)
ScrollTrigger: ✅ DETECTED (19 triggers)
Lenis: ✅ DETECTED

GSAP Standard Animations:
- ease: 'ease-secondary', duration: 0.875s, stagger: 0.1
```

#### 3. Extract Implementation Code
```bash
node extract-data.js generate-code single-site-results.json > animations.js
```

**Output:**
```javascript
// Generated implementation code
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Animation 1
gsap.to('.animate-1', {
  duration: 0.875,
  ease: 'ease-secondary',
  stagger: 0.1,
})

// ScrollTrigger Animation 1
gsap.to('.scroll-animate-1', {
  duration: 1,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.scroll-animate-1',
    start: 'top center',
    end: 'bottom center',
  }
})
```

#### 4. Get Easing Values
```bash
node extract-data.js easings single-site-results.json
```

**Output:**
```
CSS Easings:
  1. cubic-bezier(0.16, 1, 0.3, 1)
  2. cubic-bezier(0.42, 0, 0.58, 1)
  3. cubic-bezier(0.76, 0, 0.24, 1)

GSAP Easings:
  1. ease-secondary
```

#### 5. Get Lenis Setup
```bash
node extract-data.js lenis-config single-site-results.json
```

**Output:**
```javascript
import Lenis from 'lenis'

const lenis = new Lenis({
  smooth: true,
  duration: 1.2,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

#### 6. Implement on Your Site
```javascript
// 1. Install dependencies
// npm install gsap lenis

// 2. Setup Lenis
import Lenis from 'lenis'
const lenis = new Lenis({ smooth: true })

// 3. Setup GSAP
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// 4. Create animations with extracted values
gsap.to('.element', {
  ease: 'ease-secondary',    // extracted
  duration: 0.875,           // extracted
  stagger: 0.1,              // extracted
  scrollTrigger: {
    trigger: '.element',
    start: 'top center'
  }
})
```

---

## 📁 Project Structure

```
awwwards-easing-extractor/
├── analyze.js                 # Main CLI entry point
├── improved-extractor.js      # Enhanced extraction engine
├── extract-data.js            # Data extraction helper
├── test-puppeteer.js          # Connection test
│
├── README-ENHANCED.md         # Complete feature guide
├── FEATURES.md                # New features summary
├── EXTRACTION-GUIDE.md        # Detailed capabilities
│
└── Results (generated):
    ├── single-site-results.json   # Raw technical data
    └── single-site-report.md      # Human-readable report
```

---

## 💡 Pro Tips

### Tip 1: Batch Analyze Multiple Sites
```bash
node analyze.js awwwards
# Analyzes all Awwwards SOTD winners
# Creates results and report files
```

### Tip 2: Extract to Files
```bash
# Save animations as code
node extract-data.js generate-code results.json > animations.js

# Save easings as reference
node extract-data.js easings results.json > easings.txt

# Create animation summary
node extract-data.js animation-summary results.json > summary.txt
```

### Tip 3: Compare Sites
```bash
# Analyze Site A
node analyze.js https://site-a.com

# Get summary
node extract-data.js animation-summary single-site-results.json > site-a-summary.txt

# Analyze Site B
node analyze.js https://site-b.com

# Get summary
node extract-data.js animation-summary single-site-results.json > site-b-summary.txt

# Compare both files
diff site-a-summary.txt site-b-summary.txt
```

### Tip 4: Extract Specific Libraries
```bash
# Get only ScrollTrigger config
node extract-data.js scroll-triggers results.json | grep -A 5 "ScrollTrigger"

# Get only Lenis config
node extract-data.js lenis-config results.json

# Get element patterns
node extract-data.js element-patterns results.json
```

---

## 🎯 What Each File Does

| File | Purpose | Size |
|------|---------|------|
| `analyze.js` | Main analyzer CLI | 3.8K |
| `improved-extractor.js` | Extraction engine | 32K |
| `extract-data.js` | Data helper tool | 12K |
| `test-puppeteer.js` | Connection tester | 1.5K |
| `README-ENHANCED.md` | Feature guide | 8.6K |
| `FEATURES.md` | New features summary | 7.3K |
| `EXTRACTION-GUIDE.md` | Capabilities guide | 8.5K |

---

## ❓ FAQ

### Q: Why is my animation not being captured?
**A:** Make sure to:
- Scroll through the entire page
- Hover over interactive elements
- Wait for animations to load
- Check that animations aren't loaded dynamically

### Q: How do I use the extracted code?
**A:** 
1. Generate code: `node extract-data.js generate-code results.json`
2. Copy the output
3. Install dependencies: `npm install gsap lenis`
4. Paste code and customize selectors

### Q: Can I analyze multiple sites?
**A:** Yes! Use categories:
- `node analyze.js awwwards` - Multiple SOTD sites
- `node analyze.js agencies` - Agency sites
- `node analyze.js all` - Everything

### Q: What if ScrollTrigger doesn't show?
**A:** The extractor counts active triggers during analysis. If none show:
- The site may not use ScrollTrigger
- Triggers might load dynamically after scroll
- They might be hidden/inactive on initial load

### Q: How accurate is the extraction?
**A:** The tool captures:
- ✅ Active animations during page load and scroll
- ✅ GSAP method calls and configurations
- ✅ CSS animations and transitions
- ✅ Library versions
- ⚠️ Dynamic animations might be missed if they load after analysis

---

## 🚨 Troubleshooting

### Socket Hang Up Error
```bash
npm install puppeteer@latest
```

### Puppeteer Connection Failed
```bash
# Test connection
node test-puppeteer.js

# Check internet
ping google.com
```

### No Animations Found
- Increase wait time in code
- Try different URLs
- Check browser console for errors
- Ensure animations aren't cached

### Out of Memory
```bash
# Reduce analyzed sites or
node --max-old-space-size=4096 analyze.js url
```

---

## 📚 Documentation Files

- **FEATURES.md** - What's new, overview
- **README-ENHANCED.md** - Complete feature guide
- **EXTRACTION-GUIDE.md** - Technical details
- **This file** - Master guide & workflow
- **Code comments** - Inline documentation

---

## 🎉 You're Ready!

```bash
# Start extracting:
node analyze.js https://www.example.com

# View results:
cat single-site-report.md

# Extract animations:
node extract-data.js gsap-animations single-site-results.json

# Generate code:
node extract-data.js generate-code single-site-results.json
```

---

## 📞 Need Help?

1. Check documentation files
2. Run `node analyze.js` without arguments for help
3. Run `node extract-data.js --help` for extraction help
4. Test connection: `node test-puppeteer.js`

---

**Happy animating! 🚀**

Extract, learn, and replicate beautiful animations!
