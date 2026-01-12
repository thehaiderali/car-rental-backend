// test.js - Comprehensive Test Suite for Car Rental API
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test data
let token = '';
let bookingId1 = '';
let bookingId2 = '';
let bookingId3 = '';
let userId = '';

// Utility function for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test result tracker
let passed = 0;
let failed = 0;

function logSuccess(message) {
  console.log(`${colors.green}✓ PASSED:${colors.reset} ${message}`);
  passed++;
}

function logFailure(message, error) {
  console.log(`${colors.red}✗ FAILED:${colors.reset} ${message}`);
  if (error) console.log(`  Error: ${error}`);
  failed++;
}

function logSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

function logTestResult(testName, condition, expectedValue, actualValue) {
  if (condition) {
    logSuccess(`${testName}`);
  } else {
    logFailure(`${testName}`, `Expected: ${expectedValue}, Got: ${actualValue}`);
  }
}

// ==============================================================
// TEST 1: SIGNUP - New User Registration
// ==============================================================
async function testSignup() {
  logSection('TEST 1: SIGNUP - New User Registration');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      username: 'testuser',
      password: 'password123',
    });
    
    logTestResult(
      'Signup returns 201 status',
      response.status === 201,
      201,
      response.status
    );
    
    logTestResult(
      'Signup returns success: true',
      response.data.success === true,
      true,
      response.data.success
    );
    
    logTestResult(
      'Signup returns userId',
      !!response.data.data.userId,
      'userId present',
      response.data.data.userId ? 'present' : 'missing'
    );
    
    userId = response.data.data.userId;
    console.log(`User ID: ${userId}`);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Signup test', err.response.data.error);
    } else {
      logFailure('Signup test', err.message);
    }
  }
}

// ==============================================================
// TEST 2: SIGNUP DUPLICATE - Should Fail
// ==============================================================
async function testSignupDuplicate() {
  logSection('TEST 2: SIGNUP DUPLICATE - Should Return 409');
  
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      username: 'testuser',
      password: 'password123',
    });
    
    logFailure('Should have rejected duplicate username', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Duplicate signup returns 409 status',
        err.response.status === 409,
        409,
        err.response.status
      );
      
      logTestResult(
        'Duplicate signup returns success: false',
        err.response.data.success === false,
        false,
        err.response.data.success
      );
      await sleep(500);
    } else {
      logFailure('Duplicate signup test', err.message);
    }
  }
}

// ==============================================================
// TEST 3: LOGIN - Valid Credentials
// ==============================================================
async function testLogin() {
  logSection('TEST 3: LOGIN - Valid Credentials');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123',
    });
    
    logTestResult(
      'Login returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Login returns success: true',
      response.data.success === true,
      true,
      response.data.success
    );
    
    logTestResult(
      'Login returns JWT token',
      !!response.data.data.token,
      'token present',
      response.data.data.token ? 'present' : 'missing'
    );
    
    token = response.data.data.token;
    console.log(`Token: ${token.substring(0, 20)}...`);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Login test', err.response.data.error);
    } else {
      logFailure('Login test', err.message);
    }
  }
}

// ==============================================================
// TEST 4: LOGIN - Invalid Password
// ==============================================================
async function testLoginInvalidPassword() {
  logSection('TEST 4: LOGIN - Invalid Password (Should Fail)');
  
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'wrongpassword',
    });
    
    logFailure('Should have rejected invalid password', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Invalid password returns 401 status',
        err.response.status === 401,
        401,
        err.response.status
      );
      await sleep(500);
    } else {
      logFailure('Invalid password test', err.message);
    }
  }
}

