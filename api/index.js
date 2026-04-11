import { Hono } from 'hono';
const app = new Hono();

// Melayani file statis dari folder public
app.use('/*', serveStatic({ root: './public' }));

// Endpoint Test API
app.get('/api/hello', (c) => c.json({ message: "API PSB Aktif!" }));

// Tambahkan API lain disini


// Global Error Handler
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: 'Terjadi kesalahan internal' }, 500);
})

export default app;