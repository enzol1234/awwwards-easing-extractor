#!/usr/bin/env node

const EasingExtractor = require('./easing-extractor');
const exampleSites = require('./example-sites');

async function main() {
  console.log('🎨 Awwwards Easing Extractor\n');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const extractor = new EasingExtractor();

  // Default to analyzing agency sites if no args provided
  let sitesToAnalyze = [];
  let outputName = 'easing-results';

  if (args.length === 0) {
    console.log('💡 No arguments provided. Analyzing agency sites...\n');
    console.log('Usage examples:');
    console.log('  node run.js awwwards     - Analyze Awwwards SOTD winners');
    console.log('  node run.js agencies     - Analyze top agencies');
    console.log('  node run.js all          - Analyze all categories');
    console.log('  node run.js <url>        - Analyze a single URL\n');
    
    sitesToAnalyze = exampleSites.agencies;
    outputName = 'agencies';
  } else if (args[0] === 'all') {
    console.log('🚀 Analyzing ALL sites (this will take a while)...\n');
    sitesToAnalyze = [
      ...exampleSites.awwwards,
      ...exampleSites.agencies,
      ...exampleSites.ecommerce,
      ...exampleSites.portfolios
    ];
    outputName = 'complete-analysis';
  } else if (exampleSites[args[0]]) {
    console.log(`🎯 Analyzing ${args[0]} sites...\n`);
    sitesToAnalyze = exampleSites[args[0]];
    outputName = args[0];
  } else if (args[0].startsWith('http')) {
    console.log(`🔍 Analyzing single site: ${args[0]}\n`);
    sitesToAnalyze = [args[0]];
    outputName = 'single-site';
  } else {
    console.error(`❌ Unknown category: ${args[0]}`);
    console.log('\nAvailable categories:');
    Object.keys(exampleSites).forEach(cat => {
      console.log(`  - ${cat}`);
    });
    process.exit(1);
  }

  console.log(`📊 Total sites to analyze: ${sitesToAnalyze.length}\n`);
  console.log('⏳ This may take a few minutes...\n');

  try {
    await extractor.extractFromMultipleSites(sitesToAnalyze);
    await extractor.saveResults(`${outputName}-results.json`);
    await extractor.generateReadableReport(`${outputName}-report.md`);

    console.log('\n✨ ================================');
    console.log('✨ Analysis Complete!');
    console.log('✨ ================================\n');
    console.log(`📁 Raw data: ${outputName}-results.json`);
    console.log(`📄 Report: ${outputName}-report.md\n`);

    // Display quick summary
    const summary = extractor.generateSummary();
    console.log('📊 Quick Summary:');
    console.log(`   Total unique CSS transitions: ${summary.cssTransitions.unique.length}`);
    console.log(`   Total unique GSAP easings: ${summary.gsapEasings.unique.length}`);
    
    const topTransitions = Object.entries(summary.cssTransitions.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topTransitions.length > 0) {
      console.log('\n🏆 Top 3 Most Common Easings:');
      topTransitions.forEach(([easing, count], index) => {
        console.log(`   ${index + 1}. ${easing} (${count}x)`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
