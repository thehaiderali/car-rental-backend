
---

# 🚗 Car Rental System Backend

A robust RESTful API built with **Node.js**, **Express**, and **MongoDB**. This system handles user authentication and a complete booking lifecycle with strict ownership checks, status state machine logic, and data validation.

## 🌟 Project Overview

This project was designed to demonstrate a deep understanding of backend architecture, specifically focusing on how to manage relational-like data in a NoSQL environment (MongoDB) and securing resources using JSON Web Tokens (JWT).

### Key Features

* **Secure Authentication:** Password hashing using `bcryptjs` and session management via `JWT`.
* **Ownership Protection:** A custom middleware ensures users can only view, edit, or cancel their own bookings.
* **Business Logic Automation:** Automatic calculation of `totalCost` within the Mongoose layer and dynamic state transitions for booking statuses.
* **Comprehensive Testing:** 21 test cases covering "Happy Paths" and "Edge Cases" (like invalid status transitions).

---

## 📂 Directory Structure

The project uses a modular design to keep the entry point clean and logic organized.

```text
thehaiderali-car-rental-backend/
├── index.js                # Server entry point & Express configuration
├── test.js                 # Automated test suite for API validation
├── middleware/
│   └── auth.js             # JWT verification & User injection
├── models/
│   ├── booking.model.js    # Booking schema & pre-save logic
│   └── user.model.js       # User schema & password hashing
├── routes/
│   ├── booking.routes.js   # Booking CRUD & Summary endpoints
│   └── user.routes.js      # Signup & Login endpoints
├── utils/
│   └── utils.js            # Helper functions (e.g., cost calculation)
└── package.json            # Scripts & Dependencies

```

---

## 🧠 Struggles & Learning

### 1. The Middleware "Domino Effect"

One of the most valuable debugging experiences was resolving a `TypeError: next is not a function`.

* **The Struggle:** An `async` Mongoose pre-save hook was incorrectly calling `next()`. This caused the booking creation to crash, which in turn caused "Get Booking" tests to fail because they were receiving `undefined` IDs.
* **The Learning:** Modern Mongoose handles promises returned by `async` functions automatically. Removing the `next` parameter restored the entire testing pipeline to green.

### 2. State Management & Immutability

Implementing the business rules for booking updates taught me how to enforce a **State Machine**.

* **The Learning:** I learned how to prevent a "Completed" or "Cancelled" booking from being moved back to "Booked" status, ensuring the integrity of the financial records.

---

## 🚀 API Contracts

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Registers a new user with a unique username. |
| `POST` | `/auth/login` | Returns a JWT after password validation. |

### Bookings (Protected via `auth.js`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/bookings` | Creates a booking; auto-calculates total cost. |
| `GET` | `/bookings` | Lists all bookings for the logged-in user. |
| `GET` | `/bookings?summary=true` | Returns financial totals and upcoming trips. |
| `PUT` | `/bookings/:id` | Updates details (only if status is 'booked'). |
| `DELETE` | `/bookings/:id` | Performed as a "Soft Delete" by setting status to 'cancelled'. |

---

## 🧪 Testing Results

The system was verified using a custom test script that simulates real-world user flows.

* ✅ **Total Tests:** 21
* ✅ **Passed:** 21/21
* ✅ **Validation:** Handled 400 (Bad Request) for invalid days/rent.
* ✅ **Security:** Handled 401 (Unauthorized) for expired or missing tokens.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Security:** JWT, BcryptJS
* **Validation:** Custom logic in Routes & Models

---

### How to Run Locally

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure `.env` with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
4. Start development server: `npm run dev`.
5. Run tests: `node test.js`.

