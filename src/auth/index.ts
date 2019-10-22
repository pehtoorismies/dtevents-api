import { AuthenticationClient, ManagementClient, UserData } from 'auth0';
import { map, pickAll, pipe } from 'ramda';
import { renameKeys } from 'ramda-adjunct';

import { config } from '../config';
import { NotFoundError } from '../errors';
import {
  IAuth0Profile,
  IAuth0ProfileUpdate,
  IAuth0User,
  IMailRecipient,
  IAuth0UserMetaData,
  IPreferences,
} from '../types';
// import { createCache } from './cache';

const { domain, clientId, clientSecret, jwtAudience } = config.auth;

// const CACHE_KEY_USERS = 'users';

// const addUsersToCache = (users: IAuth0Profile[]) => {
//   const reducer = (acc: any, curr: IAuth0Profile) => {
//     return assoc(curr.id, curr, acc);
//   };
//   return reduce(reducer, {}, users);
// };

// const { setToCache, getFromCache } = createCache();

const auth0 = new AuthenticationClient({
  domain,
  clientId,
  clientSecret,
});

const getAuth0Management = async (): Promise<any> => {
  const client = await auth0.clientCredentialsGrant({
    audience: `https://${domain}/api/v2/`,
    // @ts-ignore: Don't know how to fix
    scope: 'read:users update:users',
  });
  const management = new ManagementClient({
    token: client.access_token,
    domain,
  });
  return management;
};

const loginAuth0User = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; idToken: string; expiresIn: string }> => {
  const authZeroUser = await auth0.passwordGrant({
    password,
    username: email,
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

const format = pipe(
  pickAll(AUTH_PROFILE_PROPS),
  renameKeys(RENAME_KEYS),
);

const toUserFormat = (fromAuth0: any): IAuth0Profile => {
  // @ts-ignore
  return format(fromAuth0);
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

// const updateUserCache = async (): Promise<any> => {
//   const management = await getAuth0Management();

//   const usersResp: Array<any> = await management.getUsers();
//   const userList: IAuth0Profile[] = formatUsers(usersResp);
//   const cached = addUsersToCache(userList);
//   await setToCache(CACHE_KEY_USERS, JSON.stringify(cached));
//   return cached;
// };

const updateProfile = async (
  auth0UserId: string,
  updateable: IAuth0ProfileUpdate,
): Promise<IAuth0Profile> => {
  const management = await getAuth0Management();
  const user = await management.updateUser({ id: auth0UserId }, updateable);
  return toUserFormat(user);
};

const updatePreferences = async (
  auth0UserId: string,
  preferences: IPreferences,
): Promise<IAuth0Profile> => {
  const management = await getAuth0Management();

  const user = await management.updateUser(
    { id: auth0UserId },
    {
      user_metadata: {
        ...preferences,
      },
    },
  );
  return toUserFormat(user);
};

const fetchMyProfile = async (auth0Id: string): Promise<IAuth0Profile> => {
  const management = await getAuth0Management();

  const user = await management.getUser({ id: auth0Id });
  // @ts-ignore
  return toUserFormat(user);
  // const hasId = has(auth0Id);
  // const cachedUsers = await getFromCache(CACHE_KEY_USERS);
  // console.log('cached users');
  // console.log(cachedUsers);
  // if (cachedUsers) {
  //   const obj = JSON.parse(cachedUsers);
  //   if (hasId(obj)) {
  //     return prop(auth0Id, obj);
  //   }
  // }
  // const refetchedUsers = await updateUserCache();
  // const obj = JSON.parse(refetchedUsers);
  // if (hasId(obj)) {
  //   return prop(auth0Id, obj);
  // }
  throw new NotFoundError('User not found in auth zero');
};

// TODO: fix cache
const fetchUsers = async (
  verified: boolean = true,
): Promise<IAuth0Profile[]> => {
  const management = await getAuth0Management();

  const usersResp: Array<any> = await management.getUsers();
  const userList: IAuth0Profile[] = formatUsers(usersResp);
  return userList;
  // const cachedUsers = await getFromCache(CACHE_KEY_USERS);

  // if (cachedUsers) {
  //   const obj = JSON.parse(cachedUsers);
  //   return values(obj);
  // }

  // const refetchedUsers = await updateUserCache();
  // const obj = JSON.parse(refetchedUsers);
  // return values(obj);
};

const createAuth0User = async (user: IAuth0User): Promise<IAuth0Profile> => {
  const management = await getAuth0Management();

  const auth0User = await management.createUser({
    connection: 'Username-Password-Authentication',
    ...user,
    verify_email: true,
    email_verified: false,
    user_metadata: {
      subscribeWeeklyEmail: true,
      subscribeEventCreationEmail: true,
    },
    app_metadata: { role: 'USER' },
  });

  return toUserFormat(auth0User);
};

const AUTH0_QUERY_BASE = {
  fields: 'email,name',
  search_engine: 'v3',
};

const pickMailRecipientFields = (
  users: UserData<any, IAuth0UserMetaData>[],
) => {
  return users
    .map((u: UserData) => {
      return {
        name: u.name || '',
        email: u.email || '',
      };
    })
    .filter((u: IMailRecipient) => {
      return !!u.email;
    });
};

const fetchCreateEventSubscribers = async (): Promise<IMailRecipient[]> => {
  const management = await getAuth0Management();

  try {
    const q = `user_metadata.subscribeEventCreationEmail:"true"`;
    const users: UserData<
      any,
      IAuth0UserMetaData
    >[] = await management.getUsers({
      ...AUTH0_QUERY_BASE,
      q,
    });

    return pickMailRecipientFields(users);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchWeeklyEmailSubscribers = async (): Promise<IMailRecipient[]> => {
  const management = await getAuth0Management();

  try {
    const q = `user_metadata.subscribeWeeklyEmail:"true"`;
    const users: UserData<
      any,
      IAuth0UserMetaData
    >[] = await management.getUsers({
      ...AUTH0_QUERY_BASE,
      q,
    });

    return pickMailRecipientFields(users);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchNickname = async (auth0UserId: string): Promise<string> => {
  return 'koira';
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
  toUserFormat,
  updatePreferences,
  updateProfile,
  fetchCreateEventSubscribers,
  fetchWeeklyEmailSubscribers,
  fetchNickname,
};
