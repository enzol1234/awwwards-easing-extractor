#!/usr/bin/env node

const ImprovedEasingExtractor = require('./improved-extractor');
const exampleSites = require('./example-sites');

async function main() {
  console.log('🎨 Awwwards Easing Extractor v2.0');
  console.log('🔥 Now with LIVE GSAP capture!\n');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const extractor = new ImprovedEasingExtractor();

  let sitesToAnalyze = [];
  let outputName = 'easing-results';

  if (args.length === 0) {
    console.log('💡 Usage:');
    console.log('  node analyze.js <URL>              - Analyze a single site');
    console.log('  node analyze.js awwwards           - Analyze Awwwards sites');
    console.log('  node analyze.js agencies           - Analyze top agencies');
    console.log('  node analyze.js all                - Analyze all categories\n');
    process.exit(0);
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
    console.error(`❌ Unknown option: ${args[0]}`);
    console.log('\nAvailable categories:', Object.keys(exampleSites).join(', '));
    console.log('Or provide a URL starting with http:// or https://');
    process.exit(1);
  }

  console.log(`📊 Total sites to analyze: ${sitesToAnalyze.length}`);
  console.log(`⏳ Features: CSS extraction + GSAP live capture + scroll triggers\n`);

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
    console.log(`   CSS easings: ${summary.cssTransitions.unique.length}`);
    console.log(`   GSAP easings (source): ${summary.gsapEasings.unique.length}`);
    console.log(`   GSAP easings (captured): ${summary.gsapCaptured.unique.length}`);
    console.log(`   Anime.js easings: ${summary.animeEasings.unique.length}`);
    
    // Show top easings
    const topCss = Object.entries(summary.cssTransitions.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topCss.length > 0) {
      console.log('\n🏆 Top 3 CSS Easings:');
      topCss.forEach(([easing, count], index) => {
        console.log(`   ${index + 1}. ${easing.substring(0, 40)}... (${count}x)`);
      });
    }

    const topGsap = Object.entries(summary.gsapCaptured.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topGsap.length > 0) {
      console.log('\n🎬 Top 3 Captured GSAP Easings:');
      topGsap.forEach(([easing, count], index) => {
        console.log(`   ${index + 1}. ${easing} (${count}x)`);
      });
    }

    console.log('\n💡 Tip: Check the markdown report for full details!\n');

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);
