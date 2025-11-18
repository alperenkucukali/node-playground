import dotenv from 'dotenv';

dotenv.config();

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug'];

const FALLBACKS: {
  NODE_ENV: string;
  PORT: string;
  APP_NAME: string;
  API_ROOT: string;
  CORS_ORIGINS: string;
  LOG_LEVEL: LogLevel;
  AWS_REGION: string;
  AWS_DYNAMODB_ENDPOINT: string;
  CATALOG_TABLE_NAME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  DEFAULT_TENANT_ID: string;
  TENANT_HEADER_NAME: string;
  METRICS_NAMESPACE: string;
  ENABLE_METRICS: string;
} = {
  NODE_ENV: 'development',
  PORT: '3000',
  APP_NAME: 'node-playground',
  API_ROOT: '/api/v1',
  CORS_ORIGINS: '*',
  LOG_LEVEL: 'info',
  AWS_REGION: 'us-east-1',
  AWS_DYNAMODB_ENDPOINT: 'http://localhost:8000',
  CATALOG_TABLE_NAME: 'media-catalog',
  AWS_ACCESS_KEY_ID: 'local',
  AWS_SECRET_ACCESS_KEY: 'local',
  DEFAULT_TENANT_ID: 'demo-tenant',
  TENANT_HEADER_NAME: 'x-tenant-id',
  METRICS_NAMESPACE: 'node-playground',
  ENABLE_METRICS: 'false',
} as const;

const ENV_PROFILES: Record<string, Partial<typeof FALLBACKS>> = {
  development: {
    LOG_LEVEL: 'debug',
  },
  local: {
    LOG_LEVEL: 'debug',
  },
  test: {
    LOG_LEVEL: 'error',
  },
  production: {
    LOG_LEVEL: 'info',
  },
};

function toArray(value?: string | string[]): string[] {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface AwsConfig {
  region: string;
  dynamoEndpoint?: string;
  tables: {
    catalog: string;
  };
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface TenantConfig {
  defaultId: string;
  headerName: string;
}

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  apiRoot: string;
  corsOrigins: string[];
  logLevel: LogLevel;
  aws: AwsConfig;
  tenant: TenantConfig;
  observability: {
    metricsEnabled: boolean;
    metricsNamespace: string;
  };
  isProduction: boolean;
  isTest: boolean;
  isDevelopment: boolean;
}

const rawProfile = (process.env.APP_ENV || process.env.NODE_ENV || FALLBACKS.NODE_ENV).toLowerCase();
const profileFallbacks = { ...FALLBACKS, ...(ENV_PROFILES[rawProfile] || {}) };
const normalizedProfile = ENV_PROFILES[rawProfile] ? rawProfile : FALLBACKS.NODE_ENV;

function resolveLogLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  if (!value) {
    return fallback;
  }
  const normalized = value.toLowerCase() as LogLevel;
  return LOG_LEVELS.includes(normalized) ? normalized : fallback;
}

function resolveBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }
  return fallback;
}

export const env: EnvConfig = {
  nodeEnv: normalizedProfile,
  port: Number(process.env.PORT || profileFallbacks.PORT),
  appName: process.env.APP_NAME || profileFallbacks.APP_NAME,
  apiRoot: process.env.API_ROOT || profileFallbacks.API_ROOT,
  corsOrigins: toArray(process.env.CORS_ORIGINS || profileFallbacks.CORS_ORIGINS),
  logLevel: resolveLogLevel(process.env.LOG_LEVEL, profileFallbacks.LOG_LEVEL),
  aws: {
    region: process.env.AWS_REGION || profileFallbacks.AWS_REGION,
    dynamoEndpoint: process.env.AWS_DYNAMODB_ENDPOINT || profileFallbacks.AWS_DYNAMODB_ENDPOINT,
    tables: {
      catalog: process.env.CATALOG_TABLE_NAME || profileFallbacks.CATALOG_TABLE_NAME,
    },
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || profileFallbacks.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || profileFallbacks.AWS_SECRET_ACCESS_KEY,
    },
  },
  tenant: {
    defaultId: process.env.DEFAULT_TENANT_ID || profileFallbacks.DEFAULT_TENANT_ID,
    headerName: process.env.TENANT_HEADER_NAME || profileFallbacks.TENANT_HEADER_NAME,
  },
  observability: {
    metricsEnabled: resolveBoolean(process.env.ENABLE_METRICS, profileFallbacks.ENABLE_METRICS === 'true'),
    metricsNamespace: process.env.METRICS_NAMESPACE || profileFallbacks.METRICS_NAMESPACE,
  },
  isProduction: false,
  isTest: false,
  isDevelopment: false,
};

env.isProduction = env.nodeEnv === 'production';
env.isTest = env.nodeEnv === 'test';
env.isDevelopment = !env.isProduction && !env.isTest;
