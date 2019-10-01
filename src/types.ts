export interface AuthConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  jwtAudience: string;
}

export interface IMailRecipient {
  email: string;
  name: string;
}

export interface IMailgunConfig {
  apiKey: string;
  domain: string;
  fromMail: string;
  host: string;
}

export interface ISimpleUser {
  username: string;
  id: string;
}

interface IAuth0Response {
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
}

export interface IEventType {
  id: string;
  title: string;
}

export interface IAuth0RegisterResponse extends IAuth0Response {
  auth0UserId?: string | number;
}

export interface IAuth0LoginResponse extends IAuth0Response {
  user?: {
    accessToken: string;
    idToken: string;
    expiresIn: number;
  };
}

export interface IKeyValuePair {
  key: string;
  value: string;
}

export interface IEventEmailOptions {
  title: string;
  type: string;
  date: string;
  eventUrl: string;
  creator: string;
  description?: string;
}

export interface IEventEmailTemplate {
  plainText: string;
  mjmlText: string;
}