// Text.js - Output Comparison & Test Logging for Car Rental Backend
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

let token = '';
let bookingIds = [];
let userId = '';

// Utility function for delays
const sleep = ms => new Promise(res => setTimeout(res, ms));

// Console colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Track test results
let passed = 0, failed = 0;

function logSuccess(message) {
  console.log(`${colors.green}✓ PASSED:${colors.reset} ${message}`);
  passed++;
}

function logFailure(message, expected, actual) {
  console.log(`${colors.red}✗ FAILED:${colors.reset} ${message}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Actual  : ${actual}`);
  failed++;
}

function logSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Helper to compare expected and actual values
function compare(testName, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    logSuccess(testName);
  } else {
    logFailure(testName, expected, actual);
  }
}

// ============================================================
// TESTS
// ============================================================

// Test 1: Signup
async function testSignup() {
  logSection('TEST 1: SIGNUP');
  try {
    const resp = await axios.post(`${BASE_URL}/auth/signup`, {
      username: 'testuser',
      password: 'password123'
    });
    compare('Signup status 201', resp.status, 201);
    compare('Signup success true', resp.data.success, true);
    userId = resp.data.data.userId;
    console.log(`User ID: ${userId}`);
  } catch (err) {
    console.error('Signup Error:', err.response?.data || err.message);
    failed++;
  }
}

// Test 2: Duplicate Signup
async function testSignupDuplicate() {
  logSection('TEST 2: DUPLICATE SIGNUP');
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      username: 'testuser',
      password: 'password123'
    });
    logFailure('Duplicate signup should fail', 409, 'Request succeeded');
  } catch (err) {
    compare('Duplicate signup status 409', err.response.status, 409);
    compare('Duplicate signup success false', err.response.data.success, false);
  }
}

// Test 3: Login
async function testLogin() {
  logSection('TEST 3: LOGIN');
  try {
    const resp = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    compare('Login status 200', resp.status, 200);
    compare('Login success true', resp.data.success, true);
    token = resp.data.data.token;
    console.log(`Token: ${token.slice(0, 20)}...`);
  } catch (err) {
    console.error('Login Error:', err.response?.data || err.message);
    failed++;
  }
}

// Test 4: Login Invalid Password
async function testLoginInvalidPassword() {
  logSection('TEST 4: LOGIN INVALID PASSWORD');
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'wrongpassword'
    });
    logFailure('Should reject invalid password', 401, 'Request succeeded');
  } catch (err) {
    compare('Invalid password status 401', err.response.status, 401);
  }
}

// Test 5: Create Booking
async function testCreateBooking(carName, days, rentPerDay, expectedTotal) {
  logSection(`CREATE BOOKING: ${carName}`);
  try {
    const resp = await axios.post(`${BASE_URL}/bookings`, { carName, days, rentPerDay }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    compare('Booking status 201', resp.status, 201);
    compare('Booking success true', resp.data.success, true);
    compare('Booking total cost', resp.data.data.totalCost, expectedTotal);
    bookingIds.push(resp.data.data.bookingId);
    console.log(`Booking ID: ${resp.data.data.bookingId}`);
  } catch (err) {
    console.error('Create Booking Error:', err.response?.data || err.message);
    failed++;
  }
}

// Test 6: Get All Bookings
async function testGetAllBookings(expectedCount) {
  logSection('GET ALL BOOKINGS');
  try {
    const resp = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    compare('Get all bookings status 200', resp.status, 200);
    compare('Booking count', resp.data.data.length, expectedCount);
  } catch (err) {
    console.error('Get All Bookings Error:', err.response?.data || err.message);
    failed++;
  }
}

// Test 7: Get Booking by ID
async function testGetBookingById(index) {
  logSection(`GET BOOKING BY ID: ${bookingIds[index]}`);
  try {
    const resp = await axios.get(`${BASE_URL}/bookings/${bookingIds[index]}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    compare('Get booking status 200', resp.status, 200);
    compare('Booking ID matches', resp.data.data._id, bookingIds[index]);
  } catch (err) {
    console.error('Get Booking by ID Error:', err.response?.data || err.message);
    failed++;
  }
}

// ============================================================
// RUN ALL TESTS
// ============================================================
async function runTests() {
  await testSignup();
  await testSignupDuplicate();
  await testLogin();
  await testLoginInvalidPassword();

  // Create bookings
  await testCreateBooking('Honda City', 3, 1500, 4500);
  await testCreateBooking('Toyota Camry', 5, 1200, 6000);
  await testCreateBooking('BMW X5', 2, 2000, 4000);

  // Get bookings
  await testGetAllBookings(3);
  await testGetBookingById(0);
  await testGetBookingById(1);

  // Final Results
  console.log(`\n${colors.yellow}FINAL RESULTS${colors.reset}`);
  const totalTests = passed + failed;
  console.log(`Total: ${totalTests}, Passed: ${passed}, Failed: ${failed}`);
}

runTests().catch(err => console.error('Fatal Error:', err));
