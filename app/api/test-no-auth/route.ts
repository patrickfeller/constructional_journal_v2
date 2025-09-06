import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing POST without auth...');
    
    // Test environment variables
    const envTest = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasMigrationSecret: !!process.env.MIGRATION_SECRET,
      migrationSecretValue: process.env.MIGRATION_SECRET ? 'SET' : 'NOT_SET',
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('MIGRATION') || key.includes('DATABASE')
      )
    };
    
    console.log('Environment test:', envTest);
    
    // Test auth header
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'default-fallback';
    
    const authTest = {
      authHeaderReceived: !!authHeader,
      expectedToken: expectedToken.substring(0, 10) + '...',
      authMatches: authHeader === `Bearer ${expectedToken}`
    };
    
    console.log('Auth test:', authTest);
    
    return NextResponse.json({
      success: true,
      message: 'POST test without auth successful',
      tests: {
        environment: envTest,
        authentication: authTest
      }
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}
