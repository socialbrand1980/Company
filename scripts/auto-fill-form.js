#!/usr/bin/env node

/**
 * Script to generate 50 dummy leads by auto-filling Work With Us form
 * Uses Puppeteer to automate browser form submission
 * 
 * Prerequisites:
 * npm install puppeteer
 * 
 * Run with: node scripts/auto-fill-form.js
 */

const puppeteer = require('puppeteer');

// Configuration
const FORM_URL = 'http://localhost:3000/work-with-us';
const TOTAL_SUBMISSIONS = 50;
const DELAY_BETWEEN_SUBMISSIONS = 2000; // 2 seconds

// Dummy data arrays
const brands = [
  'TechVision', 'StyleHub', 'FoodieBox', 'BeautyGlow', 'FitLife',
  'EcoGreen', 'SmartHome', 'UrbanWear', 'TravelBug', 'GameZone',
  'HealthPlus', 'ArtSpace', 'MusicFlow', 'PetCare', 'BookNook',
  'CraftCorner', 'PhotoPro', 'DesignLab', 'CodeCraft', 'DataDrive'
];

const industries = [
  'Technology', 'Fashion', 'Food & Beverage', 'Health & Beauty',
  'E-commerce', 'Education', 'Entertainment', 'Lifestyle'
];

const services = [
  'Social Media Management',
  'Content Production',
  'Performance Marketing',
  'Brand Strategy',
  'Influencer Marketing',
  'SEO & Content Marketing'
];

const names = [
  'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams',
  'David Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson',
  'Tom Martinez', 'Amy Taylor', 'James Thomas', 'Maria Garcia',
  'Robert Lee', 'Jennifer White', 'William Harris', 'Linda Clark'
];

const roles = ['Founder', 'CEO', 'Marketing Manager', 'Owner', 'Director'];
const teamSizes = ['1-5', '6-20', '21-50', '51-200', '200+'];
const timelines = ['Immediately', 'Within 1 month', '1 – 3 months', 'Just exploring'];
const markets = ['Indonesia', 'Southeast Asia', 'Global', 'Asia Pacific'];
const runAdsOptions = ['Yes', 'No'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBudget() {
  const budgets = ['5000000', '10000000', '15000000', '25000000', '50000000', '75000000', '100000000'];
  return randomItem(budgets);
}

function generateDummyData(index) {
  const brand = randomItem(brands);
  const name = randomItem(names);
  
  return {
    brandName: `${brand} ${String.fromCharCode(65 + (index % 26))}${index + 1}`,
    website: `https://${brand.toLowerCase()}${index}.com`,
    industry: randomItem(industries),
    targetMarket: randomItem(markets),
    yearFounded: String(2015 + Math.floor(Math.random() * 9)),
    teamSize: randomItem(teamSizes),
    primaryGoal: randomItem([
      'Increase brand awareness and generate 100 leads per month',
      'Launch new product and achieve 50% market penetration',
      'Scale existing campaigns and improve ROI by 30%',
      'Build strong online presence and engage with target audience',
      'Drive sales growth and expand to new markets'
    ]),
    runAds: randomItem(runAdsOptions),
    channels: [
      randomItem(services),
      randomItem(['Meta Ads', 'Google Ads', 'TikTok Ads', 'SEO', 'Email Marketing'])
    ].join(', '),
    budget: randomBudget(),
    targetAudience: randomItem([
      'Millennials aged 25-40 interested in lifestyle products',
      'Business owners and entrepreneurs looking for solutions',
      'Young professionals aged 22-35 in urban areas',
      'Parents aged 30-45 interested in family products'
    ]),
    competitors: randomItem([
      'Competitor A, Competitor B',
      'Local brands and international competitors',
      'Direct competitors in the same niche',
      'N/A'
    ]),
    timeline: randomItem(timelines),
    servicesNeeded: [
      randomItem(services),
      randomItem(services)
    ].join(', '),
    fullname: name,
    email: `${name.toLowerCase().replace(' ', '.')}@${brand.toLowerCase()}.com`,
    phone: `08${Math.floor(Math.random() * 90000000 + 10000000)}`,
    role: randomItem(roles)
  };
}

async function fillForm(page, data, index) {
  try {
    console.log(`\n📝 Filling form #${index + 1}: ${data.brandName}`);
    
    // Wait for form to load
    await page.waitForSelector('input[placeholder="Your brand name"]', { timeout: 10000 });
    
    // Fill Brand Information
    await page.type('input[placeholder="Your brand name"]', data.brandName);
    await page.type('input[placeholder="https://yourbrand.com"]', data.website);
    
    // Select Industry
    await page.click('select');
    await page.select('select', data.industry);
    
    // Fill Target Market
    await page.type('input[placeholder="e.g., Indonesia, Southeast Asia"]', data.targetMarket);
    
    // Fill Year Founded
    await page.type('input[placeholder="e.g., 2020"]', data.yearFounded);
    
    // Select Team Size
    const teamSizeSelects = await page.$$('select');
    if (teamSizeSelects.length > 0) {
      await teamSizeSelects[0].select(data.teamSize);
    }
    
    // Fill Primary Goal (textarea)
    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].evaluate(el => el.value = '');
      await textareas[0].type(data.primaryGoal);
    }
    
    // Select Run Ads
    const radioLabels = await page.$$eval('label', labels => 
      labels.filter(l => l.textContent.includes('Yes') || l.textContent.includes('No'))
    );
    if (radioLabels.length > 0) {
      const yesRadio = await page.$('input[type="radio"][value="Yes"]');
      const noRadio = await page.$('input[type="radio"][value="No"]');
      if (data.runAds === 'Yes' && yesRadio) {
        await yesRadio.click();
      } else if (noRadio) {
        await noRadio.click();
      }
    }
    
    // Fill Budget
    const budgetInput = await page.$('input[placeholder="5.000.000"]');
    if (budgetInput) {
      await budgetInput.evaluate(el => el.value = '');
      await budgetInput.type(data.budget);
    }
    
    // Select Timeline
    const timelineSelects = await page.$$('select');
    if (timelineSelects.length > 1) {
      await timelineSelects[1].select(data.timeline);
    }
    
    // Fill Target Audience
    if (textareas.length > 1) {
      await textareas[1].evaluate(el => el.value = '');
      await textareas[1].type(data.targetAudience);
    }
    
    // Fill Competitors
    if (textareas.length > 2) {
      await textareas[2].evaluate(el => el.value = '');
      await textareas[2].type(data.competitors);
    }
    
    // Fill Services Needed
    if (textareas.length > 3) {
      await textareas[3].evaluate(el => el.value = '');
      await textareas[3].type(data.servicesNeeded);
    }
    
    // Fill Contact Information
    await page.type('input[placeholder="Your full name"]', data.fullname);
    await page.type('input[placeholder="e.g., Founder, Marketing Manager"]', data.role);
    await page.type('input[placeholder="your@email.com"]', data.email);
    await page.type('input[placeholder="08123456789"]', data.phone);
    
    console.log(`✅ Form filled for ${data.brandName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error filling form: ${error.message}`);
    return false;
  }
}

