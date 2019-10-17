import { AuthenticationClient, ManagementClient } from 'auth0';
import { prop, map, pickAll, pipe, values, reduce, assoc, has } from 'ramda';
import { renameKeys } from 'ramda-adjunct';
import { getFromCache, setToCache, deleteKey } from './cache';

import { config } from '../config';
import { IAuth0Profile, IAuth0RegisterResponse, IAuth0User } from '../types';
import { NotFoundError } from '../errors';

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
): Promise<{ accessToken: string; idToken: string; expiresIn: string }> => {
  const authZeroUser = await auth0.passwordGrant({
    password,
    username: usernameOrEmail,
    // @ts-ignore: Don't know how to fix
    scope:
      'read:events write:events read:me write:me read:users openid profile',
    audience: jwtAudience,
  });

  return {
    accessToken: authZeroUser.access_token || '',
    idToken: authZeroUser.id_token || '',
    expiresIn: '0',
  };
};

const AUTH_PROFILE_PROPS = [
  'user_id',
  'email',
  'name',
  'nickname',
  'username',
  'picture',
  'updated_at',
  'created_at',
  'user_metadata',
];

const RENAME_KEYS = {
  user_id: 'id',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  user_metadata: 'preferences',
};

const formatUsers = pipe(
  // @ts-ignore
  map(pickAll(AUTH_PROFILE_PROPS)),
  map((up: any) => {
    if (!up.preferences) {
      return {
        ...up,
        user_metadata: {
          subscribeEventCreationEmail: 'true',
          subscribeWeeklyEmail: 'true',
        },
      };
    } else {
     return up;
    }
  }),
  map(renameKeys(RENAME_KEYS)),
);

const updateUserCache = async (): Promise<any> => {
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
  return cached;
};

const fetchMyProfile = async (auth0Id: string): Promise<IAuth0Profile> => {
  
  const hasId = has(auth0Id);
  const cachedUsers = await getFromCache(CACHE_KEY_USERS);
  console.log('cached users')
  console.log(cachedUsers)
  if (cachedUsers) {
    const obj = JSON.parse(cachedUsers);
    if (hasId(obj)) {
      return prop(auth0Id, obj);
    }
  }
  const refetchedUsers = await updateUserCache();
  const obj = JSON.parse(refetchedUsers);
  if (hasId(obj)) {
    return prop(auth0Id, obj);
  }
  throw new NotFoundError('User not found in auth zero');
};

const fetchUsers = async (
  verified: boolean = true,
): Promise<IAuth0Profile[]> => {
  const cachedUsers = await getFromCache(CACHE_KEY_USERS);

  if (cachedUsers) {
    const obj = JSON.parse(cachedUsers);
    return values(obj);
  }

  const refetchedUsers = await updateUserCache();
  const obj = JSON.parse(refetchedUsers);
  return values(obj);
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
  fetchMyProfile,
};
