import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import apiApp from './api/index.js';

console.log("cek server.js");

const app = new Hono();

// 2. Gunakan Lokiga API dari api/index.js
app.route('/', apiApp);

// 1. Melayani File Statis (Frontend)
app.use('/*', serveStatic({ root: './public' }));

const port = 3223;

serve({
    fetch: app.fetch,
    port
});

console.log(`Server running on http://localhost:${port}`);