// ==============================================================
// TEST 5: CREATE BOOKING #1
// ==============================================================
async function testCreateBooking1() {
  logSection('TEST 5: CREATE BOOKING #1 - Honda City');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/bookings`,
      {
        carName: 'Honda City',
        days: 3,
        rentPerDay: 1500,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    logTestResult(
      'Create booking returns 201 status',
      response.status === 201,
      201,
      response.status
    );
    
    logTestResult(
      'Create booking returns success: true',
      response.data.success === true,
      true,
      response.data.success
    );
    
    logTestResult(
      'Total cost calculated correctly (3 × 1500 = 4500)',
      response.data.data.totalCost === 4500,
      4500,
      response.data.data.totalCost
    );
    
    bookingId1 = response.data.data.bookingId;
    console.log(`Booking ID: ${bookingId1}`);
    await sleep(700);
    
  } catch (err) {
    if (err.response) {
      logFailure('Create booking test', err.response.data.error);
    } else {
      logFailure('Create booking test', err.message);
    }
  }
}

// ==============================================================
// TEST 6: CREATE BOOKING #2
// ==============================================================
async function testCreateBooking2() {
  logSection('TEST 6: CREATE BOOKING #2 - Toyota Camry');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/bookings`,
      {
        carName: 'Toyota Camry',
        days: 5,
        rentPerDay: 1200,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    logTestResult(
      'Total cost calculated correctly (5 × 1200 = 6000)',
      response.data.data.totalCost === 6000,
      6000,
      response.data.data.totalCost
    );
    
    bookingId2 = response.data.data.bookingId;
    console.log(`Booking ID: ${bookingId2}`);
    await sleep(700);
    
  } catch (err) {
    if (err.response) {
      logFailure('Create booking 2 test', err.response.data.error);
    } else {
      logFailure('Create booking 2 test', err.message);
    }
  }
}

// ==============================================================
// TEST 7: CREATE BOOKING #3
// ==============================================================
async function testCreateBooking3() {
  logSection('TEST 7: CREATE BOOKING #3 - BMW X5');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/bookings`,
      {
        carName: 'BMW X5',
        days: 2,
        rentPerDay: 2000,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    bookingId3 = response.data.data.bookingId;
    console.log(`Booking ID: ${bookingId3}`);
    await sleep(700);
    
  } catch (err) {
    if (err.response) {
      logFailure('Create booking 3 test', err.response.data.error);
    } else {
      logFailure('Create booking 3 test', err.message);
    }
  }
}

// ==============================================================
// TEST 8: CREATE BOOKING - Invalid Data (Should Fail)
// ==============================================================
async function testCreateBookingInvalid() {
  logSection('TEST 8: CREATE BOOKING - Invalid Data (Should Fail)');
  
  try {
    await axios.post(
      `${BASE_URL}/bookings`,
      {
        carName: 'X', // Too short
        days: 0, // Invalid
        rentPerDay: 50, // Below minimum
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    logFailure('Should have rejected invalid booking data', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Invalid booking returns 400 status',
        err.response.status === 400,
        400,
        err.response.status
      );
      await sleep(500);
    } else {
      logFailure('Invalid booking test', err.message);
    }
  }
}

// ==============================================================
// TEST 9: CREATE BOOKING - No Auth Token (Should Fail)
// ==============================================================
async function testCreateBookingNoAuth() {
  logSection('TEST 9: CREATE BOOKING - No Auth Token (Should Fail)');
  
  try {
    await axios.post(
      `${BASE_URL}/bookings`,
      {
        carName: 'Test Car',
        days: 1,
        rentPerDay: 1000,
      }
      // No Authorization header
    );
    
    logFailure('Should have rejected request without auth token', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'No auth token returns 403 status',
        err.response.status === 403,
        403,
        err.response.status
      );
      await sleep(500);
    } else {
      logFailure('No auth test', err.message);
    }
  }
}

// ==============================================================
// TEST 10: GET ALL BOOKINGS
// ==============================================================
async function testGetAllBookings() {
  logSection('TEST 10: GET ALL BOOKINGS');
  
  try {
    const response = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    logTestResult(
      'Get all bookings returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Returns array of 3 bookings',
      response.data.data.length === 3,
      3,
      response.data.data.length
    );
    
    logTestResult(
      'All bookings have status "booked"',
      response.data.data.every(b => b.status === 'booked'),
      true,
      response.data.data.every(b => b.status === 'booked')
    );
    
    console.log(`Found ${response.data.data.length} bookings`);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Get all bookings test', err.response.data.error);
    } else {
      logFailure('Get all bookings test', err.message);
    }
  }
}

// ==============================================================
// TEST 11: GET BOOKING BY ID (URL Param)
// ==============================================================
async function testGetBookingById() {
  logSection('TEST 11: GET BOOKING BY ID (URL Parameter)');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/bookings/${bookingId1}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Get booking by ID returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Returns correct booking',
      response.data.data._id === bookingId1,
      bookingId1,
      response.data.data._id
    );
    
    logTestResult(
      'Booking has correct car name',
      response.data.data.carName === 'Honda City',
      'Honda City',
      response.data.data.carName
    );
    
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Get booking by ID test', err.response.data.error);
    } else {
      logFailure('Get booking by ID test', err.message);
    }
  }
}

// ==============================================================
// TEST 12: GET BOOKING BY ID (Query Param)
// ==============================================================
async function testGetBookingByQueryParam() {
  logSection('TEST 12: GET BOOKING BY ID (Query Parameter)');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/bookings?bookingId=${bookingId2}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Get booking by query param returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Returns correct booking',
      response.data.data._id === bookingId2,
      bookingId2,
      response.data.data._id
    );
    
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Get booking by query param test', err.response.data.error);
    } else {
      logFailure('Get booking by query param test', err.message);
    }
  }
}

// ==============================================================
// TEST 13: GET SUMMARY
// ==============================================================
async function testGetSummary() {
  logSection('TEST 13: GET SUMMARY');
  
  try {
    const response = await axios.get(`${BASE_URL}/bookings?summary=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    logTestResult(
      'Get summary returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Total bookings is 3',
      response.data.data.totalBookings === 3,
      3,
      response.data.data.totalBookings
    );
    
    const expectedTotal = 4500 + 6000 + 4000; // 14500
    logTestResult(
      'Total amount spent is correct (14500)',
      response.data.data.totalAmountSpent === expectedTotal,
      expectedTotal,
      response.data.data.totalAmountSpent
    );
    
    logTestResult(
      'Upcoming bookings count is 3',
      response.data.data.upcomingBookings.length === 3,
      3,
      response.data.data.upcomingBookings.length
    );
    
    console.log(`Summary: ${response.data.data.totalBookings} bookings, $${response.data.data.totalAmountSpent} total`);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Get summary test', err.response.data.error);
    } else {
      logFailure('Get summary test', err.message);
    }
  }
}

