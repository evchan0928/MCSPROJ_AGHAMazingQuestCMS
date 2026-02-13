#!/bin/bash

echo "Comprehensive Full-Stack Test for AghaAmazingQuestCMS"
echo "====================================================="

# Test 1: Backend API endpoints
echo ""
echo "Test 1: Testing Backend API Endpoints"
echo "-------------------------------------"

echo "Testing API root endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/

echo "Testing dashboard stats endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/user-management/dashboard/stats/

echo "Testing users endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/user-management/

echo "Testing content management endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/content-management/

echo "Testing authentication endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/auth/current-user/

# Test 2: Frontend page availability
echo ""
echo "Test 2: Testing Frontend Page Availability"
echo "------------------------------------------"

echo "Testing frontend root (should redirect)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/

echo "Testing login page..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/login

echo "Testing dashboard root..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/dashboard

# Test 3: Authentication flow
echo ""
echo "Test 3: Testing Authentication Flow"
echo "-----------------------------------"

echo "Attempting to login with test credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Login response status: $?"
echo "Login response body preview:"
echo "$LOGIN_RESPONSE" | head -c 200

# Test 4: Functional testing of major pages
echo ""
echo "Test 4: Testing Major Application Pages"
echo "---------------------------------------"

echo "Testing dashboard stats API (requires auth):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/user-management/dashboard/stats/

echo "Testing content listing API (requires auth):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/content-management/

echo "Testing user management API (requires auth):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/user-management/

# Test 5: Content upload functionality
echo ""
echo "Test 5: Testing Content Upload Endpoint"
echo "---------------------------------------"

echo "Testing content creation endpoint (requires auth):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/content-management/create/

# Test 6: User management functionality
echo ""
echo "Test 6: Testing User Management"
echo "-------------------------------"

echo "Testing user creation endpoint (requires auth):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/user-management/

# Test 7: Frontend routing
echo ""
echo "Test 7: Testing Frontend Routing"
echo "--------------------------------"

FRONTEND_PAGES=(
  "login"
  "register"
  "dashboard"
  "dashboard/content/list"
  "dashboard/content/upload"
  "dashboard/content/approve"
  "dashboard/users"
  "dashboard/analytics"
)

for page in "${FRONTEND_PAGES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$page")
  echo "Page /$page: Status $status"
done

echo ""
echo "Comprehensive Test Complete!"
echo "============================="
echo "Please manually verify the following in your browser:"
echo "- Login to the application"
echo "- Navigate to each dashboard section"
echo "- Try creating/updating content"
echo "- Try managing users"
echo "- Verify all functionality works as expected"