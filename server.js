import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import apiApp from './api/index.js';

const app = new Hono();

// 1. Melayani File Statis (Frontend)
app.use('/*', serveStatic({ root: './public' }));

// 2. Gunakan Lokiga API dari api/index.js
app.route('/', apiApp);

const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port
});
