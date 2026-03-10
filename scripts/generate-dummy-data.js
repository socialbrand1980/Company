#!/usr/bin/env node

/**
 * Script to generate 50 dummy leads for Work With Us form
 * Run with: node scripts/generate-dummy-data.js
 */

const SHEET_ID = '13ruAstGIxEl9y-9BQ1eWJsfTkYiwPAYK5obLug2q7N0';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXg7tWwFqqDca60Ex3gAx_uQybHACzyk-VrDgOu17OuF-NOwo5llYnIf8Cjuzo86NW/exec';

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

const statuses = [
  'New', 'New', 'New', 'Contacted', 'Contacted',
  'Discovery Call', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'
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

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBudget() {
  const budgets = [5000000, 10000000, 15000000, 25000000, 50000000, 75000000, 100000000];
  return randomItem(budgets);
}

function randomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return date;
}

function generateGoogleSheetsDate(date) {
  // Format: Date(year, month, day, hour, minute, second)
  // Note: Google Sheets uses 0-indexed months
  return `Date(${date.getFullYear()},${date.getMonth()},${date.getDate()},${date.getHours()},${date.getMinutes()},${date.getSeconds()})`;
}

function generateDummyLead(index) {
  const date = randomDate();
  const brand = randomItem(brands);
  const name = randomItem(names);
  
  return {
    brandName: `${brand} ${String.fromCharCode(65 + (index % 26))}${index + 1}`,
    website: `https://${brand.toLowerCase()}${index}.com`,
    industry: randomItem(industries),
    targetMarket: randomItem(['Indonesia', 'Southeast Asia', 'Global', 'Asia Pacific']),
    yearFounded: String(2015 + Math.floor(Math.random() * 9)),
    teamSize: randomItem(['1-5', '6-20', '21-50', '51-200']),
    primaryGoal: randomItem([
      'Increase brand awareness and generate 100 leads per month',
      'Launch new product and achieve 50% market penetration',
      'Scale existing campaigns and improve ROI by 30%',
      'Build strong online presence and engage with target audience',
      'Drive sales growth and expand to new markets'
    ]),
    runAds: randomItem(['Yes', 'No']),
    channels: [
      randomItem(services),
      randomItem(services),
      randomItem(['Meta Ads', 'Google Ads', 'TikTok Ads', 'SEO'])
    ].filter((v, i, a) => a.indexOf(v) === i).join(', '),
    budget: randomBudget(),
    targetAudience: randomItem([
      'Millennials aged 25-40 interested in lifestyle products',
      'Business owners and entrepreneurs looking for solutions',
      'Young professionals aged 22-35 in urban areas',
      'Parents aged 30-45 interested in family products'
    ]),
    competitors: randomItem([
      'Competitor A, Competitor B, Market Leader C',
      'Local brands and international competitors',
      'Direct competitors in the same niche',
      'N/A'
    ]),
    timeline: randomItem(['Immediately', 'Within 1 month', '1-3 months', 'Just exploring']),
    servicesNeeded: [
      randomItem(services),
      randomItem(services)
    ].join(', '),
    fullname: name,
    email: `${name.toLowerCase().replace(' ', '.')}@${brand.toLowerCase()}.com`,
    phone: `08${Math.floor(Math.random() * 90000000 + 10000000)}`,
    role: randomItem(['Founder', 'CEO', 'Marketing Manager', 'Owner', 'Director']),
    leadstatus: randomItem(statuses),
    notes: `Dummy lead #${index + 1} - Generated for testing`,
    timestamp: generateGoogleSheetsDate(date)
  };
}

async function submitLead(leadData) {
  try {
    // Add action parameter for Apps Script
    const payload = {
      action: 'create',
      ...leadData
    };
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Successfully submitted: ${leadData.brandName}`);
      return true;
    } else {
      console.error(`❌ Failed to submit: ${leadData.brandName}`);
      console.error('Error:', result.error || result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error submitting ${leadData.brandName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Generating 50 dummy leads...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < 50; i++) {
    const leadData = generateDummyLead(i);
    const success = await submitLead(leadData);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n=================================');
  console.log('✅ Generation Complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('=================================\n');
  console.log('📊 Check your Google Sheets to see the new leads!');
  console.log('🔗 Visit /crm/pipeline to see the data in action\n');
}

// Run the script
main().catch(console.error);
