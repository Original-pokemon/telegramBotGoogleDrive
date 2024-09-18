/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "#root/logger.js";
import { Prisma, PrismaClient } from "@prisma/client";

export interface IDataBase {
  client: PrismaClient;
  init(): Promise<boolean>;
  disconnect(): Promise<boolean>;
}

class DataBase implements IDataBase {
  private database?: PrismaClient;

  private prisma;

  constructor() {
    const prisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "event",
          level: "error",
        },
        {
          emit: "event",
          level: "info",
        },
        {
          emit: "event",
          level: "warn",
        },
      ],
    });

    prisma.$on("query", (event: Prisma.QueryEvent) => {
      logger.trace({
        msg: "database query",
        query: event.query,
        params: event.params,
        duration: event.duration,
      });
    });

    prisma.$on("error", (event: Prisma.LogEvent) => {
      logger.error({
        msg: "database error",
        target: event.target,
        message: event.message,
      });
    });

    prisma.$on("info", (event: Prisma.LogEvent) => {
      logger.info({
        msg: "database info",
        target: event.target,
        message: event.message,
      });
    });

    prisma.$on("warn", (event: Prisma.LogEvent) => {
      logger.warn({
        msg: "database warning",
        target: event.target,
        message: event.message,
      });
    });

    prisma.$extends({
      name: "findManyAndCount",
      model: {
        $allModels: {
          findManyAndCount<Model, Arguments>(
            this: Model,
            arguments_: Prisma.Exact<Arguments, Prisma.Args<Model, "findMany">>,
          ): Promise<[Prisma.Result<Model, Arguments, "findMany">, number]> {
            return prisma.$transaction([
              (this as any).findMany(arguments_),
              (this as any).count({ where: (arguments_ as any).where }),
            ]) as any;
          },
        },
      },
    });

    this.prisma = prisma;
  }

  get client() {
    if (this.database) {
      return this.database;
    }
    throw new Error("Database not initialized");
  }

  async init() {
    try {
      if (this.database) {
        logger.warn("Database is already initialized");
        return true;
      }

      await this.prisma.$connect();

      logger.info("Database initialized");
      this.database = this.prisma;
      return true;
    } catch (error) {
      throw new Error(`Error initializing database\n${error}`);
    }
  }

  async disconnect() {
    if (this.database) {
      try {
        await this.database.$disconnect();
        return true;
      } catch {
        throw new Error("Error disconnecting client");
      }
    }
    logger.warn("Database not initialized");
    return false;
  }
}

export default new DataBase();
