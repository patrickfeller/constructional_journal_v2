import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Add a simple security check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Import Prisma dynamically to avoid issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    console.log('Testing database connection...');
    
    // Test database connection first
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful');

    // Check if migration is needed
    const existingProjectMembers = await prisma.projectMember.count();
    console.log(`Found ${existingProjectMembers} existing project members`);

    if (existingProjectMembers > 0) {
      await prisma.$disconnect();
      return NextResponse.json({ 
        message: 'Migration already completed',
        existingProjectMembers 
      });
    }

    // Get projects
    const projects = await prisma.project.findMany({
      where: { userId: { not: null } },
      select: { id: true, userId: true }
    });

    console.log(`Found ${projects.length} projects to migrate`);

    // Create project members one by one (safer)
    let createdMembers = 0;
    for (const project of projects) {
      if (project.userId) {
        try {
          await prisma.projectMember.create({
            data: {
              projectId: project.id,
              userId: project.userId,
              role: 'OWNER',
              joinedAt: new Date()
            }
          });
          createdMembers++;
        } catch (error) {
          console.log(`Project member might already exist for project ${project.id}`);
        }
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true,
      message: `Created ${createdMembers} project members`,
      stats: {
        projects: projects.length,
        createdMembers
      }
    });

  } catch (error) {
    console.error('Migration failed:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'UnknownError'
    }, { status: 500 });
  }
}
