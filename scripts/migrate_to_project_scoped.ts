/**
 * Migration script to convert existing user-owned People/Companies to project-scoped
 * and create personal masterlists.
 * 
 * This script:
 * 1. Creates ProjectMember entries for existing project owners
 * 2. Copies existing People/Companies to PersonalPerson/PersonalCompany tables
 * 3. Updates existing People/Companies to be project-scoped
 * 4. Associates all existing data with appropriate projects
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToProjectScoped() {
  console.log('Starting migration to project-scoped resources...');

  try {
    console.log('Step 1: Creating ProjectMember entries for existing project owners...');
    
    // Get all projects that have owners
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

    console.log('Step 2: Creating personal masterlists from existing People...');
    
    // Get all existing people
    const existingPeople = await prisma.person.findMany({
      where: { userId: { not: null } },
      include: { company: true }
    });

    console.log(`Found ${existingPeople.length} existing people`);

    // Create personal people entries in batches
    const personalPeopleData = existingPeople
      .filter(person => person.userId)
      .map(person => ({
        id: `personal_${person.id}`,
        userId: person.userId!,
        name: person.name,
        hourlyRate: person.hourlyRate,
        notes: `Migrated from existing person data`
      }));

    // Insert in batches to avoid transaction timeout
    const batchSize = 10;
    for (let i = 0; i < personalPeopleData.length; i += batchSize) {
      const batch = personalPeopleData.slice(i, i + batchSize);
      await prisma.personalPerson.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`Created personal people batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(personalPeopleData.length/batchSize)}`);
    }

    console.log('Step 3: Creating personal masterlists from existing Companies...');
    
    // Get all existing companies
    const existingCompanies = await prisma.company.findMany({
      where: { userId: { not: null } }
    });

    console.log(`Found ${existingCompanies.length} existing companies`);

    // Create personal company entries in batches
    const personalCompaniesData = existingCompanies
      .filter(company => company.userId)
      .map(company => ({
        id: `personal_${company.id}`,
        userId: company.userId!,
        name: company.name,
        hourlyRateDefault: company.hourlyRateDefault,
        notes: `Migrated from existing company data`
      }));

    for (let i = 0; i < personalCompaniesData.length; i += batchSize) {
      const batch = personalCompaniesData.slice(i, i + batchSize);
      await prisma.personalCompany.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`Created personal companies batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(personalCompaniesData.length/batchSize)}`);
    }

    console.log('Step 4: Converting existing People to project-scoped...');
    
    // For each person, find which projects they're used in via TimeEntries
    for (const person of existingPeople) {
      if (person.userId) {
        // Find projects where this person has time entries
        const timeEntries = await prisma.timeEntry.findMany({
          where: { personId: person.id },
          select: { projectId: true },
          distinct: ['projectId']
        });

        let projectId: string | null = null;

        // If person has time entries, associate with those projects
        if (timeEntries.length > 0) {
          // For now, associate with the first project (we might need user input for multi-project people)
          projectId = timeEntries[0].projectId;
        } else {
          // If no time entries, associate with any project owned by this user
          const userProject = await prisma.project.findFirst({
            where: { userId: person.userId }
          });
          
          if (userProject) {
            projectId = userProject.id;
          }
        }

        if (projectId) {
          await prisma.person.update({
            where: { id: person.id },
            data: {
              projectId: projectId,
              addedBy: person.userId,
              sourcePersonalPersonId: `personal_${person.id}`,
              addedAt: new Date()
            }
          });
        }
      }
    }

    console.log('Step 5: Converting existing Companies to project-scoped...');
    
    // For each company, find which projects they're used in via TimeEntries
    for (const company of existingCompanies) {
      if (company.userId) {
        // Find projects where this company has time entries
        const timeEntries = await prisma.timeEntry.findMany({
          where: { companyId: company.id },
          select: { projectId: true },
          distinct: ['projectId']
        });

        let projectId: string | null = null;

        // If company has time entries, associate with those projects
        if (timeEntries.length > 0) {
          // For now, associate with the first project
          projectId = timeEntries[0].projectId;
        } else {
          // If no time entries, associate with any project owned by this user
          const userProject = await prisma.project.findFirst({
            where: { userId: company.userId }
          });
          
          if (userProject) {
            projectId = userProject.id;
          }
        }

        if (projectId) {
          await prisma.company.update({
            where: { id: company.id },
            data: {
              projectId: projectId,
              addedBy: company.userId,
              sourcePersonalCompanyId: `personal_${company.id}`,
              addedAt: new Date()
            }
          });
        }
      }
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateToProjectScoped()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateToProjectScoped };
