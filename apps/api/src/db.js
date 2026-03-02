"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var client_1 = require("../../../packages/database/src/generated/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({ adapter: adapter });
exports.default = prisma;
