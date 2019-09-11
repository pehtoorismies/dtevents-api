export interface AuthConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  jwtAudience: string;
}

export interface ISimpleUser {
  username: string;
  userId: string;
}