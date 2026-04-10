#!/bin/bash
echo "🔥 Starting Local Smoke Test Suite"
echo "==================================="

check_service() {
    local NAME=$1
    local URL=$2
    
    # Send request and capture HTTP Status Code
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        echo "✅ [PASS] $NAME is online ($URL)"
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 404 ]; then
        echo "✅ [PASS] $NAME is online ($URL) [Expected Gateway Response: HTTP $HTTP_CODE]"
    else
        echo "❌ [FAIL] $NAME is DOWN or unreachable ($URL) [HTTP $HTTP_CODE]"
        exit 1
    fi
}

check_service "Backend Express API" "http://localhost:3000/api/v1/keys"
check_service "Admin Dashboard UI (Vite)" "http://localhost:5173"
check_service "B2B Developer Portal UI (Vite)" "http://localhost:5174"
check_service "Demo Application UI (Vite)" "http://localhost:5175"

echo "==================================="
echo "✅ All required HTTP ports and services are successfully bound!"
