"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const _shared_1 = require("@shared");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Helper: build path
function buildPath(parentPath, slug) {
    if (!parentPath)
        return `/${slug}/`;
    return `${parentPath}${slug}/`;
}
// fetch full tree
router.get('/tree', async (req, res) => {
    const nodes = await prisma_1.prisma.node.findMany({ orderBy: [{ path: 'asc' }, { position: 'asc' }] });
    res.json(nodes);
});
router.get('/:id', async (req, res) => {
    const node = await prisma_1.prisma.node.findUnique({ where: { id: req.params.id } });
    if (!node)
        return res.status(404).json({ error: 'Not found' });
    res.json(node);
});
router.post('/', (0, auth_1.requireAuth)('ADMIN'), async (req, res) => {
    const parsed = _shared_1.NodeCreate.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.format() });
    const { title, description, icon, slug, parentId, position } = parsed.data;
    // compute parent path
    let parentPath = null;
    if (parentId) {
        const parent = await prisma_1.prisma.node.findUnique({ where: { id: parentId } });
        if (!parent)
            return res.status(400).json({ error: 'Invalid parent' });
        parentPath = parent.path;
    }
    const path = buildPath(parentPath, slug);
    const created = await prisma_1.prisma.node.create({ data: { title, description, icon, slug, parentId, path, position: position ?? 0 } });
    res.json(created);
});
router.patch('/:id', (0, auth_1.requireAuth)('ADMIN'), async (req, res) => {
    const parsed = _shared_1.NodeUpdate.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.format() });
    const node = await prisma_1.prisma.node.findUnique({ where: { id: req.params.id } });
    if (!node)
        return res.status(404).json({ error: 'Not found' });
    const data = parsed.data;
    // if slug changed, update path for this node and descendants
    if (data.slug && data.slug !== node.slug) {
        const oldPath = node.path;
        const newPath = buildPath(node.path.split('/').slice(0, -2).join('/') || '', data.slug);
        // update this node and descendants
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.node.update({ where: { id: node.id }, data: { ...data, path: newPath } }),
            prisma_1.prisma.node.updateMany({ where: { path: { startsWith: oldPath } }, data: { path: prisma_1.prisma.$queryRaw `replace(path, ${oldPath}, ${newPath})` } }),
        ]);
        return res.json({ ok: true });
    }
    const updated = await prisma_1.prisma.node.update({ where: { id: node.id }, data });
    res.json(updated);
});
router.delete('/:id', (0, auth_1.requireAuth)('ADMIN'), async (req, res) => {
    const node = await prisma_1.prisma.node.findUnique({ where: { id: req.params.id } });
    if (!node)
        return res.status(404).json({ error: 'Not found' });
    // delete node and descendants by path
    await prisma_1.prisma.node.deleteMany({ where: { path: { startsWith: node.path } } });
    res.json({ ok: true });
});
// move: change parent and position
router.post('/:id/move', (0, auth_1.requireAuth)('ADMIN'), async (req, res) => {
    const { newParentId, newPosition } = req.body;
    const node = await prisma_1.prisma.node.findUnique({ where: { id: req.params.id } });
    if (!node)
        return res.status(404).json({ error: 'Not found' });
    // prevent cycles: ensure new parent is not a descendant
    if (newParentId) {
        const parent = await prisma_1.prisma.node.findUnique({ where: { id: newParentId } });
        if (!parent)
            return res.status(400).json({ error: 'Invalid parent' });
        if (parent.path.startsWith(node.path))
            return res.status(400).json({ error: 'Cannot move into descendant' });
        const newPath = buildPath(parent.path, node.slug);
        // update node and descendants paths
        const oldPath = node.path;
        const tx = [];
        tx.push(prisma_1.prisma.node.update({ where: { id: node.id }, data: { parentId: newParentId, position: newPosition ?? node.position, path: newPath } }));
        tx.push(prisma_1.prisma.node.updateMany({ where: { path: { startsWith: oldPath }, NOT: { id: node.id } }, data: { path: prisma_1.prisma.$queryRaw `replace(path, ${oldPath}, ${newPath})` } }));
        await prisma_1.prisma.$transaction(tx);
        return res.json({ ok: true });
    }
    else {
        // moving to root
        const newPath = buildPath(null, node.slug);
        const oldPath = node.path;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.node.update({ where: { id: node.id }, data: { parentId: null, position: newPosition ?? node.position, path: newPath } }),
            prisma_1.prisma.node.updateMany({ where: { path: { startsWith: oldPath }, NOT: { id: node.id } }, data: { path: prisma_1.prisma.$queryRaw `replace(path, ${oldPath}, ${newPath})` } }),
        ]);
        return res.json({ ok: true });
    }
});
// reorder siblings in bulk
router.post('/:id/reorder', (0, auth_1.requireAuth)('ADMIN'), async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order))
        return res.status(400).json({ error: 'Invalid order' });
    const tx = order.map((o) => prisma_1.prisma.node.update({ where: { id: o.id }, data: { position: o.position } }));
    await prisma_1.prisma.$transaction(tx);
    res.json({ ok: true });
});
exports.default = router;