// ==============================================================
// TEST 14: UPDATE BOOKING - Car Details Only
// ==============================================================
async function testUpdateBookingDetails() {
  logSection('TEST 14: UPDATE BOOKING - Car Details Only');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/bookings/${bookingId1}`,
      { 
        carName: 'Hyundai Verna', 
        days: 4,
        rentPerDay: 1600 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Update booking returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Car name updated correctly',
      response.data.data.carName === 'Hyundai Verna',
      'Hyundai Verna',
      response.data.data.carName
    );
    
    logTestResult(
      'Total cost recalculated (4 × 1600 = 6400)',
      response.data.data.totalCost === 6400,
      6400,
      response.data.data.totalCost
    );
    
    await sleep(700);
    
  } catch (err) {
    if (err.response) {
      logFailure('Update booking details test', err.response.data.error);
    } else {
      logFailure('Update booking details test', err.message);
    }
  }
}

// ==============================================================
// TEST 15: UPDATE BOOKING - Partial Update (Days Only)
// ==============================================================
async function testUpdateBookingPartial() {
  logSection('TEST 15: UPDATE BOOKING - Partial Update (Days Only)');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/bookings/${bookingId2}`,
      { days: 7 }, // Only updating days
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Partial update returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Days updated correctly',
      response.data.data.days === 7,
      7,
      response.data.data.days
    );
    
    logTestResult(
      'Total cost recalculated (7 × 1200 = 8400)',
      response.data.data.totalCost === 8400,
      8400,
      response.data.data.totalCost
    );
    
    await sleep(700);
    
  } catch (err) {
    if (err.response) {
      logFailure('Partial update test', err.response.data.error);
    } else {
      logFailure('Partial update test', err.message);
    }
  }
}

