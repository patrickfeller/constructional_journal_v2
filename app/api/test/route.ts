import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasMigrationSecret: !!process.env.MIGRATION_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'default-token';
    
    return NextResponse.json({ 
      message: 'POST endpoint working!',
      authHeaderReceived: !!authHeader,
      authHeaderMatches: authHeader === `Bearer ${expectedToken}`,
      expectedToken: expectedToken.substring(0, 10) + '...'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'POST test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
