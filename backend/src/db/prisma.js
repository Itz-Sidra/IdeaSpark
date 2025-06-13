const { PrismaClient } = require("../../generated/prisma");

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Add logging for debugging
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;
