import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { DATABASE_URL } from "src/common/constants/app.constant";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = new URL(DATABASE_URL as string);
    console.log({url, pathname: url.pathname, database: url.pathname.substring(1)})

    const adapter = new PrismaMariaDb({
        user: url.username,
        password: url.password,
        host: url.hostname,
        port: Number(url.port),
        database: url.pathname.substring(1),
        // logger: {
        //   network: (info) => {
        //     console.log('PrismaAdapterNetwork', info);
        //   },
        //   query: (info) => {
        //     console.log('PrismaAdapterQuery', info);
        //   },
        //   error: (error) => {
        //     console.error('PrismaAdapterError', error);
        //   },
        //   warning: (info) => {
        //     console.warn('PrismaAdapterWarning', info);
        //   },
        // },
    });
    super({ adapter });
  }


  async onModuleInit(){
    try {
      await this.$queryRaw`SELECT 1+1 AS result`;
      console.log('✅ Prisma connected');
    } catch (error) {
      console.error('❌ Prisma connection error:', error);
    }
  }
}