import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting minimal migration test...');
    
    // Just test if we can access environment variables
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'DATABASE_URL not found',
        env: Object.keys(process.env).filter(key => key.includes('DATABASE'))
      }, { status: 500 });
    }

    console.log('Database URL found, length:', databaseUrl.length);
    
    // Try to import and test Prisma step by step
    console.log('Importing PrismaClient...');
    const { PrismaClient } = await import('@prisma/client');
    console.log('PrismaClient imported successfully');
    
    console.log('Creating PrismaClient instance...');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaClient instance created');
    
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query successful:', result);
    
    await prisma.$disconnect();
    console.log('Disconnected from database');
    
    return NextResponse.json({
      success: true,
      message: 'Minimal database test successful',
      testResult: result
    });

  } catch (error) {
    console.error('Minimal migration failed:', error);
    return NextResponse.json({
      error: 'Minimal migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'UnknownError'
    }, { status: 500 });
  }
}
