/**
 * prisma/seed.ts
 * Seed script for dev/staging/early prod only.
 * Creates an admin user if not present. The admin password is hardcoded here
 * for convenience and MUST be rotated after deploy.
 * TODO: In real production, avoid storing admin seeds in the repo; consider
 *       one-time setup flows or temporary tokens instead.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'michael.doroshenko1@gmail.com';
  const name = 'Michael';
  const plainPassword = 'Mido1983!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Ensure admin role/plan; do not change password if already set
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'ADMIN', plan: 'BUSINESS' },
    });
    console.log('Admin already exists; ensured ADMIN/BUSINESS role.');
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      plan: 'BUSINESS',
    },
  });
  console.log('Admin user created:', email);
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

