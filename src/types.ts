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

interface IAuth0Response {
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
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
