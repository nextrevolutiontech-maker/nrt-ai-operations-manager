#!/bin/sh

# Container Healthcheck Script for NRT AI Operations Manager
API_HEALTH_URL="http://localhost:3001/api/health/readiness"

echo "Checking API Readiness at ${API_HEALTH_URL}..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${API_HEALTH_URL})

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "SUCCESS: API Readiness Check PASSED (HTTP 200)"
    exit 0
else
    echo "ERROR: API Readiness Check FAILED (HTTP ${HTTP_STATUS})"
    exit 1
fi
