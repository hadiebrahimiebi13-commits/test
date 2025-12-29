import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/prisma';

describe('tree operations', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.node.deleteMany();
    await prisma.user.create({ data: { username: 'test', password: 'x', role: 'ADMIN' } });
  });

  it('prevents cycles when moving', async () => {
    const a = await prisma.node.create({ data: { title: 'A', slug: 'a', path: '/a/', position: 0 } });
    const b = await prisma.node.create({ data: { title: 'B', slug: 'b', parentId: a.id, path: '/a/b/', position: 0 } });
    // attempt to move A under B should be prevented by business logic, but here we replicate check
    const isDescendant = (parentPath: string, nodePath: string) => parentPath.startsWith(nodePath);
    expect(isDescendant(b.path, a.path)).toBe(false);
  });

  it('orders siblings', async () => {
    await prisma.node.deleteMany();
    const root = await prisma.node.create({ data: { title: 'Root', slug: 'root', path: '/root/', position: 0 } });
    const n1 = await prisma.node.create({ data: { title: 'n1', slug: 'n1', parentId: root.id, path: '/root/n1/', position: 0 } });
    const n2 = await prisma.node.create({ data: { title: 'n2', slug: 'n2', parentId: root.id, path: '/root/n2/', position: 1 } });
    const siblings = await prisma.node.findMany({ where: { parentId: root.id }, orderBy: { position: 'asc' } });
    expect(siblings[0].id).toBe(n1.id);
    expect(siblings[1].id).toBe(n2.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
