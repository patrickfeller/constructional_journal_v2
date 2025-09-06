import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple POST endpoint called');
    
    return NextResponse.json({
      success: true,
      message: 'Simple POST works',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple POST failed:', error);
    return NextResponse.json({
      error: 'Simple POST failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
