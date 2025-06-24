// Network connectivity test utility
export async function testNetworkConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.error('Network test failed:', error);
    return false;
  }
}

export async function testAPIEndpoint(endpoint: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer direct-token-1750522117022'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    return {
      success: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}