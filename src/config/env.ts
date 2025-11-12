import dotenv from 'dotenv';

dotenv.config();

const FALLBACKS = {
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
} as const;

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
  logLevel: string;
  aws: AwsConfig;
  tenant: TenantConfig;
  isProduction: boolean;
  isTest: boolean;
  isDevelopment: boolean;
}

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || FALLBACKS.NODE_ENV,
  port: Number(process.env.PORT || FALLBACKS.PORT),
  appName: process.env.APP_NAME || FALLBACKS.APP_NAME,
  apiRoot: process.env.API_ROOT || FALLBACKS.API_ROOT,
  corsOrigins: toArray(process.env.CORS_ORIGINS || FALLBACKS.CORS_ORIGINS),
  logLevel: process.env.LOG_LEVEL || FALLBACKS.LOG_LEVEL,
  aws: {
    region: process.env.AWS_REGION || FALLBACKS.AWS_REGION,
    dynamoEndpoint: process.env.AWS_DYNAMODB_ENDPOINT || FALLBACKS.AWS_DYNAMODB_ENDPOINT,
    tables: {
      catalog: process.env.CATALOG_TABLE_NAME || FALLBACKS.CATALOG_TABLE_NAME,
    },
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || FALLBACKS.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || FALLBACKS.AWS_SECRET_ACCESS_KEY,
    },
  },
  tenant: {
    defaultId: process.env.DEFAULT_TENANT_ID || FALLBACKS.DEFAULT_TENANT_ID,
    headerName: process.env.TENANT_HEADER_NAME || FALLBACKS.TENANT_HEADER_NAME,
  },
  isProduction: false,
  isTest: false,
  isDevelopment: false,
};

env.isProduction = env.nodeEnv === 'production';
env.isTest = env.nodeEnv === 'test';
env.isDevelopment = !env.isProduction && !env.isTest;
