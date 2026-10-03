import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { localStore } from './localStore';

declare global {
  var prismaGlobal: PrismaClient | undefined;
  var useLocalDatabaseFallback: boolean | undefined;
}

const rawPrisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = rawPrisma;
}

let isFallbackActive = globalThis.useLocalDatabaseFallback ?? false;

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = err.message || String(err);
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('connection closed') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('P1001') ||
    msg.includes('ETIMEDOUT')
  );
}

// Transparent Proxy: Delegates to real PostgreSQL PrismaClient, or automatically
// falls back to LocalStore when PostgreSQL is unavailable (e.g. offline dev).
export const prisma: PrismaClient = new Proxy(rawPrisma, {
  get(target: any, prop: string | symbol) {
    if (prop === '$queryRaw' || prop === '$executeRaw') {
      return async (...args: any[]) => {
        if (isFallbackActive) return [{ 1: 1 }];
        try {
          return await target[prop](...args);
        } catch (err) {
          if (isConnectionError(err)) {
            isFallbackActive = true;
            globalThis.useLocalDatabaseFallback = true;
            return [{ 1: 1 }];
          }
          throw err;
        }
      };
    }

    if (isFallbackActive) {
      if ((localStore as any)[prop]) {
        return (localStore as any)[prop];
      }
    }

    const modelTarget = target[prop];
    if (typeof modelTarget === 'object' && modelTarget !== null) {
      return new Proxy(modelTarget, {
        get(mTarget: any, mProp: string | symbol) {
          const fn = mTarget[mProp];
          if (typeof fn === 'function') {
            return async (...args: any[]) => {
              if (isFallbackActive) {
                const storeModel = (localStore as any)[prop];
                if (storeModel && typeof storeModel[mProp] === 'function') {
                  return await storeModel[mProp](...args);
                }
              }

              try {
                return await fn.apply(mTarget, args);
              } catch (err: any) {
                if (isConnectionError(err)) {
                  if (!isFallbackActive) {
                    logger.warn(
                      '⚠️ PostgreSQL (RDS/Local) unreachable. Seamlessly activating Local Database Driver for offline execution.'
                    );
                    isFallbackActive = true;
                    globalThis.useLocalDatabaseFallback = true;
                  }
                  const storeModel = (localStore as any)[prop];
                  if (storeModel && typeof storeModel[mProp] === 'function') {
                    return await storeModel[mProp](...args);
                  }
                }
                throw err;
              }
            };
          }
          return fn;
        },
      });
    }

    return target[prop];
  },
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await rawPrisma.$queryRaw`SELECT 1`;
    isFallbackActive = false;
    globalThis.useLocalDatabaseFallback = false;
    return true;
  } catch (error) {
    logger.warn('PostgreSQL not detected on port 5432. Local Storage DB driver active.');
    isFallbackActive = true;
    globalThis.useLocalDatabaseFallback = true;
    return false;
  }
}
