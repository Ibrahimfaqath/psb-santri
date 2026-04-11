import { db } from './index.js';
import { santri, admins } from './schema.js';
import bcrypt from 'bcryptjs';

async function main() {
    try {
        console.log('Seeding data...');

        // Hapus data lama jika perlu (Optional)
        // db.delete(santri);

        await db.insert(santri).values({
            nama: "Umar",
            gender: "Ikhwan",
            hafalan: 5,
            wali: "Bapak Abdul Aziz"
        });

        const hashed = await bcrypt.hash('admin123', 10);
        await db.insert(admins).values({
            username: "adminpondok",
            password: hashed
        });

        console.log('Seed Selesai!');
    } catch (error) {
        console.error('Seed Gagal:', error);
    } finally {
        process.exit(0);
    }
}

main();