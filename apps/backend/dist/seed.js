"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./prisma");
// use require to avoid missing type declaration issues in ts-node
const bcrypt = require('bcryptjs');
async function seed() {
    await prisma_1.prisma.user.deleteMany();
    await prisma_1.prisma.node.deleteMany();
    const password = await bcrypt.hash('password', 10);
    await prisma_1.prisma.user.create({ data: { username: 'admin', password, role: 'ADMIN' } });
    // create sample tree using materialized path
    const root = await prisma_1.prisma.node.create({ data: { title: 'Home', slug: 'home', path: '/home/', position: 0 } });
    const about = await prisma_1.prisma.node.create({ data: { title: 'About', slug: 'about', parentId: root.id, path: '/home/about/', position: 0 } });
    await prisma_1.prisma.node.create({ data: { title: 'Team', slug: 'team', parentId: about.id, path: '/home/about/team/', position: 0 } });
    await prisma_1.prisma.node.create({ data: { title: 'Products', slug: 'products', parentId: root.id, path: '/home/products/', position: 1 } });
    await prisma_1.prisma.node.create({ data: { title: 'Product A', slug: 'a', parentId: root.id, path: '/home/a/', position: 0 } });
    console.log('Seed complete');
}
seed()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
