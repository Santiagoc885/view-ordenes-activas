import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL no está configurada');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { password: adminPass },
      create: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: adminPass,
        role: 'admin',
        status: 'ACTIVE',
      },
    });

    const user = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: { password: userPass },
      create: {
        email: 'user@test.com',
        name: 'Regular User',
        password: userPass,
        role: 'user',
        status: 'ACTIVE',
      },
    });

    console.log('✓ Admin creado/actualizado:', admin.email, '- rol:', admin.role);
    console.log('✓ Usuario creado/actualizado:', user.email, '- rol:', user.role);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
