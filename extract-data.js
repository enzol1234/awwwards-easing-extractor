#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Animation Data Extractor Helper
 * Helps extract specific animation data from the JSON results
 * for easy implementation in your own projects
 */

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
📊 Animation Data Extractor Helper
═══════════════════════════════════════════════════════════════════════════════

Extract specific animation data from analysis results for easy replication.

Usage:
  node extract-data.js <command> [options]

Commands:
  
  easings [file]
    Extract all easing functions used
    Usage: node extract-data.js easings single-site-results.json
    
  gsap-animations [file]
    Extract all GSAP animations with their configs
    Usage: node extract-data.js gsap-animations single-site-results.json
    
  scroll-triggers [file]
    Extract ScrollTrigger configurations
    Usage: node extract-data.js scroll-triggers single-site-results.json
    
  lenis-config [file]
    Extract Lenis smooth scroll configuration
    Usage: node extract-data.js lenis-config single-site-results.json
    
  element-patterns [file]
    Extract element patterns and selectors
    Usage: node extract-data.js element-patterns single-site-results.json
    
  animation-summary [file]
    Show animation statistics and summary
    Usage: node extract-data.js animation-summary single-site-results.json
    
  css-animations [file]
    Extract CSS animation details
    Usage: node extract-data.js css-animations single-site-results.json
    
  generate-code [file]
    Generate implementation code snippets
    Usage: node extract-data.js generate-code single-site-results.json

Examples:
  node extract-data.js easings single-site-results.json
  node extract-data.js gsap-animations single-site-results.json > animations.js
  node extract-data.js element-patterns single-site-results.json
  node extract-data.js generate-code single-site-results.json > implementation.js
  `);
  process.exit(0);
}

const command = args[0];
const filename = args[1] || 'single-site-results.json';

if (!fs.existsSync(filename)) {
  console.error(`❌ File not found: ${filename}`);
  console.log('Make sure you run: node analyze.js <URL> first\n');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
const site = data.sites[0];

if (!site) {
  console.error('❌ No sites found in results');
  process.exit(1);
}

const easings = site.easings;

function extractEasings() {
  console.log('📚 All Easing Functions Found\n');
  console.log('CSS Easings:');
  easings.css.transitions.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e}`);
  });
  
  console.log('\nGSAP Easings:');
  const allGsapEasings = new Set([
    ...easings.javascript.gsapCaptured.map(a => a.ease),
    ...easings.javascript.gsapScrollTrigger.map(a => a.ease)
  ]);
  Array.from(allGsapEasings).forEach((e, i) => {
    console.log(`  ${i + 1}. ${e}`);
  });
}

function extractGsapAnimations() {
  console.log('🎬 GSAP Animations Extracted\n');
  
  if (easings.javascript.gsapCaptured.length > 0) {
    console.log('Standard GSAP Animations:\n');
    easings.javascript.gsapCaptured.forEach((anim, i) => {
      console.log(`// Animation ${i + 1}`);
      console.log(`gsap.${anim.method}('.selector', {`);
      console.log(`  ease: '${anim.ease}',`);
      console.log(`  duration: ${anim.duration},`);
      if (anim.delay) console.log(`  delay: ${anim.delay},`);
      if (anim.stagger) console.log(`  stagger: ${anim.stagger},`);
      console.log(`});\n`);
    });
  }
  
  if (easings.javascript.gsapScrollTrigger.length > 0) {
    console.log('\n\nScrollTrigger Animations:\n');
    easings.javascript.gsapScrollTrigger.forEach((anim, i) => {
      console.log(`// ScrollTrigger Animation ${i + 1}`);
      console.log(`gsap.${anim.method}('.selector', {`);
      console.log(`  ease: '${anim.ease}',`);
      console.log(`  duration: ${anim.duration},`);
      if (anim.scrollTrigger) {
        console.log(`  scrollTrigger: ${anim.scrollTrigger},`);
      }
      console.log(`});\n`);
    });
  }
}

