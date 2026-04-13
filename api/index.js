import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { z } from 'zod';
import { db } from '../db/index.js';
import { santri } from '../db/schema.js'

import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { admins } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Ambil secret dari env
const SECRET = process.env.JWT_SECRET;

// Endpoint LOGIN
app.post('/api/login', async (c) => {
  const { username, password } = await c.req.parseBody();
  const [user] = await db.select().from(admins).where(eq(admins.username, username));

  if (user && await bcrypt.compare(password, user.password)) {
    const token = await sign({
      user: user.username, 
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Berlaku 24 jam
    }, SECRET);

    // Secure: true hanya untuk https (Vercel), false untuk localhost
    const isProd = process.env.NODE_ENV === 'production';
    setCookie(c, 'admin_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax'
    });

    return c.json({ message: "Login Berhasil" });
  }
  return c.json({ message: "Username atau Password salah!" }, 401);
});

// Endpoint LIHAT DATA (DILINDUNGI)
app.get('/api/admin/santri', async (c) => {
  const token = getCookie(c, 'admin_session');
  if (!token) return c.json({ error: "Akses Ditolak" }, 401);

  try {
    await verify(token, SECRET);
    const data = await db.select().from(santri);
    return c.json(data);
  } catch (err) {
    return c.json({ error: "Sesi Habis, silakan login lagi" }, 401);
  }
});

// Endpoint LOGOUT
app.get('/api/logout', (c) => {
  deleteCookie(c, 'admin_session');
  return c.json({ message: "Berhasil Logout" });
});


// Melayani file statis dari folder public
app.use('/*', serveStatic({ root: './public' }));

// Endpoint Test API
app.get('/api/hello', (c) => c.json({ message: "API PSB Aktif!" }));

app.post('/api/submit', async (c) => {
  try {
    const body = await c.req.parseBody();

    // 1. Validasi Input dengan Zod
    const schema = z.object({
        nama: z.string().min(3, "Nama minimal 3 karakter"),
        gender: z.enum(['Ikhwan', 'Akhwat'], { errormap: () => ({ message: "Pilih gender yang valid" }) }),
        hafalan: z.coerce.number().min(0, "Hafalan tidak boleh minus"),
        wali: z.string().min(3, "Nama wali wajib diisi"),
        'g-recaptcha-response': z.string().min(1, "Centang Captcha terlebih dahulu!")

    });

    const parse = schema.safeParse(body);
    if (!parse.success) {
      return c.json({ error: parse.error.errors[0].message }, 400);
    }

    // 2. Verifikasi Captcha ke Server Google
    const formData = new URLSearchParams();
    formData.append('secret', process.env.RECAPTCHA_SECRET);
    formData.append('response', parse.data['g-recaptcha-response']);

    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData,
      headers: { 'Contect-Type': 'application/x-www-form-urlencoded' }

    });

    const captchaRes = await verify.json();
    if (!captchaRes.success) {
      return c.json({ error: "Verifikasi Captcha Gagal" }, 400);

    }

    // 3. Simpan ke Database
    await db.insert(santri).values({
      nama: parse.data.nama,
      gender: parse.data.gender,
      hafalan: parse.data.hafalan,
      wali: parse.data.wali
    });

    return c.json({ message: "Pendaftaran Berhasil!" });


  } catch (error) {
    return c.json({ error: "Terjadi kesalahan sistem" }, 500);
  }
});


// Global Error Handler
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: 'Terjadi kesalahan internal' }, 500);
});

export default app;