import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  let prisma: PrismaClient;
  
  try {
    // Initialize Prisma client
    prisma = new PrismaClient();
    
    // Check database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Add a simple security check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Starting migration to project-scoped resources...');

    // Step 1: Creating ProjectMember entries for existing project owners
    console.log('Step 1: Creating ProjectMember entries for existing project owners...');
    
    const projectsWithOwners = await prisma.project.findMany({
      where: { userId: { not: null } },
      select: { id: true, userId: true }
    });

    console.log(`Found ${projectsWithOwners.length} projects with owners`);

    // Create ProjectMember entries for each project owner
    for (const project of projectsWithOwners) {
      if (project.userId) {
        await prisma.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: project.userId
            }
          },
          update: {},
          create: {
            projectId: project.id,
            userId: project.userId,
            role: 'OWNER',
            joinedAt: new Date()
          }
        });
      }
    }

    // Step 2: Creating personal masterlists from existing People
    console.log('Step 2: Creating personal masterlists from existing People...');
    
    const existingPeople = await prisma.person.findMany({
      where: { userId: { not: null } },
      include: { company: true }
    });

    console.log(`Found ${existingPeople.length} existing people`);

    // Create personal people entries in batches
    const personalPeopleData = existingPeople
      .filter(person => person.userId)
      .map(person => ({
        userId: person.userId!,
        name: person.name,
        hourlyRate: person.hourlyRate,
        defaultCompanyId: null, // We'll link this after companies are created
        notes: `Migrated from user-owned person on ${new Date().toISOString()}`
      }));

    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < personalPeopleData.length; i += batchSize) {
      const batch = personalPeopleData.slice(i, i + batchSize);
      await prisma.personalPerson.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`Created personal people batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(personalPeopleData.length/batchSize)}`);
    }

    // Step 3: Creating personal masterlists from existing Companies
    console.log('Step 3: Creating personal masterlists from existing Companies...');
    
    const existingCompanies = await prisma.company.findMany({
      where: { userId: { not: null } }
    });

    console.log(`Found ${existingCompanies.length} existing companies`);

    const personalCompaniesData = existingCompanies
      .filter(company => company.userId)
      .map(company => ({
        userId: company.userId!,
        name: company.name,
        hourlyRateDefault: company.hourlyRateDefault,
        notes: `Migrated from user-owned company on ${new Date().toISOString()}`
      }));

    for (let i = 0; i < personalCompaniesData.length; i += batchSize) {
      const batch = personalCompaniesData.slice(i, i + batchSize);
      await prisma.personalCompany.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`Created personal companies batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(personalCompaniesData.length/batchSize)}`);
    }

    // Step 4: Converting existing People to project-scoped
    console.log('Step 4: Converting existing People to project-scoped...');
    
    for (const person of existingPeople) {
      if (person.userId) {
        // Find which project this person should belong to
        const userProjects = await prisma.project.findMany({
          where: { userId: person.userId },
          select: { id: true }
        });

        if (userProjects.length > 0) {
          const projectId = userProjects[0].id; // Use first project as default
          
          await prisma.person.update({
            where: { id: person.id },
            data: {
              projectId: projectId,
              addedBy: person.userId,
              addedAt: new Date()
            }
          });
        }
      }
    }

    // Step 5: Converting existing Companies to project-scoped
    console.log('Step 5: Converting existing Companies to project-scoped...');
    
    for (const company of existingCompanies) {
      if (company.userId) {
        const userProjects = await prisma.project.findMany({
          where: { userId: company.userId },
          select: { id: true }
        });

        if (userProjects.length > 0) {
          const projectId = userProjects[0].id;
          
          await prisma.company.update({
            where: { id: company.id },
            data: {
              projectId: projectId,
              addedBy: company.userId,
              addedAt: new Date()
            }
          });
        }
      }
    }

    console.log('Migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!',
      stats: {
        projectsWithOwners: projectsWithOwners.length,
        existingPeople: existingPeople.length,
        existingCompanies: existingCompanies.length
      }
    });

  } catch (error) {
    console.error('Migration failed:', error);
    if (prisma) {
      await prisma.$disconnect();
    }
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
