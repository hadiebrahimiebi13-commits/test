import { prisma } from '../src/prisma';
const bcrypt = require('bcryptjs');

async function main() {
  const pw = await bcrypt.hash('admin', 10);
  const u = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: pw },
    create: { username: 'admin', password: pw, role: 'ADMIN' }
  });
  console.log('Set admin user:', u.username);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => await prisma.$disconnect());
