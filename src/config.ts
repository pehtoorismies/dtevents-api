import * as dotenv from 'dotenv';

import { AuthConfig, IMailgunConfig } from './types';

dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/dt65';

const registerSecret: string = process.env.REGISTER_SECRET || 'secret';

const auth: AuthConfig = {
  domain: process.env.AUTH_DOMAIN || 'dev-dt65.eu.auth0.com',
  clientId: process.env.AUTH_CLIENT_ID || 'clientId',
  clientSecret: process.env.AUTH_CLIENT_SECRET || 'secret',
  jwtAudience: process.env.JWT_AUDIENCE || 'audience',
};

const mailgun: IMailgunConfig = {
  domain: process.env.MAILGUN_DOMAIN || 'wrongDomain',
  apiKey: process.env.MAILGUN_API_KEY || 'wrongApikey',
  fromMail: process.env.MAILGUN_FROM || 'Kyttäki <hello@downtown65.com>',
  host: process.env.MAILGUN_HOST || 'api.mailgun.net',
};

const clientDomain = process.env.CLIENT_DOMAIN || `http://localhost:3000`;

const config = {
  auth,
  registerSecret,
  mongoUrl,
  mailgun,
  clientDomain,
};

export { config };
