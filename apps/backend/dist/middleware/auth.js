"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function requireAuth(role) {
    return (req, res, next) => {
        const token = req.cookies['app_token'] || req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Not authenticated' });
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (role && payload.role !== role)
                return res.status(403).json({ error: 'Forbidden' });
            // attach user
            req.user = payload;
            next();
        }
        catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}
