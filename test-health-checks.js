#!/usr/bin/env node

/**
 * Health check test script for deployment verification
 * Tests all critical health check endpoints and measures response times
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const HEALTH_ENDPOINTS = [
  '/',
  '/health',
  '/healthz',
  '/readiness',
  '/liveness',
  '/api/status',
  '/api/health'
];

async function testHealthCheck(endpoint) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      timeout: 5000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const status = response.status;
    const statusText = response.statusText;
    
    let result = `✅ ${endpoint.padEnd(15)} - ${status} ${statusText} (${responseTime}ms)`;
    
    if (response.ok) {
      if (responseTime <= 50) {
        result += ' 🚀 ULTRA FAST';
      } else if (responseTime <= 100) {
        result += ' ⚡ FAST';
      } else if (responseTime <= 500) {
        result += ' 🟡 ACCEPTABLE';
      } else {
        result += ' 🔴 SLOW';
      }
    } else {
      result = `❌ ${endpoint.padEnd(15)} - ${status} ${statusText} (${responseTime}ms)`;
    }
    
    console.log(result);
    
    return {
      endpoint,
      status,
      responseTime,
      success: response.ok
    };
    
  } catch (error) {
    console.log(`❌ ${endpoint.padEnd(15)} - ERROR: ${error.message}`);
    return {
      endpoint,
      status: 0,
      responseTime: -1,
      success: false,
      error: error.message
    };
  }
}

async function runHealthCheckTests() {
  console.log('🔍 Testing Health Check Endpoints for Deployment Readiness');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of HEALTH_ENDPOINTS) {
    const result = await testHealthCheck(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
  
  console.log('\n📊 SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.success && r.responseTime > 0)
    .reduce((sum, r) => sum + r.responseTime, 0) / successful;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  
  const deploymentReady = successful === results.length && avgResponseTime <= 100;
  
  console.log('\n🚀 DEPLOYMENT READINESS');
  console.log('=' .repeat(60));
  
  if (deploymentReady) {
    console.log('✅ READY FOR DEPLOYMENT');
    console.log('   - All health checks passing');
    console.log('   - Response times within acceptable limits');
    console.log('   - Server responding consistently');
  } else {
    console.log('❌ NOT READY FOR DEPLOYMENT');
    console.log('   - Some health checks failing or too slow');
    console.log('   - Review server configuration');
  }
  
  process.exit(deploymentReady ? 0 : 1);
}

runHealthCheckTests().catch(console.error);