function extractScrollTriggers() {
  console.log('🔗 ScrollTrigger Configuration\n');
  
  if (easings.libraries.scrollTriggerDetected) {
    console.log('✅ ScrollTrigger Detected\n');
    console.log(`Active Triggers: ${easings.libraries.scrollTriggerInfo.triggers}\n`);
  } else {
    console.log('❌ ScrollTrigger Not Used\n');
  }
  
  if (easings.javascript.gsapScrollTrigger.length > 0) {
    console.log('Configuration Patterns:\n');
    easings.javascript.gsapScrollTrigger.forEach((anim, i) => {
      console.log(`${i + 1}. ${anim.method} animation`);
      console.log(`   Ease: ${anim.ease}`);
      console.log(`   Duration: ${anim.duration}s`);
      if (anim.scrollTrigger) {
        console.log(`   Trigger: ${anim.scrollTrigger.substring(0, 80)}...`);
      }
      console.log('');
    });
  }
}

function extractLenisConfig() {
  console.log('🌊 Lenis Smooth Scroll Configuration\n');
  
  if (easings.libraries.lenisDetected) {
    console.log('✅ Lenis Detected\n');
    console.log('Configuration:');
    console.log(`  Smooth: ${easings.libraries.lenisInfo.smooth}`);
    console.log(`  Duration: ${easings.libraries.lenisInfo.duration}\n`);
    
    console.log('Implementation:');
    console.log(`\nimport Lenis from 'lenis'\n`);
    console.log(`const lenis = new Lenis({`);
    console.log(`  smooth: ${easings.libraries.lenisInfo.smooth},`);
    console.log(`  duration: 1.2, // adjust based on your preference`);
    console.log(`})\n`);
    console.log(`function raf(time) {`);
    console.log(`  lenis.raf(time)`);
    console.log(`  requestAnimationFrame(raf)`);
    console.log(`}\nrequestAnimationFrame(raf)`);
  } else {
    console.log('❌ Lenis Not Used on This Site\n');
  }
}

function extractElementPatterns() {
  console.log('🎪 Animated Element Patterns\n');
  
  if (easings.elementPatterns && easings.elementPatterns.length > 0) {
    console.log('Sample animated elements:\n');
    easings.elementPatterns.forEach((el, i) => {
      console.log(`${i + 1}. <${el.tag.toLowerCase()}>${el.classes ? ` class="${el.classes}"` : ''}${el.dataAttributes ? ` ${el.dataAttributes}` : ''}</>`);
    });
  } else {
    console.log('No element patterns found');
  }
  
  console.log('\nAnimation Pattern Info:');
  console.log(`Has Scroll Animations: ${easings.animationPatterns.hasScrollAnimations ? '✅' : '❌'}`);
  console.log(`Uses Data Attributes: ${easings.animationPatterns.hasDataAttributes ? '✅' : '❌'}`);
  console.log(`Uses CSS Classes: ${easings.animationPatterns.hasScrollClasses ? '✅' : '❌'}`);
}

function animationSummary() {
  console.log('📊 Animation Analysis Summary\n');
  
  console.log('🎨 Libraries:');
  console.log(`  GSAP v${easings.libraries.gsapVersion || 'unknown'}: ${easings.libraries.gsapDetected ? '✅' : '❌'}`);
  console.log(`  ScrollTrigger: ${easings.libraries.scrollTriggerDetected ? '✅' : '❌'} (${easings.libraries.scrollTriggerInfo?.triggers || 0} triggers)`);
  console.log(`  Lenis: ${easings.libraries.lenisDetected ? '✅' : '❌'}`);
  console.log(`  Anime.js: ${easings.libraries.animeDetected ? '✅' : '❌'}`);
  
  console.log('\n📈 Animation Counts:');
  console.log(`  CSS Easings: ${easings.css.transitions.length}`);
  console.log(`  CSS Animation Details: ${easings.css.animationDetails?.length || 0}`);
  console.log(`  GSAP Animations: ${easings.javascript.gsapCaptured.length}`);
  console.log(`  GSAP ScrollTrigger: ${easings.javascript.gsapScrollTrigger?.length || 0}`);
  console.log(`  Animated Elements: ${easings.animatedElementsCount || 0}`);
  
  console.log('\n⚙️ Features Used:');
  console.log(`  Stagger: ${easings.javascript.gsapCaptured.some(a => a.stagger) ? '✅' : '❌'}`);
  console.log(`  Custom Easing: ${easings.javascript.gsapCaptured.some(a => a.customEase) ? '✅' : '❌'}`);
  console.log(`  Timeline: ${easings.javascript.gsapCaptured.some(a => a.method.includes('timeline')) ? '✅' : '❌'}`);
}