// ==============================================================
// TEST 16: UPDATE BOOKING - Status to Completed
// ==============================================================
async function testUpdateStatusToCompleted() {
  logSection('TEST 16: UPDATE BOOKING - Change Status to Completed');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/bookings/${bookingId1}`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Status update returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Status changed to completed',
      response.data.data.status === 'completed',
      'completed',
      response.data.data.status
    );
    
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Update status to completed test', err.response.data.error);
    } else {
      logFailure('Update status to completed test', err.message);
    }
  }
}

// ==============================================================
// TEST 17: UPDATE COMPLETED BOOKING - Car Details (Should Fail)
// ==============================================================
async function testUpdateCompletedBookingDetails() {
  logSection('TEST 17: UPDATE COMPLETED BOOKING - Car Details (Should Fail)');
  
  try {
    await axios.put(
      `${BASE_URL}/bookings/${bookingId1}`,
      { carName: 'New Car Name', days: 10 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logFailure('Should have rejected car details update on completed booking', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Update completed booking car details returns 400 status',
        err.response.status === 400,
        400,
        err.response.status
      );
      
      logTestResult(
        'Error message mentions cannot modify car details',
        err.response.data.error.includes('car details'),
        'includes "car details"',
        err.response.data.error.includes('car details') ? 'present' : 'missing'
      );
      await sleep(500);
    } else {
      logFailure('Update completed booking test', err.message);
    }
  }
}

// ==============================================================
// TEST 18: UPDATE COMPLETED BOOKING - Status to Cancelled (Should Work)
// ==============================================================
async function testUpdateCompletedToCancelled() {
  logSection('TEST 18: UPDATE COMPLETED BOOKING - Status to Cancelled (Should Work)');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/bookings/${bookingId1}`,
      { status: 'cancelled' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Update completed to cancelled returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Status changed to cancelled',
      response.data.data.status === 'cancelled',
      'cancelled',
      response.data.data.status
    );
    
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Update completed to cancelled test', err.response.data.error);
    } else {
      logFailure('Update completed to cancelled test', err.message);
    }
  }
}

