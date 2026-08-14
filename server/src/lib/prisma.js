import { PrismaClient } from '@prisma/client';

// Singleton pattern — prevents exhausting Neon's connection limit
// from hot-reloads in dev or multiple imports.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}