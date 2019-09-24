import { AuthenticationClient, ManagementClient } from 'auth0';
import { config } from '../config';
import { IAuth0RegisterResponse, IAuth0LoginResponse } from '../types';

const { domain, clientId, clientSecret, jwtAudience } = config.auth;

const auth0 = new AuthenticationClient({
  domain,
  clientId,
  clientSecret,
});

const loginAuthZeroUser = async (
  username: string,
  password: string,
): Promise<IAuth0LoginResponse> => {
  try {
    const authZeroUser = await auth0.passwordGrant({
      password,
      username,
      // @ts-ignore: Don't know how to fix
      scope: 'read:events write:events read:me write:me openid profile',
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

export { createAuthZeroUser, loginAuthZeroUser, requestChangePasswordEmail };
