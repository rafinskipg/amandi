import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or reuse existing PrismaClient instance
// IMPORTANT: This singleton pattern prevents multiple PrismaClient instances
// which would cause "too many connections" errors
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  // Log when a new instance is created (should only happen once)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Prisma] New PrismaClient instance created')
  }
}

// Export the singleton instance
export const prisma = globalForPrisma.prisma

// Handle graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

