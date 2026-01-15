# 🎨 Awwwards Easing Extractor - Enhanced Edition

> Deep animation and scroll behavior extraction tool for websites. Extract Lenis, ScrollTrigger, GSAP, and CSS animations to replicate them on your own site.

## ✨ What's New - Deep Analysis Features

### 🎬 Enhanced Animation Extraction

This enhanced version extracts **detailed animation configurations** to help you replicate complex interactive experiences:

#### 1. **ScrollTrigger Detection & Analysis**
- Detects active ScrollTrigger instances
- Counts scroll-triggered animations
- Extracts trigger parameters and configurations
- Shows scroll start/end points

#### 2. **Lenis Smooth Scroll Integration**
- Detects Lenis smooth scroll library
- Captures smooth scrolling settings
- Extracts custom duration configurations
- Identifies scroll behavior patterns

#### 3. **GSAP Animation Details**
- Captures all animation methods (to, from, fromTo)
- Extracts easing functions (ease-secondary, power1, power2, etc.)
- Tracks durations and delays
- Records stagger patterns
- Identifies custom easing functions

#### 4. **Scroll-Based Animations**
- Separates standard animations from scroll-triggered ones
- Analyzes ScrollTrigger-specific configurations
- Extracts animation targets and properties
- Shows animation triggers and conditions

#### 5. **CSS Animation Analysis**
- Extracts cubic-bezier easing functions
- Analyzes CSS transitions and animations
- Records timing functions and durations
- Shows animation iteration patterns

#### 6. **Element Pattern Recognition**
- Identifies animated elements by:
  - HTML tag type
  - CSS classes
  - Data attributes
- Shows common animation patterns
- Lists trigger selectors and classes

## 🚀 Installation

```bash
# Clone or download the project
cd awwwards-easing-extractor

# Install dependencies
npm install

# Upgrade to latest Puppeteer (important for stability)
npm install puppeteer@latest
```

## 📖 Usage

### Analyze a Single Website
```bash
node analyze.js https://www.example.com
```

### Analyze Multiple Sites from a Category
```bash
node analyze.js awwwards    # Awwwards SOTD winners
node analyze.js agencies    # Top agency sites
node analyze.js ecommerce   # E-commerce examples
node analyze.js portfolios  # Portfolio sites
```

### Analyze All Categories
```bash
node analyze.js all
```

## 📊 Output Files

After running analysis, you'll get:

### `single-site-results.json`
Complete technical data including:
- All detected libraries with versions
- GSAP animations (standard and ScrollTrigger)
- CSS animation details
- Element patterns and data attributes
- Animation counts and statistics

### `single-site-report.md`
Human-readable markdown report with:
- Library overview and distribution
- Top CSS easings
- GSAP animation details
- ScrollTrigger configuration
- Lenis smooth scroll settings
- Element patterns

## 📋 Extracted Data Structure

```json
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
        "scrollTrigger": null
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
      "classes": "section scroll-trigger fade-in",
      "dataAttributes": "data-gsap=true; data-scroll=animate"
    }
  ]
}
```

## 🎯 How to Use for Replication

### Step 1: Extract Data
```bash
node analyze.js https://target-website.com
```

### Step 2: Review the Generated Report
- Open `single-site-report.md` in your editor
- Note the libraries used and versions
- Check ScrollTrigger trigger count
- Review animation easings and durations

### Step 3: Extract Technical Details
- Open `single-site-results.json`
- Copy relevant GSAP configurations
- Extract easing functions and durations
- Note element patterns and selectors

### Step 4: Implement on Your Site

#### Setup Lenis (if detected)
```javascript
import Lenis from 'lenis'

const lenis = new Lenis({
  // Use settings from extracted data
  smooth: true,
  direction: 'vertical'
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

#### Setup GSAP with ScrollTrigger
```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Use extracted easing and durations
gsap.to('.element', {
  ease: 'ease-secondary',  // from extraction
  duration: 0.875,         // from extraction
  scrollTrigger: {
    trigger: '.element',
    start: 'top center',
    end: 'bottom center',
    markers: true  // for debugging
  }
})
```

#### Apply CSS Animations
```css
/* Use extracted cubic-bezier values */
.element {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

## 🔍 Features in Detail

### GSAP Animation Detection
- ✅ Standard animations (.to, .from, .fromTo)
- ✅ Timeline animations
- ✅ All easing functions (including custom)
- ✅ Stagger patterns
- ✅ Animation delays

### ScrollTrigger Analysis
- ✅ Active trigger count
- ✅ Trigger parameters (start, end, trigger element)
- ✅ Animation configs tied to scroll
- ✅ Scroll direction and marker support

### Lenis Integration
- ✅ Library detection
- ✅ Smooth scroll state
- ✅ Custom configuration options
- ✅ RAF integration patterns

### CSS Analysis
- ✅ All cubic-bezier functions
- ✅ Transition timing and duration
- ✅ Animation iteration count
- ✅ Keyframe animations

### Scroll Behavior
- ✅ Data attributes for animation triggers
- ✅ CSS classes for scroll control
- ✅ Element selector patterns
- ✅ Stagger and delay patterns

## 💡 Tips for Best Results

1. **Scroll through the entire page** during analysis
   - More scrolling = more scroll animations captured
   - Try to interact with elements

2. **Check both output files**
   - JSON for complete technical data
   - Markdown for documentation and sharing

3. **Look at element patterns**
   - Understand how the site marks animated elements
   - Copy similar class/attribute patterns

4. **ScrollTrigger count**
   - Indicates animation complexity
   - Higher count = more sophisticated interactions

5. **CSS Animation Details**
   - Use as reference for your GSAP configurations
   - Match easing for visual consistency

## 📊 Example Reports

The tool generates detailed reports showing:
- Library distribution across analyzed sites
- Most common easing functions
- GSAP animation patterns
- ScrollTrigger configurations
- Lenis smooth scroll setup
- Element patterns and selectors

## 🛠 Troubleshooting

### Socket Hang Up Error
- Ensure Puppeteer is up to date: `npm install puppeteer@latest`
- Check your internet connection
- Try analyzing a different URL

### Missing Animations
- Make sure you scroll through the page fully
- Hover over interactive elements
- Wait for page to fully load (the tool does this automatically)

### Library Not Detected
- The library might be loaded dynamically
- Check the page's network tab for script sources
- Some libraries might be bundled differently

## 📝 Files Included

- `improved-extractor.js` - Main extraction engine
- `analyze.js` - CLI entry point
- `EXTRACTION-GUIDE.md` - Detailed feature guide
- `test-puppeteer.js` - Puppeteer connectivity test
- `package.json` - Dependencies

## 🔄 Version History

### Enhanced Edition
- ✨ ScrollTrigger detection and analysis
- ✨ Lenis smooth scroll support
- ✨ GSAP animation interception
- ✨ CSS animation details extraction
- ✨ Element pattern recognition
- ✨ Scroll behavior analysis
- ✨ Comprehensive JSON export
- ✨ Detailed markdown reports

## 📄 License

MIT - Feel free to use and modify

## 🙏 Contributing

Found a bug or have an improvement? Feel free to submit issues or pull requests!

---

**Happy animating! 🚀**