function extractCssAnimations() {
  console.log('🎨 CSS Animation Details\n');
  
  if (easings.css.animationDetails && easings.css.animationDetails.length > 0) {
    console.log('CSS Animations/Transitions:\n');
    easings.css.animationDetails.slice(0, 15).forEach((detail, i) => {
      console.log(`${i + 1}. ${detail.type}`);
      if (detail.property) console.log(`   Property: ${detail.property}`);
      if (detail.animation) console.log(`   Animation: ${detail.animation}`);
      console.log(`   Duration: ${detail.duration}`);
      console.log(`   Timing: ${detail.timingFunction || detail.iterationCount}`);
      if (detail.delay) console.log(`   Delay: ${detail.delay}`);
      console.log('');
    });
  }
}

function generateCode() {
  console.log(`// Generated from: ${filename}`);
  console.log(`// Site: ${site.title}\n`);
  console.log(`// ========================================`);
  console.log(`// GSAP & ScrollTrigger Setup`);
  console.log(`// ========================================\n`);
  
  console.log(`import gsap from 'gsap'`);
  console.log(`import { ScrollTrigger } from 'gsap/ScrollTrigger'\n`);
  console.log(`gsap.registerPlugin(ScrollTrigger)\n`);
  
  if (easings.libraries.lenisDetected) {
    console.log(`// Lenis Setup`);
    console.log(`import Lenis from 'lenis'\n`);
    console.log(`const lenis = new Lenis({ smooth: true })\n`);
    console.log(`function raf(time) {`);
    console.log(`  lenis.raf(time)`);
    console.log(`  requestAnimationFrame(raf)`);
    console.log(`}\nrequestAnimationFrame(raf)\n`);
  }
  
  console.log(`// Define easing presets`);
  console.log(`const easings = {`);
  const uniqueEasings = new Set([
    ...easings.javascript.gsapCaptured.map(a => a.ease),
    ...easings.javascript.gsapScrollTrigger.map(a => a.ease),
    ...easings.css.transitions.map(e => e)
  ]);
  Array.from(uniqueEasings).slice(0, 10).forEach((e, i) => {
    console.log(`  ${i === 0 ? '' : ''}ease_${i}: '${e}',`);
  });
  console.log(`}\n`);
  
  console.log(`// GSAP Animations`);
  easings.javascript.gsapCaptured.slice(0, 5).forEach((anim, i) => {
    console.log(`\n// Animation ${i + 1}`);
    console.log(`gsap.${anim.method}('.animate-${i + 1}', {`);
    console.log(`  duration: ${anim.duration},`);
    console.log(`  ease: '${anim.ease}',`);
    if (anim.stagger) console.log(`  stagger: ${anim.stagger},`);
    console.log(`  // Add your properties here`);
    console.log(`})`);
  });
  
  if (easings.javascript.gsapScrollTrigger.length > 0) {
    console.log(`\n// ScrollTrigger Animations`);
    easings.javascript.gsapScrollTrigger.slice(0, 3).forEach((anim, i) => {
      console.log(`\ngsap.${anim.method}('.scroll-animate-${i + 1}', {`);
      console.log(`  duration: ${anim.duration},`);
      console.log(`  ease: '${anim.ease}',`);
      console.log(`  scrollTrigger: {`);
      console.log(`    trigger: '.scroll-animate-${i + 1}',`);
      console.log(`    start: 'top center',`);
      console.log(`    end: 'bottom center',`);
      console.log(`    // toggleActions: 'play pause resume pause'`);
      console.log(`  }`);
      console.log(`})`);
    });
  }
}

// Execute command
switch(command) {
  case 'easings':
    extractEasings();
    break;
  case 'gsap-animations':
    extractGsapAnimations();
    break;
  case 'scroll-triggers':
    extractScrollTriggers();
    break;
  case 'lenis-config':
    extractLenisConfig();
    break;
  case 'element-patterns':
    extractElementPatterns();
    break;
  case 'animation-summary':
    animationSummary();
    break;
  case 'css-animations':
    extractCssAnimations();
    break;
  case 'generate-code':
    generateCode();
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run: node extract-data.js --help');
    process.exit(1);
}
