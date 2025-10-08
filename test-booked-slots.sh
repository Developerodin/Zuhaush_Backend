#!/bin/bash

# Booked Time Slots API Test Script
# This script tests the booked time slots API endpoint

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/v1/visits"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration - REPLACE WITH ACTUAL VALUES
VALID_PROPERTY_ID="64f8a1b2c3d4e5f6a7b8c9d0"  # Replace with real property ID
INVALID_PROPERTY_ID="507f1f77bcf86cd799439011"  # Invalid ObjectId
TEST_DATE="2024-12-25"  # Future date
INVALID_DATE="invalid-date"

echo -e "${BLUE}🚀 Starting Booked Time Slots API Tests${NC}"
echo -e "${BLUE}================================================${NC}"

# Function to make HTTP request and check response
test_endpoint() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local description="$4"
    
    echo -e "\n${YELLOW}🧪 Testing: ${test_name}${NC}"
    echo -e "${BLUE}Request: GET ${url}${NC}"
    
    # Make the request
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Check if the response matches expected status
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}[PASS] ${test_name}${NC}"
        echo -e "${BLUE}  Status: ${http_code}${NC}"
        if [ -n "$description" ]; then
            echo -e "${BLUE}  Details: ${description}${NC}"
        fi
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}  Response: ${body}${NC}"
        fi
    else
        echo -e "${RED}[FAIL] ${test_name}${NC}"
        echo -e "${RED}  Expected: ${expected_status}, Got: ${http_code}${NC}"
        echo -e "${RED}  Response: ${body}${NC}"
    fi
}

# Test 1: Valid request
test_endpoint \
    "Valid Request" \
    "${API_BASE}/properties/${VALID_PROPERTY_ID}/booked-slots?date=${TEST_DATE}" \
    "200" \
    "Should return booked time slots"

# Test 2: Invalid property ID
test_endpoint \
    "Invalid Property ID" \
    "${API_BASE}/properties/${INVALID_PROPERTY_ID}/booked-slots?date=${TEST_DATE}" \
    "404" \
    "Should return 404 for non-existent property"

# Test 3: Missing date parameter
test_endpoint \
    "Missing Date Parameter" \
    "${API_BASE}/properties/${VALID_PROPERTY_ID}/booked-slots" \
    "400" \
    "Should return 400 for missing required parameter"

# Test 4: Invalid date format
test_endpoint \
    "Invalid Date Format" \
    "${API_BASE}/properties/${VALID_PROPERTY_ID}/booked-slots?date=${INVALID_DATE}" \
    "400" \
    "Should return 400 for invalid date format"

# Test 5: Past date
test_endpoint \
    "Past Date" \
    "${API_BASE}/properties/${VALID_PROPERTY_ID}/booked-slots?date=2020-01-01" \
    "400" \
    "Should return 400 for past date"

# Test 6: Server health check
echo -e "\n${YELLOW}🔍 Testing server connection...${NC}"
if curl -s "${BASE_URL}/health" > /dev/null; then
    echo -e "${GREEN}[PASS] Server Connection${NC}"
else
    echo -e "${RED}[FAIL] Server Connection${NC}"
    echo -e "${RED}  Cannot connect to server at ${BASE_URL}${NC}"
    echo -e "${YELLOW}  Make sure your server is running!${NC}"
    exit 1
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}All tests completed!${NC}"

echo -e "\n${YELLOW}📝 Notes:${NC}"
echo -e "${YELLOW}- Replace VALID_PROPERTY_ID with an actual property ID from your database${NC}"
echo -e "${YELLOW}- Make sure your server is running on the correct port${NC}"
echo -e "${YELLOW}- Check your database connection and data${NC}"

echo -e "\n${BLUE}💡 Usage Examples:${NC}"
echo -e "${BLUE}curl \"${API_BASE}/properties/YOUR_PROPERTY_ID/booked-slots?date=2024-12-25\"${NC}"
echo -e "${BLUE}curl \"${API_BASE}/properties/YOUR_PROPERTY_ID/booked-slots?date=2024-01-15\"${NC}"
