#!/usr/bin/env node

/**
 * Quick deployment health check script
 * Verifies all health endpoints respond quickly for deployment
 */

const BASE_URL = process.env.REPLIT_DEPLOYMENT_URL || `http://localhost:${process.env.PORT || 5000}`;

const HEALTH_ENDPOINTS = [
  '/',
  '/health',
  '/healthz',
  '/readiness',
  '/liveness',
  '/api/status',
  '/api/health'
];

async function checkEndpoint(endpoint) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Health-Check-Script/1.0'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const isHealthy = response.ok;
    
    console.log(`${endpoint.padEnd(12)} - ${response.status} (${responseTime}ms) ${isHealthy ? '✅' : '❌'}`);
    
    return {
      endpoint,
      healthy: isHealthy,
      responseTime,
      status: response.status
    };
    
  } catch (error) {
    console.log(`${endpoint.padEnd(12)} - ERROR: ${error.message} ❌`);
    return {
      endpoint,
      healthy: false,
      responseTime: -1,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Checking deployment health...');
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = await Promise.all(
    HEALTH_ENDPOINTS.map(checkEndpoint)
  );
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`📊 Health Summary: ${healthyCount}/${totalCount} endpoints healthy`);
  
  if (healthyCount === totalCount) {
    console.log('✅ All health checks passed! Deployment ready.');
    process.exit(0);
  } else {
    console.log('❌ Some health checks failed. Review server logs.');
    process.exit(1);
  }
}

main().catch(console.error);