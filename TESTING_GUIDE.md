# Booked Time Slots API Testing Guide

## Overview
This guide helps you test the booked time slots API endpoint to ensure it's working correctly.

## API Endpoint
```
GET /api/v1/visits/properties/:propertyId/booked-slots?date=YYYY-MM-DD
```

## Test Scripts

### 1. Node.js Test Script (Comprehensive)
```bash
# Install dependencies if not already installed
npm install axios dotenv

# Run the test script
node test-booked-slots.js

# With custom URL
node test-booked-slots.js --url http://localhost:5000

# Show help
node test-booked-slots.js --help
```

### 2. Bash Test Script (Simple)
```bash
# Make executable (already done)
chmod +x test-booked-slots.sh

# Run the test script
./test-booked-slots.sh
```

## Manual Testing

### Prerequisites
1. **Start your server**:
   ```bash
   npm start
   # or
   node src/index.js
   ```

2. **Get a valid property ID** from your database:
   ```bash
   # Connect to MongoDB and find a property
   db.properties.findOne()
   ```

3. **Update the test scripts** with your actual property ID:
   - Replace `VALID_PROPERTY_ID` in both test scripts
   - Use a real property ID from your database

### Manual curl Tests

#### 1. Test Valid Request
```bash
curl "http://localhost:3000/api/v1/visits/properties/YOUR_PROPERTY_ID/booked-slots?date=2024-12-25"
```

**Expected Response**:
```json
{
  "bookedTimeSlots": ["10:00 AM", "2:30 PM", "4:00 PM"]
}
```

#### 2. Test Invalid Property ID
```bash
curl "http://localhost:3000/api/v1/visits/properties/507f1f77bcf86cd799439011/booked-slots?date=2024-12-25"
```

**Expected Response**: 404 Not Found

#### 3. Test Missing Date Parameter
```bash
curl "http://localhost:3000/api/v1/visits/properties/YOUR_PROPERTY_ID/booked-slots"
```

**Expected Response**: 400 Bad Request

#### 4. Test Invalid Date Format
```bash
curl "http://localhost:3000/api/v1/visits/properties/YOUR_PROPERTY_ID/booked-slots?date=invalid-date"
```

**Expected Response**: 400 Bad Request

#### 5. Test Past Date
```bash
curl "http://localhost:3000/api/v1/visits/properties/YOUR_PROPERTY_ID/booked-slots?date=2020-01-01"
```

**Expected Response**: 400 Bad Request

## Test Scenarios Covered

### ✅ Positive Tests
- Valid property ID with valid date
- Returns array of booked time slots
- Proper response structure

### ❌ Negative Tests
- Invalid property ID (404)
- Missing date parameter (400)
- Invalid date format (400)
- Past date (400)
- Non-existent property (404)

## Expected Behavior

### Success Case
- **Status**: 200 OK
- **Response**: `{ "bookedTimeSlots": ["10:00 AM", "2:30 PM"] }`
- **Notes**: Returns array of time strings that are already booked

### Error Cases
- **404**: Property not found
- **400**: Missing or invalid date parameter
- **400**: Date is in the past
- **400**: Invalid date format

## Database Setup for Testing

### Create Test Data
```javascript
// Connect to MongoDB and create test visits
db.visits.insertMany([
  {
    user: ObjectId("USER_ID"),
    property: ObjectId("PROPERTY_ID"),
    date: new Date("2024-12-25"),
    time: "10:00 AM",
    status: "scheduled"
  },
  {
    user: ObjectId("USER_ID"),
    property: ObjectId("PROPERTY_ID"),
    date: new Date("2024-12-25"),
    time: "2:30 PM",
    status: "confirmed"
  }
]);
```

## Troubleshooting

### Common Issues

1. **Server not running**
   - Error: Connection refused
   - Solution: Start the server with `npm start`

2. **Invalid property ID**
   - Error: 404 Not Found
   - Solution: Use a valid property ID from your database

3. **Database connection issues**
   - Error: Internal server error
   - Solution: Check MongoDB connection and ensure database is running

4. **No test data**
   - Response: `{ "bookedTimeSlots": [] }`
   - Solution: Create some test visits in the database

### Debug Steps

1. **Check server logs** for any errors
2. **Verify database connection** 
3. **Check if property exists** in database
4. **Verify visit data** exists for the test date
5. **Check API route registration** in your app

## Quick Test Commands

```bash
# Test with a specific property and date
curl "http://localhost:3000/api/v1/visits/properties/64f8a1b2c3d4e5f6a7b8c9d0/booked-slots?date=2024-12-25"

# Test server health
curl "http://localhost:3000/health"

# Test with verbose output
curl -v "http://localhost:3000/api/v1/visits/properties/YOUR_PROPERTY_ID/booked-slots?date=2024-12-25"
```

## Next Steps

After running the tests:
1. **Fix any failing tests** by checking the error messages
2. **Update the property ID** in test scripts with real data
3. **Add more test data** to see different scenarios
4. **Test with different dates** to verify the logic works correctly