// ==============================================================
// TEST 19: UPDATE CANCELLED BOOKING - Back to Booked (Should Fail)
// ==============================================================
async function testUpdateCancelledToBooked() {
  logSection('TEST 19: UPDATE CANCELLED BOOKING - Back to Booked (Should Fail)');
  
  try {
    await axios.put(
      `${BASE_URL}/bookings/${bookingId1}`,
      { status: 'booked' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logFailure('Should have rejected status change from cancelled to booked', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Update cancelled to booked returns 400 status',
        err.response.status === 400,
        400,
        err.response.status
      );
      await sleep(500);
    } else {
      logFailure('Update cancelled to booked test', err.message);
    }
  }
}

// ==============================================================
// TEST 20: GET SUMMARY AFTER UPDATES
// ==============================================================
async function testGetSummaryAfterUpdates() {
  logSection('TEST 20: GET SUMMARY AFTER UPDATES');
  
  try {
    const response = await axios.get(`${BASE_URL}/bookings?summary=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    logTestResult(
      'Total bookings is 2 (cancelled not counted)',
      response.data.data.totalBookings === 2,
      2,
      response.data.data.totalBookings
    );
    
    logTestResult(
      'Upcoming bookings is 2 (only "booked" status)',
      response.data.data.upcomingBookings.length === 2,
      2,
      response.data.data.upcomingBookings.length
    );
    
    console.log(`Updated Summary: ${response.data.data.totalBookings} active bookings`);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Get summary after updates test', err.response.data.error);
    } else {
      logFailure('Get summary after updates test', err.message);
    }
  }
}

// ==============================================================
// TEST 21: DELETE (CANCEL) BOOKING
// ==============================================================
async function testDeleteBooking() {
  logSection('TEST 21: DELETE (CANCEL) BOOKING');
  
  try {
    const response = await axios.delete(
      `${BASE_URL}/bookings/${bookingId2}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTestResult(
      'Delete booking returns 200 status',
      response.status === 200,
      200,
      response.status
    );
    
    logTestResult(
      'Delete returns success: true',
      response.data.success === true,
      true,
      response.data.success
    );
    
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Delete booking test', err.response.data.error);
    } else {
      logFailure('Delete booking test', err.message);
    }
  }
}

// ==============================================================
// TEST 22: DELETE ALREADY CANCELLED BOOKING (Should Fail)
// ==============================================================
async function testDeleteAlreadyCancelled() {
  logSection('TEST 22: DELETE ALREADY CANCELLED BOOKING (Should Fail)');
  
  try {
    await axios.delete(`${BASE_URL}/bookings/${bookingId2}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    logFailure('Should have rejected deleting already cancelled booking', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Delete already cancelled returns 400 status',
        err.response.status === 400,
        400,
        err.response.status
      );
      
      logTestResult(
        'Error message mentions already cancelled',
        err.response.data.message.includes('Already Cancelled'),
        'includes "Already Cancelled"',
        err.response.data.message.includes('Already Cancelled') ? 'present' : 'missing'
      );
      await sleep(500);
    } else {
      logFailure('Delete already cancelled test', err.message);
    }
  }
}

// ==============================================================
// TEST 23: GET BOOKING THAT DOESN'T EXIST (Should Fail)
// ==============================================================
async function testGetNonExistentBooking() {
  logSection('TEST 23: GET NON-EXISTENT BOOKING (Should Fail)');
  
  try {
    await axios.get(
      `${BASE_URL}/bookings/000000000000000000000000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logFailure('Should have returned 404 for non-existent booking', 'Request succeeded when it should fail');
    
  } catch (err) {
    if (err.response) {
      logTestResult(
        'Non-existent booking returns 404 status',
        err.response.status === 404,
        404,
        err.response.status
      );
      await sleep(500);
    } else {
      logFailure('Get non-existent booking test', err.message);
    }
  }
}

// ==============================================================
// TEST 24: FINAL SUMMARY CHECK
// ==============================================================
async function testFinalSummary() {
  logSection('TEST 24: FINAL SUMMARY CHECK');
  
  try {
    const response = await axios.get(`${BASE_URL}/bookings?summary=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    logTestResult(
      'Final total bookings is 1 (only BMW X5 active)',
      response.data.data.totalBookings === 1,
      1,
      response.data.data.totalBookings
    );
    
    logTestResult(
      'Final upcoming bookings is 1',
      response.data.data.upcomingBookings.length === 1,
      1,
      response.data.data.upcomingBookings.length
    );
    
    console.log(`Final Summary:`, response.data.data);
    await sleep(500);
    
  } catch (err) {
    if (err.response) {
      logFailure('Final summary test', err.response.data.error);
    } else {
      logFailure('Final summary test', err.message);
    }
  }
}

// ==============================================================
// MAIN TEST RUNNER
// ==============================================================
async function runAllTests() {
  console.log(`${colors.yellow}${'*'.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}    CAR RENTAL API - COMPREHENSIVE TEST SUITE${colors.reset}`);
  console.log(`${colors.yellow}${'*'.repeat(60)}${colors.reset}\n`);
  
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Starting tests at: ${new Date().toLocaleString()}\n`);
  
  // Authentication Tests
  await testSignup();
  await testSignupDuplicate();
  await testLogin();
  await testLoginInvalidPassword();
  
  // Booking Creation Tests
  await testCreateBooking1();
  await testCreateBooking2();
  await testCreateBooking3();
  await testCreateBookingInvalid();
  await testCreateBookingNoAuth();
  
  // Booking Retrieval Tests
  await testGetAllBookings();
  await testGetBookingById();
  await testGetBookingByQueryParam();
  await// ... (continuing from await testGetBookingByQueryParam())

  // Booking Retrieval Tests (cont.)
  await testGetSummary();

  // Booking Update Tests
  await testUpdateBookingDetails();
  await testUpdateBookingPartial();
  await testUpdateStatusToCompleted();
  await testUpdateCompletedBookingDetails();
  await testUpdateCompletedToCancelled();
  await testUpdateCancelledToBooked();
  await testGetSummaryAfterUpdates();

  // Deletion & Edge Case Tests
  await testDeleteBooking();
  await testDeleteAlreadyCancelled();
  await testGetNonExistentBooking();
  await testFinalSummary();

  // Final Results
  logSection('FINAL TEST RESULTS');
  const totalTests = passed + failed;
  const successRate = ((passed / totalTests) * 100).toFixed(1);

  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`${colors.green}Tests Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Tests Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${successRate}%`);

  if (failed === 0) {
    console.log(`\n${colors.green}${'*'.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}  ALL TESTS PASSED SUCCESSFULLY!${colors.reset}`);
    console.log(`${colors.green}${'*'.repeat(60)}${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${'!'.repeat(60)}${colors.reset}`);
    console.log(`${colors.red}  TEST SUITE FAILED WITH ${failed} ERRORS${colors.reset}`);
    console.log(`${colors.red}${'!'.repeat(60)}${colors.reset}\n`);
    process.exit(1);
  }
}

// Start the execution
runAllTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});