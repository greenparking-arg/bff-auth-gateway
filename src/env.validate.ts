import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsNumber()
  @IsNotEmpty()
  THROTTLE_TTL: number;

  @IsNumber()
  @IsNotEmpty()
  THROTTLE_LIMIT: number;

  @IsNumber()
  @IsNotEmpty()
  HTTPCLIENT_ATTEMPTS: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_EXPIRES_REFRESH_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_ATTEMPTS_REFRESH_IN: string;

  @IsString()
  @IsNotEmpty()
  URL_GATEWAY: string;

  @IsString()
  @IsNotEmpty()
  APIKEY_S3: string;

  @IsString()
  @IsNotEmpty()
  S3_URL: string;

  @IsString()
  @IsNotEmpty()
  S3_ENDPOINT: string;

  @IsString()
  @IsNotEmpty()
  S3_REGION: string;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_ACCESS_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
