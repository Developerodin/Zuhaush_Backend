#!/usr/bin/env node

import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1/visits`;

// Test configuration
const TEST_CONFIG = {
  // You'll need to replace these with actual IDs from your database
  VALID_PROPERTY_ID: '64f8a1b2c3d4e5f6a7b8c9d0', // Replace with real property ID
  INVALID_PROPERTY_ID: '507f1f77bcf86cd799439011', // Invalid ObjectId format
  TEST_DATE: '2024-12-25', // Future date for testing
  INVALID_DATE: 'invalid-date',
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`[${status}] ${testName}`, statusColor);
  if (details) {
    log(`  Details: ${details}`, 'blue');
  }
}

async function makeRequest(url, params = {}) {
  try {
    const response = await axios.get(url, { params });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

async function testValidRequest() {
  log('\n🧪 Testing valid request...', 'bold');
  
  const url = `${API_BASE}/properties/${TEST_CONFIG.VALID_PROPERTY_ID}/booked-slots`;
  const params = { date: TEST_CONFIG.TEST_DATE };
  
  log(`Request: GET ${url}?date=${TEST_CONFIG.TEST_DATE}`, 'blue');
  
  const result = await makeRequest(url, params);
  
  if (result.success) {
    logTest('Valid Request', 'PASS', `Status: ${result.status}`);
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'green');
    
    // Validate response structure
    if (result.data.bookedTimeSlots && Array.isArray(result.data.bookedTimeSlots)) {
      logTest('Response Structure', 'PASS', 'bookedTimeSlots is an array');
    } else {
      logTest('Response Structure', 'FAIL', 'bookedTimeSlots should be an array');
    }
  } else {
    logTest('Valid Request', 'FAIL', `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`);
  }
  
  return result;
}

async function testInvalidPropertyId() {
  log('\n🧪 Testing invalid property ID...', 'bold');
  
  const url = `${API_BASE}/properties/${TEST_CONFIG.INVALID_PROPERTY_ID}/booked-slots`;
  const params = { date: TEST_CONFIG.TEST_DATE };
  
  log(`Request: GET ${url}?date=${TEST_CONFIG.TEST_DATE}`, 'blue');
  
  const result = await makeRequest(url, params);
  
  if (!result.success && result.status === 404) {
    logTest('Invalid Property ID', 'PASS', `Status: ${result.status} - Property not found`);
  } else if (!result.success && result.status === 400) {
    logTest('Invalid Property ID', 'PASS', `Status: ${result.status} - Invalid ObjectId format`);
  } else {
    logTest('Invalid Property ID', 'FAIL', `Status: ${result.status}, Expected: 404 or 400`);
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
  }
  
  return result;
}

async function testMissingDateParameter() {
  log('\n🧪 Testing missing date parameter...', 'bold');
  
  const url = `${API_BASE}/properties/${TEST_CONFIG.VALID_PROPERTY_ID}/booked-slots`;
  
  log(`Request: GET ${url}`, 'blue');
  
  const result = await makeRequest(url);
  
  if (!result.success && result.status === 400) {
    logTest('Missing Date Parameter', 'PASS', `Status: ${result.status} - Validation error`);
  } else {
    logTest('Missing Date Parameter', 'FAIL', `Status: ${result.status}, Expected: 400`);
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
  }
  
  return result;
}

async function testInvalidDateFormat() {
  log('\n🧪 Testing invalid date format...', 'bold');
  
  const url = `${API_BASE}/properties/${TEST_CONFIG.VALID_PROPERTY_ID}/booked-slots`;
  const params = { date: TEST_CONFIG.INVALID_DATE };
  
  log(`Request: GET ${url}?date=${TEST_CONFIG.INVALID_DATE}`, 'blue');
  
  const result = await makeRequest(url, params);
  
  if (!result.success && result.status === 400) {
    logTest('Invalid Date Format', 'PASS', `Status: ${result.status} - Validation error`);
  } else {
    logTest('Invalid Date Format', 'FAIL', `Status: ${result.status}, Expected: 400`);
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
  }
  
  return result;
}

async function testPastDate() {
  log('\n🧪 Testing past date...', 'bold');
  
  const url = `${API_BASE}/properties/${TEST_CONFIG.VALID_PROPERTY_ID}/booked-slots`;
  const params = { date: '2020-01-01' }; // Past date
  
  log(`Request: GET ${url}?date=2020-01-01`, 'blue');
  
  const result = await makeRequest(url, params);
  
  if (!result.success && result.status === 400) {
    logTest('Past Date', 'PASS', `Status: ${result.status} - Date must be in future`);
  } else {
    logTest('Past Date', 'FAIL', `Status: ${result.status}, Expected: 400`);
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
  }
  
  return result;
}

async function testServerConnection() {
  log('\n🔍 Testing server connection...', 'bold');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    logTest('Server Connection', 'PASS', `Status: ${response.status}`);
    return true;
  } catch (error) {
    logTest('Server Connection', 'FAIL', `Cannot connect to server at ${BASE_URL}`);
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Booked Time Slots API Tests', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Test server connection first
  const serverOnline = await testServerConnection();
  if (!serverOnline) {
    log('\n❌ Server is not running. Please start the server first.', 'red');
    log('Run: npm start or node src/index.js', 'yellow');
    process.exit(1);
  }
  
  const results = [];
  
  // Run all tests
  results.push(await testValidRequest());
  results.push(await testInvalidPropertyId());
  results.push(await testMissingDateParameter());
  results.push(await testInvalidDateFormat());
  results.push(await testPastDate());
  
  // Summary
  log('\n📊 Test Summary', 'bold');
  log('=' .repeat(50), 'blue');
  
  const passed = results.filter(r => r.success || (r.status >= 400 && r.status < 500)).length;
  const total = results.length;
  
  log(`Total Tests: ${total}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${total - passed}`, 'red');
  
  if (passed === total) {
    log('\n✅ All tests passed!', 'green');
  } else {
    log('\n❌ Some tests failed. Check the details above.', 'red');
  }
  
  log('\n📝 Notes:', 'yellow');
  log('- Replace VALID_PROPERTY_ID with an actual property ID from your database', 'yellow');
  log('- Make sure your server is running on the correct port', 'yellow');
  log('- Check your database connection and data', 'yellow');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Booked Time Slots API Test Script', 'bold');
  log('');
  log('Usage: node test-booked-slots.js [options]', 'blue');
  log('');
  log('Options:', 'blue');
  log('  --help, -h     Show this help message', 'blue');
  log('  --url <url>    Set custom base URL (default: http://localhost:3000)', 'blue');
  log('');
  log('Environment Variables:', 'blue');
  log('  BASE_URL       Base URL for the API (default: http://localhost:3000)', 'blue');
  log('');
  log('Example:', 'blue');
  log('  node test-booked-slots.js --url http://localhost:5000', 'blue');
  process.exit(0);
}

// Parse custom URL from command line
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  process.env.BASE_URL = process.argv[urlIndex + 1];
  log(`Using custom URL: ${process.env.BASE_URL}`, 'yellow');
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Test script failed: ${error.message}`, 'red');
  process.exit(1);
});
