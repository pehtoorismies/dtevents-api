import { AuthenticationClient, ManagementClient } from 'auth0';

const domain = '';
const clientId = '';
const clientSecret = '';

const getAuth0Management = async (): Promise<any> => {
  const auth0 = new AuthenticationClient({
    domain,
    clientId,
    clientSecret,
  });

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

const updateUsers = async () => {
  const management = await getAuth0Management();

  const users = await management.getUsers();

  for (const user of users) {
    const {
      user_id,
      user_metadata: { username },
    } = user;

    console.log(`Id ${user_id}: ${username}`);

    if (username) {
      try {
        const u = await management.updateUser(
          { id: user_id },
          {
            nickname: username,
          },
        );
        console.log(`Update nick ${u.user_id}: ${u.nickname}`);
      } catch (error) {
        console.log(`user does not exist in db ${user_id}`);
      }
    }
  }
};

export { updateUsers };
