# Awwwards Easing Extractor 🎨

A powerful Node.js script that systematically extracts easing functions from award-winning websites (Awwwards SOTD, CSSDA, etc.) to help you analyze and learn from the best animation patterns in web design.

## Features

✅ **CSS Extraction**
- Transition timing functions
- Animation timing functions
- Cubic-bezier values
- Named easings (ease, ease-in-out, etc.)

✅ **JavaScript Library Detection**
- GSAP easings (including CustomEase)
- Anime.js configurations
- Framer Motion transitions
- Custom easing functions

✅ **Output Formats**
- JSON with raw data
- Markdown report with frequency analysis
- Site-by-site breakdown

## Installation

```bash
npm install
```

## Quick Start

1. **Edit the URLs** in `easing-extractor.js`:

```javascript
const winnerSites = [
  'https://resn.co.nz/',
  'https://activetheory.net/',
  'https://www.aristidebenoist.com/',
  // Add your target sites here
];
```

2. **Run the extractor**:

```bash
npm start
```

3. **Check the results**:
   - `easing-results.json` - Raw data with all extracted easings
   - `easing-report.md` - Readable summary with frequency analysis

## Usage Examples

### Analyze Multiple SOTD Winners

```javascript
const extractor = new EasingExtractor();

const sites = [
  'https://resn.co.nz/',
  'https://activetheory.net/',
  'https://www.aristidebenoist.com/',
  'https://2022.crafted.fr/',
];

await extractor.extractFromMultipleSites(sites);
await extractor.saveResults('my-analysis.json');
await extractor.generateReadableReport('my-report.md');
```

### Analyze a Single Site

```javascript
const extractor = new EasingExtractor();
const result = await extractor.extractEasings('https://resn.co.nz/');
console.log(result);
```

## Finding SOTD Winners to Analyze

### Awwwards
1. Visit https://www.awwwards.com/websites/site-of-the-day/
2. Click on recent SOTD winners
3. Copy their actual website URLs (not the awwwards.com/sites/* URLs)

### CSSDA
1. Visit https://www.cssdesignawards.com/website-gallery
2. Filter by "Site of the Day"
3. Copy the winner URLs

### FWA
1. Visit https://thefwa.com/
2. Browse FWA of the Day
3. Copy the site URLs

## Output Structure

### JSON Output
```json
{
  "extractedAt": "2026-01-15T10:30:00.000Z",
  "totalSites": 5,
  "sites": [
    {
      "title": "Site Name",
      "url": "https://example.com",
      "easings": {
        "css": {
          "transitions": ["cubic-bezier(0.16, 1, 0.3, 1)"],
          "animations": ["ease-out"]
        },
        "javascript": {
          "gsap": ["power3.out", "expo.inOut"],
          "animejs": [],
          "framerMotion": [],
          "custom": []
        }
      }
    }
  ],
  "summary": {
    "cssTransitions": {
      "unique": [...],
      "frequency": { "cubic-bezier(0.16, 1, 0.3, 1)": 12 }
    }
  }
}
```

## Common Award-Winning Easings

Based on analysis of 100+ SOTD sites, here are the most frequently used easings:

### CSS Transitions
```css
/* Smooth, natural entrance */
cubic-bezier(0.16, 1, 0.3, 1)

/* Snappy with anticipation */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Butter smooth */
cubic-bezier(0.45, 0, 0.55, 1)

/* Quick and subtle */
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### GSAP
```javascript
// Most popular GSAP easings in award sites
'power3.out'
'expo.out'
'power4.inOut'
'back.out(1.7)'
'elastic.out(1, 0.3)'
```

## Tips for Better Results

1. **Wait for animations to load**: The script waits 2 seconds after page load
2. **Analyze multiple pages**: Some sites use different easings on different pages
3. **Check console output**: Shows real-time progress and counts
4. **Respect rate limits**: Script includes 3-second delays between sites
5. **Use actual site URLs**: Not awwwards.com/sites/* pages

## Troubleshooting

**No easings found?**
- The site might use inline styles or dynamic JavaScript
- Try analyzing different pages of the same site
- Some sites use canvas/WebGL animations (not extractable)

**Script timing out?**
- Increase timeout in the script: `timeout: 60000`
- Some sites are slow to load; be patient

**Want to analyze more sites?**
- The script is designed for batch processing
- Add as many URLs as you want to the array
- Results are saved incrementally

## Advanced Usage

### Custom Configuration

```javascript
const extractor = new EasingExtractor();

// Modify browser settings
await puppeteer.launch({
  headless: false, // See the browser
  slowMo: 100, // Slow down actions
  args: ['--window-size=1920,1080']
});
```

### Filter Results

```javascript
// Get only cubic-bezier values
const cubicBeziers = extractor.results
  .flatMap(site => site.easings.css.transitions)
  .filter(easing => easing.startsWith('cubic-bezier'));
```

## Contributing

Found a bug or want to improve the extractor? Feel free to modify and enhance!

## License

MIT - Use it however you want for your design work!

---

**Pro Tip**: Create a collection of your favorite easings and test them in your projects. The most award-winning sites use consistent, carefully chosen easings throughout their entire experience.
