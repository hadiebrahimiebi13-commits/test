export const openapi = {
  openapi: '3.0.0',
  info: { title: 'Hierarchy API', version: '0.1.0' },
  paths: {
    '/auth/login': { post: { summary: 'Login' } },
    '/nodes/tree': { get: { summary: 'Get full tree' } }
  }
};
