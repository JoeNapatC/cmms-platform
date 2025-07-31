import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full system access',
      permissions: {
        assets: ['create', 'read', 'update', 'delete'],
        workOrders: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        reports: ['read']
      }
    }
  });

  const technicianRole = await prisma.role.upsert({
    where: { name: 'Technician' },
    update: {},
    create: {
      name: 'Technician',
      description: 'Maintenance technician access',
      permissions: {
        assets: ['read', 'update'],
        workOrders: ['read', 'update'],
        inventory: ['read', 'update']
      }
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Maintenance manager access',
      permissions: {
        assets: ['create', 'read', 'update'],
        workOrders: ['create', 'read', 'update', 'delete'],
        inventory: ['read'],
        reports: ['read']
      }
    }
  });

  // Create locations
  const mainSite = await prisma.location.upsert({
    where: { id: 'main-site' },
    update: {},
    create: {
      id: 'main-site',
      name: 'Main Manufacturing Site',
      type: 'SITE',
      description: 'Primary manufacturing facility'
    }
  });

  const building1 = await prisma.location.upsert({
    where: { id: 'building-1' },
    update: {},
    create: {
      id: 'building-1',
      name: 'Building 1 - Production',
      type: 'BUILDING',
      parentId: mainSite.id,
      description: 'Main production building'
    }
  });

  const floor1 = await prisma.location.upsert({
    where: { id: 'floor-1' },
    update: {},
    create: {
      id: 'floor-1',
      name: 'Floor 1',
      type: 'FLOOR',
      parentId: building1.id
    }
  });

  // Create categories
  const mechanicalCategory = await prisma.category.upsert({
    where: { id: 'mechanical' },
    update: {},
    create: {
      id: 'mechanical',
      name: 'Mechanical Equipment',
      description: 'Pumps, motors, compressors, etc.'
    }
  });

  const electricalCategory = await prisma.category.upsert({
    where: { id: 'electrical' },
    update: {},
    create: {
      id: 'electrical',
      name: 'Electrical Equipment',
      description: 'Motors, panels, transformers, etc.'
    }
  });

  // Create sample assets
  const pump1 = await prisma.asset.upsert({
    where: { tag: 'PUMP-001' },
    update: {},
    create: {
      tag: 'PUMP-001',
      serialNumber: 'SN123456',
      model: 'XYZ-500',
      manufacturer: 'PumpCorp',
      purchaseDate: new Date('2023-01-15'),
      commissioningDate: new Date('2023-02-01'),
      warrantyExpiry: new Date('2025-02-01'),
      lifecycleStatus: 'ACTIVE',
      criticality: 'HIGH',
      locationId: floor1.id,
      categoryId: mechanicalCategory.id,
      cost: 15000.00,
      description: 'Main circulation pump for cooling system'
    }
  });

  const motor1 = await prisma.asset.upsert({
    where: { tag: 'MOTOR-001' },
    update: {},
    create: {
      tag: 'MOTOR-001',
      serialNumber: 'MT789012',
      model: 'ABC-750',
      manufacturer: 'MotorTech',
      purchaseDate: new Date('2023-03-10'),
      commissioningDate: new Date('2023-03-20'),
      warrantyExpiry: new Date('2026-03-20'),
      lifecycleStatus: 'ACTIVE',
      criticality: 'MEDIUM',
      locationId: floor1.id,
      categoryId: electricalCategory.id,
      cost: 8500.00,
      description: 'Drive motor for conveyor system'
    }
  });

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cmms.com' },
    update: {},
    create: {
      email: 'admin@cmms.com',
      name: 'System Administrator',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      roleId: adminRole.id,
      isActive: true
    }
  });

  // Create sample spare parts
  const bearingPart = await prisma.sparePart.upsert({
    where: { partNumber: 'BRG-6205' },
    update: {},
    create: {
      partNumber: 'BRG-6205',
      name: 'Deep Groove Ball Bearing 6205',
      description: 'Standard bearing for motor applications',
      unitCost: 25.50
    }
  });

  const sealPart = await prisma.sparePart.upsert({
    where: { partNumber: 'SEAL-001' },
    update: {},
    create: {
      partNumber: 'SEAL-001',
      name: 'Mechanical Seal Kit',
      description: 'Seal kit for centrifugal pumps',
      unitCost: 125.00
    }
  });

  // Create inventory records
  await prisma.inventoryRecord.upsert({
    where: { 
      partId_locationId: {
        partId: bearingPart.id,
        locationId: mainSite.id
      }
    },
    update: {},
    create: {
      partId: bearingPart.id,
      locationId: mainSite.id,
      quantityOnHand: 50,
      reorderPoint: 10,
      safetyStock: 5
    }
  });

  await prisma.inventoryRecord.upsert({
    where: { 
      partId_locationId: {
        partId: sealPart.id,
        locationId: mainSite.id
      }
    },
    update: {},
    create: {
      partId: sealPart.id,
      locationId: mainSite.id,
      quantityOnHand: 15,
      reorderPoint: 3,
      safetyStock: 2
    }
  });

  // Create sample maintenance plans
  await prisma.maintenancePlan.create({
    data: {
      assetId: pump1.id,
      name: 'Monthly Pump Inspection',
      type: 'TIME_BASED',
      frequency: 30, // 30 days
      isActive: true,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  await prisma.maintenancePlan.create({
    data: {
      assetId: motor1.id,
      name: 'Quarterly Motor Maintenance',
      type: 'TIME_BASED',
      frequency: 90, // 90 days
      isActive: true,
      nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created roles: ${adminRole.name}, ${technicianRole.name}, ${managerRole.name}`);
  console.log(`Created locations: ${mainSite.name}, ${building1.name}, ${floor1.name}`);
  console.log(`Created assets: ${pump1.tag}, ${motor1.tag}`);
  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Created spare parts: ${bearingPart.partNumber}, ${sealPart.partNumber}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });