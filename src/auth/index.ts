import { AuthenticationClient, ManagementClient } from 'auth0';
import { map, pickAll, pipe, values, reduce, assoc } from 'ramda';
import { renameKeys } from 'ramda-adjunct';
import { getFromCache, setToCache } from './cache';

import { config } from '../config';
import {
  IAuth0LoginResponse,
  IAuth0Profile,
  IAuth0RegisterResponse,
  IAuth0User,
} from '../types';

const { domain, clientId, clientSecret, jwtAudience } = config.auth;

const CACHE_KEY_USERS = 'users';

const addUsersToCache = (users: IAuth0Profile[]) => {
  const reducer = (acc: any, curr: IAuth0Profile) => {
    return assoc(curr.id, curr, acc);
  };
  return reduce(reducer, {}, users);
};

const auth0 = new AuthenticationClient({
  domain,
  clientId,
  clientSecret,
});

const loginAuth0User = async (
  usernameOrEmail: string,
  password: string,
): Promise<IAuth0LoginResponse> => {
  const authZeroUser = await auth0.passwordGrant({
    password,
    username: usernameOrEmail,
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
};

const AUTH_PROFILE_PROPS = [
  'user_id',
  'email',
  'name',
  'nickname',
  'username',
  'picture',
];

const formatUsers = pipe(
  // @ts-ignore
  map(pickAll(AUTH_PROFILE_PROPS)),
  map(renameKeys({ user_id: 'id' })),
);

const fetchUsers = async (
  verified: boolean = true,
): Promise<IAuth0Profile[]> => {
  const start = new Date().getTime();

  const cachedUsers = await getFromCache(CACHE_KEY_USERS);

  if (cachedUsers) {
    const obj = JSON.parse(cachedUsers);
    const end = new Date().getTime();
    console.log('Duration', end - start);
    return values(obj);
  }

  const client = await auth0.clientCredentialsGrant({
    audience: `https://${domain}/api/v2/`,
    // @ts-ignore: Don't know how to fix
    scope: 'read:users update:users',
  });
  const management = new ManagementClient({
    token: client.access_token,
    domain,
  });

  const usersResp: Array<any> = await management.getUsers();

  const userList: IAuth0Profile[] = formatUsers(usersResp);
  const cached = addUsersToCache(userList);
  await setToCache(CACHE_KEY_USERS, JSON.stringify(cached));
  const end = new Date().getTime();
  console.log('Duration', end - start);
  return userList;
};

const createAuth0User = async (
  user: IAuth0User,
): Promise<IAuth0RegisterResponse> => {
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
      ...user,
      verify_email: true,
      email_verified: false,
      nickname: user.username,
      user_metadata: {
        subscribeWeeklyEmail: true,
        subscribeEventCreationEmail: true,
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
  createAuth0User,
  loginAuth0User,
  requestChangePasswordEmail,
  fetchUsers,
};
