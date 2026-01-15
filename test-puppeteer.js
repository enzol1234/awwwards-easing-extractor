#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function test() {
  console.log('Testing Puppeteer connection...\n');
  
  let browser;
  try {
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('✅ Browser launched');
    
    console.log('2. Creating page...');
    const page = await browser.newPage();
    console.log('✅ Page created');
    
    console.log('3. Attempting to navigate to example.com...');
    try {
      await page.goto('https://example.com', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      console.log('✅ Navigation successful');
    } catch (e) {
      console.log('❌ Navigation failed:', e.message);
      console.log('\nTrying alternative approach: using blank page...');
      
      await page.goto('about:blank');
      console.log('✅ Can load about:blank');
    }
    
    await page.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nThis might be a system/network issue.');
    console.error('Try:');
    console.error('  1. Check your internet connection');
    console.error('  2. Try: npm install puppeteer@latest');
    console.error('  3. Check for firewall/proxy issues');
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
  }
}

test();
