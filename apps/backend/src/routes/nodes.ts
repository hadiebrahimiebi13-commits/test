import { Router } from 'express';
import { prisma } from '../prisma';
import { NodeCreate, NodeUpdate } from '../../../../packages/shared/src/index';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Helper: build path
function buildPath(parentPath: string | null, slug: string) {
  if (!parentPath) return `/${slug}/`;
  return `${parentPath}${slug}/`;
}

// fetch full tree
router.get('/tree', async (req, res) => {
  const nodes = await prisma.node.findMany({ orderBy: [{ path: 'asc' }, { position: 'asc' }] });
  res.json(nodes);
});

router.get('/:id', async (req, res) => {
  const node = await prisma.node.findUnique({ where: { id: req.params.id } });
  if (!node) return res.status(404).json({ error: 'Not found' });
  res.json(node);
});

router.post('/', requireAuth('ADMIN'), async (req, res) => {
  const parsed = NodeCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { title, description, icon, slug, parentId, position } = parsed.data;
  // compute parent path
  let parentPath: string | null = null;
  if (parentId) {
    const parent = await prisma.node.findUnique({ where: { id: parentId } });
    if (!parent) return res.status(400).json({ error: 'Invalid parent' });
    parentPath = parent.path;
  }
  const path = buildPath(parentPath, slug);
  const created = await prisma.node.create({ data: { title, description, icon, slug, parentId, path, position: position ?? 0 } });
  res.json(created);
});

router.patch('/:id', requireAuth('ADMIN'), async (req, res) => {
  const parsed = NodeUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const node = await prisma.node.findUnique({ where: { id: req.params.id } });
  if (!node) return res.status(404).json({ error: 'Not found' });
  const data: any = parsed.data;
  // if slug changed, update path for this node and descendants
  if (data.slug && data.slug !== node.slug) {
    const oldPath = node.path;
    const newPath = buildPath(node.path.split('/').slice(0, -2).join('/') || '', data.slug);
    // update this node and descendants
    await prisma.$transaction([
      prisma.node.update({ where: { id: node.id }, data: { ...data, path: newPath } }),
      prisma.node.updateMany({ where: { path: { startsWith: oldPath } }, data: { path: prisma.$queryRaw`replace(path, ${oldPath}, ${newPath})` as any } }),
    ]);
    return res.json({ ok: true });
  }
  const updated = await prisma.node.update({ where: { id: node.id }, data });
  res.json(updated);
});

router.delete('/:id', requireAuth('ADMIN'), async (req, res) => {
  const node = await prisma.node.findUnique({ where: { id: req.params.id } });
  if (!node) return res.status(404).json({ error: 'Not found' });
  // delete node and descendants by path
  await prisma.node.deleteMany({ where: { path: { startsWith: node.path } } });
  res.json({ ok: true });
});

// move: change parent and position
router.post('/:id/move', requireAuth('ADMIN'), async (req, res) => {
  const { newParentId, newPosition } = req.body as { newParentId?: string | null; newPosition?: number };
  const node = await prisma.node.findUnique({ where: { id: req.params.id } });
  if (!node) return res.status(404).json({ error: 'Not found' });
  // prevent cycles: ensure new parent is not a descendant
  if (newParentId) {
    const parent = await prisma.node.findUnique({ where: { id: newParentId } });
    if (!parent) return res.status(400).json({ error: 'Invalid parent' });
    if (parent.path.startsWith(node.path)) return res.status(400).json({ error: 'Cannot move into descendant' });
    const newPath = buildPath(parent.path, node.slug);
    // update node and descendants paths
    const oldPath = node.path;
    const tx: any[] = [];
    tx.push(prisma.node.update({ where: { id: node.id }, data: { parentId: newParentId, position: newPosition ?? node.position, path: newPath } }));
    tx.push(prisma.node.updateMany({ where: { path: { startsWith: oldPath }, NOT: { id: node.id } }, data: { path: prisma.$queryRaw`replace(path, ${oldPath}, ${newPath})` as any } }));
    await prisma.$transaction(tx);
    return res.json({ ok: true });
  } else {
    // moving to root
    const newPath = buildPath(null, node.slug);
    const oldPath = node.path;
    await prisma.$transaction([
      prisma.node.update({ where: { id: node.id }, data: { parentId: null, position: newPosition ?? node.position, path: newPath } }),
      prisma.node.updateMany({ where: { path: { startsWith: oldPath }, NOT: { id: node.id } }, data: { path: prisma.$queryRaw`replace(path, ${oldPath}, ${newPath})` as any } }),
    ]);
    return res.json({ ok: true });
  }
});

// reorder siblings in bulk
router.post('/:id/reorder', requireAuth('ADMIN'), async (req, res) => {
  const { order } = req.body as { order: Array<{ id: string; position: number }> };
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order' });
  const tx = order.map((o) => prisma.node.update({ where: { id: o.id }, data: { position: o.position } }));
  await prisma.$transaction(tx as any);
  res.json({ ok: true });
});

export default router;
