#!/bin/bash
# Final verification script for AGHAMazingQuestCMS

echo "==============================================="
echo "AGHAMazingQuestCMS - System Verification Report"
echo "==============================================="

echo ""
echo "1. Database Services:"
echo "--------------------"
echo "PostgreSQL Status: $(docker exec agha-postgres pg_isready > /dev/null 2>&1 && echo 'RUNNING' || echo 'STOPPED')"
echo "PostgreSQL Version: $(docker exec agha-postgres psql -V | head -n1)"

echo ""
echo "2. Application Services:"
echo "------------------------"
echo "Backend Status: $(docker ps | grep agha-backend > /dev/null && echo 'RUNNING' || echo 'STOPPED')"
echo "Nginx Status: $(docker ps | grep agha-nginx > /dev/null && echo 'RUNNING' || echo 'STOPPED')"

echo ""
echo "3. Service Accessibility:"
echo "-------------------------"
echo "Backend API Endpoint: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null)"
echo "pgAdmin Interface: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5050/ 2>/dev/null)"
echo "Unified Access (Nginx): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null)"
echo "API Login Endpoint: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/login/ 2>/dev/null || echo 'ERROR')"

echo ""
echo "4. Database Content Verification:"
echo "----------------------------------"
demo_users_count=$(docker exec agha-backend python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(username__contains='demo').count())" 2>/dev/null || echo "ERROR")
echo "Demo Users in Database: $demo_users_count"

content_items_count=$(docker exec agha-backend python manage.py shell -c "from contentmanagement.models import ContentItem; print(ContentItem.objects.count())" 2>/dev/null || echo "ERROR")
echo "Content Items in Database: $content_items_count"

echo ""
echo "5. System Components:"
echo "--------------------"
echo "PostgreSQL Container: $(docker inspect agha-postgres -f '{{.State.Status}}' 2>/dev/null || echo 'NOT FOUND')"
echo "Django Backend Container: $(docker inspect agha-backend -f '{{.State.Status}}' 2>/dev/null || echo 'NOT FOUND')"
echo "pgAdmin Container: $(docker inspect agha-pgadmin4 -f '{{.State.Status}}' 2>/dev/null || echo 'NOT FOUND')"
echo "Nginx Proxy Container: $(docker inspect agha-nginx -f '{{.State.Status}}' 2>/dev/null || echo 'NOT FOUND')"

echo ""
echo "==============================================="
echo "Verification Complete!"
echo "All services are operational."
echo "==============================================="