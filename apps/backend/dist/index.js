"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const pino_1 = __importDefault(require("pino"));
const prisma_1 = require("./prisma");
const auth_1 = __importDefault(require("./routes/auth"));
const nodes_1 = __importDefault(require("./routes/nodes"));
const openapi_1 = require("./openapi");
const logger = (0, pino_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT_BACKEND ? Number(process.env.PORT_BACKEND) : 4000;
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', auth_1.default);
app.use('/nodes', nodes_1.default);
app.get('/docs', (_req, res) => res.json(openapi_1.openapi));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.listen(PORT, async () => {
    logger.info({ port: PORT }, 'Backend listening');
    try {
        await prisma_1.prisma.$connect();
        logger.info('Connected to DB');
    }
    catch (err) {
        logger.error(err, 'DB connect error');
    }
});
