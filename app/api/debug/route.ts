import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Debug endpoint called');
    
    // Test 1: Basic response
    const step1 = { message: 'Step 1: Basic POST works' };
    console.log('Step 1 passed');
    
    // Test 2: Environment variables
    const step2 = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      hasMigrationSecret: !!process.env.MIGRATION_SECRET,
      nodeEnv: process.env.NODE_ENV
    };
    console.log('Step 2 passed:', step2);
    
    // Test 3: Headers
    const authHeader = request.headers.get('authorization');
    const step3 = {
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader?.substring(0, 20) + '...' || 'none'
    };
    console.log('Step 3 passed:', step3);
    
    // Test 4: Try importing Prisma (but don't instantiate yet)
    let step4;
    try {
      const { PrismaClient } = await import('@prisma/client');
      step4 = { prismaImport: 'success', prismaClientExists: !!PrismaClient };
    } catch (importError) {
      step4 = { 
        prismaImport: 'failed', 
        error: importError instanceof Error ? importError.message : 'unknown' 
      };
    }
    console.log('Step 4 passed:', step4);
    
    return NextResponse.json({
      success: true,
      message: 'Debug tests completed',
      tests: { step1, step2, step3, step4 }
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Debug endpoint is working',
    method: 'GET',
    timestamp: new Date().toISOString()
  });
}
