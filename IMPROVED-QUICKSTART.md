# 🚀 IMPROVED Easing Extractor - Quick Start

## What's New? 🔥

The **improved version** now:
- ✅ **Captures GSAP animations as they run** (not just from source code)
- ✅ Detects GSAP version
- ✅ Scrolls the page to trigger scroll animations
- ✅ Hovers over elements to capture hover animations
- ✅ Better detection of animation libraries

## Installation

```bash
npm install
```

## Quick Start

### Analyze a single site (RECOMMENDED)
```bash
node analyze.js https://resn.co.nz
```

### Analyze categories
```bash
node analyze.js agencies     # Top design agencies
node analyze.js awwwards     # Awwwards winners
node analyze.js all          # Everything
```

## Understanding the Output

You'll now see **TWO types of GSAP easings**:

### 1. GSAP (from source code)
- Found by parsing the JavaScript source
- May miss minified or bundled code
- Static analysis

### 2. GSAP (captured live) ⭐ NEW!
- Captured as animations actually run
- More reliable for production sites
- Shows the exact easing, duration, and method used

## Example Output

```
🔍 Analyzing: https://resn.co.nz

📊 Results:
   GSAP: ✅ DETECTED
   GSAP Version: 3.12.2
   Anime.js: ❌ Not found
   Locomotive Scroll: ✅ DETECTED

   📈 CSS easings found: 12
   📈 GSAP easings (source): 3
   📈 GSAP easings (captured): 8  👈 The good stuff!
   📈 Keyframes found: 5

   🎯 Captured GSAP animations:
      to: power3.out (1.2s)
      to: expo.inOut (0.8s)
      timeline.to: power4.out (1.4s)
```

## Why is "captured" better?

Modern award-winning sites use:
- **Webpack/Vite** - bundles code
- **Minification** - removes readable easing names
- **Dynamic imports** - loads animations on demand

The old method would miss most of these. The **new method** intercepts GSAP as it actually runs, so you get the real easings!

## Common Issues

### "No GSAP easings captured"

This can happen if:
1. **Site doesn't use GSAP** - Check if CSS easings were found instead
2. **Animations are lazy-loaded** - Try analyzing after scrolling manually
3. **Site uses different library** - Check for Anime.js or Framer Motion

### "GSAP detected but 0 captured"

The site has GSAP but animations didn't trigger. This means:
- Animations might be user-interaction only (click events)
- Animations are canvas/WebGL based (can't capture)
- Animations are in a different page section

**Solution**: The script automatically scrolls and hovers, but some animations need specific triggers.

## Pro Tips

### 1. Analyze similar sites
If you're building a portfolio, analyze other award-winning portfolios:
```bash
node analyze.js https://aristidebenoist.com
node analyze.js https://bruno-simon.com
```

### 2. Check the JSON for details
The JSON file includes:
- Library versions
- Animation methods (to, from, fromTo)
- Durations and delays
- Full easing strings

### 3. Test easings immediately
Copy easings from the report directly to your CSS:
```css
.my-element {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

Or GSAP:
```javascript
gsap.to('.my-element', {
  y: 0,
  duration: 1.2,
  ease: 'power3.out'  // From the captured data!
});
```

## Files Explained

- **`analyze.js`** - Main script (use this!)
- **`improved-extractor.js`** - The engine with GSAP interception
- **`example-sites.js`** - Pre-configured site lists
- **`[name]-results.json`** - Raw data output
- **`[name]-report.md`** - Human-readable report

## Real-World Example

Let's say you want to build an agency site:

```bash
# 1. Analyze top agencies
node analyze.js agencies

# 2. Open agencies-report.md
# 3. Look at "GSAP Easings (captured live)" section
# 4. Copy the most common easings
# 5. Use them in your project!
```

You'll likely see:
- `power3.out` - Smooth deceleration
- `power4.inOut` - Balanced, premium feel
- `expo.out` - Very smooth with long tail

These are the EXACT easings used on award-winning sites.

## Troubleshooting

**Script hangs or times out**
- Some sites are slow. Wait 60 seconds.
- Increase timeout in `improved-extractor.js` line 25

**Too many sites to analyze**
- Start with 1-3 sites
- Build your library gradually

**Want to see the browser?**
- Edit `improved-extractor.js` line 9
- Change `headless: 'new'` to `headless: false`

## Next Steps

1. ✅ Run your first analysis
2. ✅ Check the markdown report
3. ✅ Copy your favorite easings
4. ✅ Test in your project
5. ✅ Win that SOTD! 🏆

---

**The difference between good and GREAT animations? Using the right easings. Now you have them.** 🎨
