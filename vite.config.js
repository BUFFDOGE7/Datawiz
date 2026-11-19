import { defineConfig, loadEnv } from 'vite';
import { loadData } from './server/data.js';

export default defineConfig(({ mode }) => {
  // Read the workbook settings on the server. The browser only requests /api/data.
  const env = loadEnv(mode, process.cwd(), ['SHEET_ID', 'TAB_GIDS']);
  return {
    server: { host: '127.0.0.1' },
    plugins: [{
      name: 'class-data-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.split('?')[0] !== '/api/data') return next();
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          try {
            res.end(JSON.stringify(await loadData(env), null, 2));
          } catch (error) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      },
    }],
  };
});
