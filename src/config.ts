import * as dotenv from 'dotenv';
import { AuthConfig } from './types';

dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/dt65';

const registerSecret: string = process.env.REGISTER_SECRET || 'secret';

const auth: AuthConfig = {
  domain: process.env.AUTH_DOMAIN || 'dev-dt65.eu.auth0.com',
  clientId: process.env.AUTH_CLIENT_ID || 'clientId',
  clientSecret: process.env.AUTH_CLIENT_SECRET || 'secret',
  jwtAudience: process.env.JWT_AUDIENCE || 'audience',
};

const config = {
  auth,
  registerSecret,
  mongoUrl,
};

export { config };
