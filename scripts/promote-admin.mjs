import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const firstUser = await prisma.profile.findFirst();
  if (!firstUser) {
    console.log("No users found. Sign up first.");
  } else {
    const updated = await prisma.profile.update({
      where: { id: firstUser.id },
      data: { role: "ADMIN" },
    });
    console.log(`Promoted "${updated.name}" (${updated.email}) to ADMIN`);
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await pool.end();
  process.exit(0);
}
