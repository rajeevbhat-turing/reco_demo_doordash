#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const verifiersPath = path.join(__dirname, '../config/flow-verifiers.json');
const verifiers = JSON.parse(fs.readFileSync(verifiersPath, 'utf8'));

const args = process.argv.slice(2);
const command = args[0];
const target = args[1];

function listVerifiers() {
  const flows = Object.entries(verifiers.flows);
  const categories = [...new Set(flows.map(([_, flow]) => flow.category))];
  
  console.log('\n=== VERIFIER CATEGORIES ===');
  categories.forEach(cat => {
    const count = flows.filter(([_, flow]) => flow.category === cat).length;
    console.log(`  ${cat}: ${count} verifiers`);
  });
  
  console.log('\n=== ALL VERIFIERS ===');
  flows.forEach(([id, flow]) => {
    console.log(`  [${flow.category}] ${id}`);
    console.log(`    ${flow.description}`);
  });
}

function analyzeVerifier(flowId) {
  const flow = verifiers.flows[flowId];
  if (!flow) {
    console.error(`❌ Verifier '${flowId}' not found`);
    return;
  }
  
  console.log(`\n=== ANALYZING VERIFIER: ${flowId} ===`);
  console.log(`Category: ${flow.category}`);
  console.log(`Description: ${flow.description}`);
  console.log('\n=== VERIFIER CODE ===');
  console.log(flow.verifier);
  
  // Analyze the verifier logic
  const code = flow.verifier;
  
  console.log('\n=== ANALYSIS ===');
  
  // Check what it's looking for
  if (code.includes('cart.length')) {
    const match = code.match(/cart\.length\s*===\s*(\d+)/);
    if (match) {
      console.log(`✓ Expects exactly ${match[1]} items in cart`);
    }
  }
  
  // Check for specific items
  const itemMatches = code.match(/itemName\s*===?\s*['"](.*?)['"]/g);
  if (itemMatches) {
    console.log('✓ Expected items:');
    itemMatches.forEach(match => {
      const item = match.match(/['"](.*?)['"]/)[1];
      console.log(`  - ${item}`);
    });
  }
  
  // Check for quantities
  const quantityMatches = code.match(/quantity\s*===?\s*(\d+)/g);
  if (quantityMatches) {
    console.log('✓ Expected quantities:');
    quantityMatches.forEach(match => {
      const qty = match.match(/(\d+)/)[1];
      console.log(`  - Quantity: ${qty}`);
    });
  }
  
  // Check for store requirements
  if (code.includes('currentStore')) {
    const storeMatch = code.match(/currentStore.*?['"](.*?)['"]/);
    if (storeMatch) {
      console.log(`✓ Must be at store: ${storeMatch[1]}`);
    }
  }
  
  // Check for search requirements
  if (code.includes('searchResults')) {
    console.log('✓ Requires search action');
  }
  
  // Check for verifier consumption
  if (code.includes('verifierConsumed')) {
    console.log('⚠️  Uses verifier consumption (single-use)');
  }
}

function analyzeCategory(category) {
  const flows = Object.entries(verifiers.flows).filter(([_, flow]) => flow.category === category);
  
  if (flows.length === 0) {
    console.error(`❌ No verifiers found in category '${category}'`);
    return;
  }
  
  console.log(`\n=== ANALYZING CATEGORY: ${category} ===`);
  console.log(`Found ${flows.length} verifiers\n`);
  
  flows.forEach(([id, flow]) => {
    console.log(`--- ${id} ---`);
    console.log(`Description: ${flow.description}`);
    
    const code = flow.verifier;
    
    // Quick analysis
    if (code.includes('cart.length')) {
      const match = code.match(/cart\.length\s*===\s*(\d+)/);
      if (match) {
        console.log(`  Expects: ${match[1]} items`);
      }
    }
    
    const itemMatches = code.match(/itemName\s*===?\s*['"](.*?)['"]/g);
    if (itemMatches) {
      const items = itemMatches.map(match => match.match(/['"](.*?)['"]/)[1]);
      console.log(`  Items: ${items.join(', ')}`);
    }
    
    console.log('');
  });
}

function showUsage() {
  console.log('\n=== VERIFIER TESTING UTILITY ===');
  console.log('Usage:');
  console.log('  node scripts/test-verifiers.js list                    # List all verifiers');
  console.log('  node scripts/test-verifiers.js analyze <verifier-id>   # Analyze specific verifier');
  console.log('  node scripts/test-verifiers.js category <category>     # Analyze verifiers by category');
  console.log('\nExamples:');
  console.log('  node scripts/test-verifiers.js analyze add-fruits');
  console.log('  node scripts/test-verifiers.js category grocery-cart');
  console.log('');
}

// Main execution
switch (command) {
  case 'list':
    listVerifiers();
    break;
  case 'analyze':
    if (!target) {
      console.error('❌ Please specify a verifier ID');
      showUsage();
      process.exit(1);
    }
    analyzeVerifier(target);
    break;
  case 'category':
    if (!target) {
      console.error('❌ Please specify a category');
      showUsage();
      process.exit(1);
    }
    analyzeCategory(target);
    break;
  default:
    showUsage();
    break;
} 