"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.NodeUpdate = exports.NodeCreate = exports.NodeBase = void 0;
const zod_1 = require("zod");
exports.NodeBase = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
});
exports.NodeCreate = exports.NodeBase.extend({ parentId: zod_1.z.string().nullable().optional(), position: zod_1.z.number().optional() });
exports.NodeUpdate = exports.NodeBase.partial();
exports.LoginSchema = zod_1.z.object({ username: zod_1.z.string(), password: zod_1.z.string() });
