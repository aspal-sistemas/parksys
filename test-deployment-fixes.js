#!/usr/bin/env node

/**
 * Comprehensive test script to verify all deployment fixes
 * Tests all suggested fixes from the deployment error
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

// Health check endpoints to test
const HEALTH_ENDPOINTS = [
  '/',
  '/health',
  '/healthz',
  '/readiness',
  '/liveness',
  '/api/status',
  '/api/health'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const status = res.statusCode;
        
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch {
          parsedData = data;
        }
        
        resolve({
          endpoint,
          status,
          responseTime,
          healthy: status === 200,
          data: parsedData
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        endpoint,
        status: 0,
        responseTime: Date.now() - startTime,
        healthy: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 0,
        responseTime: Date.now() - startTime,
        healthy: false,
        error: 'Timeout'
      });
    });
  });
}

function checkFileIssues() {
  const issues = [];
  
  // Check for duplicate limits in active-concessions-routes.ts
  const activeConcessionsPath = 'server/active-concessions-routes.ts';
  if (fs.existsSync(activeConcessionsPath)) {
    const content = fs.readFileSync(activeConcessionsPath, 'utf8');
    const limitsCount = (content.match(/limits:/g) || []).length;
    if (limitsCount > 1) {
      issues.push(`❌ DUPLICATE LIMITS: Found ${limitsCount} 'limits' configurations in ${activeConcessionsPath}`);
    } else {
      issues.push(`✅ LIMITS FIXED: No duplicate 'limits' configuration found in ${activeConcessionsPath}`);
    }
  }
  
  // Check for getParkImage method in storage interface
  const storagePath = 'server/storage.ts';
  if (fs.existsSync(storagePath)) {
    const content = fs.readFileSync(storagePath, 'utf8');
    const hasInterfaceMethod = content.includes('getParkImage(id: number): Promise<any>');
    const hasImplementation = content.includes('async getParkImage(id: number): Promise<any>');
    
    if (hasInterfaceMethod && hasImplementation) {
      issues.push('✅ PARKIMAGE FIXED: getParkImage method properly defined in interface and implemented');
    } else {
      issues.push('❌ PARKIMAGE ISSUE: getParkImage method missing from interface or implementation');
    }
  }
  
  return issues;
}

async function main() {
  console.log('🚀 Testing Deployment Fixes...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Test file issues
  console.log('\n📁 File Issues Check:');
  const fileIssues = checkFileIssues();
  fileIssues.forEach(issue => console.log(`  ${issue}`));
  
  // Test health endpoints
  console.log('\n💚 Health Endpoints Test:');
  const results = await Promise.all(
    HEALTH_ENDPOINTS.map(testEndpoint)
  );
  
  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌';
    const timeColor = result.responseTime < 50 ? '🟢' : result.responseTime < 200 ? '🟡' : '🔴';
    console.log(`  ${status} ${result.endpoint.padEnd(12)} ${result.status} ${timeColor} ${result.responseTime}ms`);
    
    if (!result.healthy) {
      console.log(`    Error: ${result.error || 'Unknown error'}`);
    }
  });
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalCount;
  
  console.log(`📊 Summary:`);
  console.log(`  • Health Checks: ${healthyCount}/${totalCount} passing`);
  console.log(`  • Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  • File Issues: ${fileIssues.filter(i => i.includes('✅')).length}/${fileIssues.length} fixed`);
  
  if (healthyCount === totalCount && fileIssues.every(i => i.includes('✅'))) {
    console.log('\n🎉 ALL DEPLOYMENT FIXES VERIFIED - READY FOR DEPLOYMENT!');
  } else {
    console.log('\n⚠️  Some issues remain - review above details');
  }
}

main().catch(console.error);