import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

export const santri = pgTable('santri', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  gender: varchar('gender', { length: 20 }).notNull(), // Misalnya: 'Laki-laki' atau 'Perempuan'
  hafalan: integer('hafalan').default(0),
  wali: varchar('wali', { length: 255 }).notNull(),
  no_telepon: varchar('no_telepon', { length: 15 }).notNull(),
  alamat: varchar('alamat', { length: 255}).notNull()
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull() // Panjang 255 aman untuk hash password (bcrypt/argon2)
});
