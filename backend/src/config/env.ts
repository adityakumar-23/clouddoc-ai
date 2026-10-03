import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  APP_NAME: z.string().default('CloudDoc AI'),
  APP_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:5000/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/clouddoc_db?schema=public'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().default('clouddoc-documents-prod'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_DRIVER: z.enum(['s3', 'local']).default('local'),
  LOCAL_STORAGE_PATH: z.string().default('./storage'),

  JWT_SECRET: z.string().default('dev_super_secret_jwt_hmac_sha256_key_at_least_32_characters_long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().default('dev_another_super_secret_refresh_token_key_for_rotation_64_chars'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.string().transform((v) => parseInt(v, 10)).default('12'),

  AI_PROVIDER: z.enum(['openai', 'gemini', 'anthropic', 'mock']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL_NAME: z.string().default('gpt-4o-mini'),
  AI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  ENABLE_CLOUDWATCH: z.string().transform((v) => v === 'true').default('false'),
  CLOUDWATCH_LOG_GROUP: z.string().default('/clouddoc/production/api'),
  CLOUDWATCH_LOG_STREAM: z.string().default('ec2-instance-01'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.string().transform((v) => parseInt(v, 10)).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('CloudDoc AI <support@clouddoc.ai>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;