async function submitForm(page, index) {
  try {
    // Find and click submit button
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      
      // Wait for success message or redirect
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      
      console.log(`✅ Successfully submitted form #${index + 1}`);
      return true;
    } else {
      console.error('❌ Submit button not found');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error submitting form: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting auto-fill script...\n');
  console.log(`📊 Target: ${TOTAL_SUBMISSIONS} submissions`);
  console.log(`🌐 URL: ${FORM_URL}`);
  console.log(`⏱️  Delay: ${DELAY_BETWEEN_SUBMISSIONS / 1000}s between submissions\n`);
  
  let browser;
  let successCount = 0;
  let failCount = 0;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to form
    console.log(`📍 Navigating to ${FORM_URL}...`);
    await page.goto(FORM_URL, { waitUntil: 'networkidle0' });
    
    console.log('✅ Form loaded successfully\n');
    
    // Submit 50 times
    for (let i = 0; i < TOTAL_SUBMISSIONS; i++) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Submission ${i + 1}/${TOTAL_SUBMISSIONS}`);
      console.log('='.repeat(50));
      
      // Generate dummy data
      const data = generateDummyData(i);
      
      // Fill form
      const filled = await fillForm(page, data, i);
      
      if (filled) {
        // Submit form
        const submitted = await submitForm(page, i);
        
        if (submitted) {
          successCount++;
          
          // Navigate back to form if redirected
          if (page.url() !== FORM_URL) {
            await page.goto(FORM_URL, { waitUntil: 'networkidle0' });
          }
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
      
      // Delay between submissions
      if (i < TOTAL_SUBMISSIONS - 1) {
        console.log(`\n⏱️  Waiting ${DELAY_BETWEEN_SUBMISSIONS / 1000}s before next submission...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SUBMISSIONS));
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Auto-fill Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(50));
    console.log('\n📊 Check your Google Sheets and CRM to see the new leads!');
    console.log('🔗 Visit /crm/pipeline to see the data in action\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
main().catch(console.error);
