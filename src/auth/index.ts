import { ManagementClient, AuthenticationClient } from 'auth0';
import * as rp from 'request-promise';
import * as R from 'ramda';
import {  Auth0Error } from '../errors';
import { config } from '../config';

const { domain, clientId, clientSecret } = config.auth;

const auth0 = new AuthenticationClient({
  domain,
  clientId,
  clientSecret,
});

const loginAuthZeroUser = async (username: string, password: string) => {
  const authZeroUser = await auth0.passwordGrant({
    password,
    username,
    // @ts-ignore: Don't know how to fix
    scope: 'read:events write:events openid profile',
    audience: 'https://graphql-dev.downtown65.com',
  });

  return {
    accessToken: authZeroUser.access_token,
    idToken: authZeroUser.id_token,
    expiresIn: authZeroUser.expires_in,
  };
};

const createAuthZeroUser = async (
  email: string,
  username: string,
  password: string,
) => {
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

  return authZeroUser;
};

const fetchAuth0Subject = async (accessToken: string) : Promise<string> => {
  const userInfo = await rp({
    method: 'GET',
    url: `https://${domain}/userinfo`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
  },
  });
  console.log('UserInfo', userInfo);
  if (!userInfo) {
    return new Auth0Error({
      message: 'Cant fetch userInfo',
    });
  }
  const obj = JSON.parse(userInfo);

  return R.prop('sub', obj);
}

export { createAuthZeroUser, loginAuthZeroUser, fetchAuth0Subject };
