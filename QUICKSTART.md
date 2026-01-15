# 🚀 Quick Start Guide

Get up and running in 60 seconds!

## Installation

```bash
# 1. Install dependencies
npm install

# 2. That's it! You're ready to go.
```

## Basic Usage

```bash
# Analyze top design agencies
node run.js agencies

# Analyze Awwwards SOTD winners
node run.js awwwards

# Analyze ALL sites (takes longer)
node run.js all

# Analyze a specific site
node run.js https://resn.co.nz
```

## Customize Your Analysis

### Option 1: Edit example-sites.js

```javascript
// Add your favorite award sites
awwwards: [
  'https://your-favorite-site.com',
  'https://another-award-winner.com',
]
```

### Option 2: Direct URL

```bash
node run.js https://your-site.com
```

## Understanding the Output

After running, you'll get two files:

### 1. `[category]-results.json`
Raw data with all extracted easings. Perfect for:
- Importing into your own tools
- Programmatic analysis
- Building easing libraries

### 2. `[category]-report.md`
Human-readable report with:
- Most common easings (ranked by frequency)
- Site-by-site breakdown
- Category summaries

## Pro Tips

### Finding Great Sites to Analyze

**Awwwards SOTD**
1. Visit: https://www.awwwards.com/websites/site-of-the-day/
2. Click any winner
3. Find "Visit site" button
4. Copy that URL

**CSSDA**
1. Visit: https://www.cssdesignawards.com/website-gallery
2. Filter by awards
3. Copy site URLs (not the cssdesignawards.com URLs)

**Your Competitors**
- Analyze your competition's animations
- Learn what makes them award-worthy

### Best Practices

1. **Start Small**: Analyze 3-5 sites first
2. **Be Specific**: Target sites similar to your project
3. **Run at Off-Peak**: Some sites load faster at certain times
4. **Take Notes**: Document what you like about each easing

### Troubleshooting

**"No easings found"**
- Site might use inline styles
- Try different pages of the same site
- Some use canvas/WebGL (can't extract)

**Script timing out**
- Increase timeout in easing-extractor.js (line 23)
- Site might be very slow to load

**Want more sites?**
- Edit example-sites.js
- Add as many as you want!

## Next Steps

1. ✅ Run your first analysis
2. ✅ Check the report
3. ✅ Test easings in your project
4. ✅ Build your personal easing library

## Example Workflow

```bash
# 1. Analyze your favorite award sites
node run.js awwwards

# 2. Check the report
cat awwwards-report.md

# 3. Copy easings you like to your CSS
# Example from report:
# cubic-bezier(0.16, 1, 0.3, 1) - used 15x

# 4. Test in your project
.my-element {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Need Help?

- Check README.md for full documentation
- See EASING-REFERENCE.md for curated easings
- Modify easing-extractor.js for custom behavior

---

**Ready to win that SOTD? Start analyzing! 🏆**

```bash
npm install && node run.js agencies
```
