"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const _shared_1 = require("@shared");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
router.post('/login', async (req, res) => {
    const parsed = _shared_1.LoginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.format() });
    const { username, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('app_token', token, { httpOnly: true });
    res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } });
});
router.post('/logout', (_req, res) => {
    res.clearCookie('app_token');
    res.json({ ok: true });
});
router.get('/me', async (req, res) => {
    const token = req.cookies['app_token'] || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            return res.status(401).json({ error: 'Not found' });
        res.json({ id: user.id, username: user.username, role: user.role });
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.default = router;
