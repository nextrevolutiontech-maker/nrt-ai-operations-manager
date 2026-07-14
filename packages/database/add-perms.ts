import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    'read:sales', 'manage:sales',
    'read:catalog', 'manage:catalog',
    'read:inventory', 'manage:inventory',
    'read:finance', 'manage:finance',
    'read:procurement', 'manage:procurement',
    'read:workflows', 'manage:workflows',
    'read:report', 'manage:report',
    'export:report', 'manage:notifications',
    'create:dashboard'
  ];

  // get Admin role
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (!adminRole) {
    console.log("Admin role not found!");
    return;
  }

  for (const permName of permissions) {
    let perm = await prisma.permission.findFirst({ where: { name: permName } });
    if (!perm) {
      perm = await prisma.permission.create({
        data: { name: permName, description: `Auto-generated permission: ${permName}` }
      });
      console.log(`Created permission: ${permName}`);
    }

    const existingLink = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: perm.id }
    });
    
    if (!existingLink) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id }
      });
      console.log(`Assigned ${permName} to Admin role`);
    }
  }

  console.log('All missing permissions successfully injected.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
