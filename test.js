// test.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

let token = '';
let bookingId = '';
let userId = '';

// Utility sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function test() {
  try {
    console.log('=== SIGNUP ===');
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      username: 'testuser',
      password: 'password123',
    });
    console.log(signupRes.data);
    userId = signupRes.data.data.userId;
    await sleep(500); // wait half a second
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== LOGIN ===');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123',
    });
    console.log(loginRes.data);
    token = loginRes.data.data.token;
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== CREATE BOOKING ===');
    const bookingRes = await axios.post(
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
    console.log(bookingRes.data);
    bookingId = bookingRes.data.data.bookingId;
    await sleep(700);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== GET ALL BOOKINGS ===');
    const allBookings = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(allBookings.data);
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== GET BOOKING BY ID ===');
    const singleBooking = await axios.get(
      `${BASE_URL}/bookings/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(singleBooking.data);
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== GET SUMMARY ===');
    const summary = await axios.get(`${BASE_URL}/bookings?summary=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(summary.data);
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== UPDATE BOOKING ===');
    const updateBooking = await axios.put(
      `${BASE_URL}/bookings/${bookingId}`,
      { carName: 'Hyundai Verna', days: 4, rentPerDay: 1600 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(updateBooking.data);
    await sleep(700);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== CHANGE STATUS TO COMPLETED ===');
    const updateStatus = await axios.put(
      `${BASE_URL}/bookings/${bookingId}`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(updateStatus.data);
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== DELETE (CANCEL) BOOKING ===');
    const deleteBooking = await axios.delete(
      `${BASE_URL}/bookings/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(deleteBooking.data);
    await sleep(500);
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }

  try {
    console.log('=== DELETE ALREADY CANCELLED BOOKING ===');
    await axios.delete(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err.response) console.log(err.response.data);
  }
}

test();
