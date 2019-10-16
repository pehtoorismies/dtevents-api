import { AuthenticationClient, ManagementClient } from 'auth0';
import axios, { AxiosRequestConfig } from 'axios';

import { config } from '../config';
import {
  IAuth0LoginResponse,
  IAuth0RegisterResponse,
  IAuth0User,
} from '../types';
import { path } from 'ramda';

const { domain, clientId, clientSecret, jwtAudience } = config.auth;

const auth0 = new AuthenticationClient({
  domain,
  clientId,
  clientSecret,
});

const AUTH0_URL = `https://${domain}`;

const loginAuthZeroUser = async (
  username: string,
  password: string,
): Promise<IAuth0LoginResponse> => {
  try {
    const authZeroUser = await auth0.passwordGrant({
      password,
      username,
      // @ts-ignore: Don't know how to fix
      scope:
        'read:events write:events read:me write:me read:users openid profile',
      audience: jwtAudience,
    });

    return {
      user: {
        accessToken: authZeroUser.access_token || '',
        idToken: authZeroUser.id_token || '',
        expiresIn: authZeroUser.expires_in || 0,
      },
    };
  } catch (error) {
    return {
      error: {
        ...error,
      },
    };
  }
};

const axiosInstance = axios.create({
  baseURL: AUTH0_URL,
  timeout: 3000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const fetchAccessToken = async (): Promise<string> => {
  const authResp = await axiosInstance.post('/oauth/token', {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${domain}/api/v2/`,
  });

  return path(['data', 'access_token'], authResp) || '';
};

const createUser = async (
  user: IAuth0User,
): Promise<IAuth0RegisterResponse> => {
  const accessToken = await fetchAccessToken();

  const data = {
    ...user,
    user_metadata: {
      subscribeWeeklyEmail: true,
      subscribeEventCreationEmail: true,
    },
    blocked: false,
    email_verified: false,
    connection: 'Username-Password-Authentication',
    verify_email: true,
    nickname: user.username,
  };

  Object.assign(axiosInstance.defaults, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const createResp = await axiosInstance.post('/api/v2/users', data);
  return { auth0UserId: createResp.data.userId };
};

const fetchTokens = async (
  usernameOrEmail: string,
  password: string,
): Promise<{ accessToken: string; idToken: string }> => {
  const { data } = await axiosInstance.post('/oauth/token', {
    username: usernameOrEmail,
    password,
    grant_type: 'password',
    audience: jwtAudience,
    client_id: clientId,
    client_secret: clientSecret,
    scope:
      'read:events write:events read:me write:me read:users openid profile',
  });

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
  };
};

const createAuthZeroUser = async (
  email: string,
  username: string,
  password: string,
): Promise<IAuth0RegisterResponse> => {
  // valid user => create to Auth0

  const client = await auth0.clientCredentialsGrant({
    audience: `https://${domain}/api/v2/`,
    // @ts-ignore: Don't know how to fix
    scope: 'read:users update:users',
  });

  const management = new ManagementClient({
    token: client.access_token,
    domain,
  });
  try {
    const authZeroUser = await management.createUser({
      connection: 'Username-Password-Authentication',
      email,
      password,
      username,
      verify_email: true,
      email_verified: false,
      user_metadata: {
        username,
      },
      app_metadata: { role: 'USER' },
    });

    return {
      auth0UserId: authZeroUser.user_id,
    };
  } catch (error) {
    return {
      error: {
        ...error,
      },
    };
  }
};

const requestChangePasswordEmail = (email: string): boolean => {
  // fire and forget
  try {
    auth0.requestChangePasswordEmail({
      email,
      connection: 'Username-Password-Authentication',
    });
  } catch (error) {
    console.error(error);
  } finally {
    return true;
  }
};

export {
  createAuthZeroUser,
  loginAuthZeroUser,
  requestChangePasswordEmail,
  createUser,
  fetchTokens,
};
