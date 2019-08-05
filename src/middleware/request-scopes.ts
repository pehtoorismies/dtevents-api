import * as jwt from 'jsonwebtoken';
import * as R from 'ramda';
import { getMatchingPubKey, getScopes } from '../util';
import { config } from '../config';
import { JWTError } from '../errors';

const getBearerToken = (header?: string) => {
  if (!header) {
    return null;
  }

  return R.pipe(
    R.split('Bearer'),
    R.last,
    R.trim,
  )(header);
};

const getKID = R.path(['header', 'kid']);

const requestScopes = async (
  resolve: any,
  parent: any,
  args: any,
  context: any,
  info: any,
) => {
  const authHeader = context.request.get('Authorization');

  const jwtToken = getBearerToken(authHeader);
  if (!jwtToken) {
    const result = await resolve(parent, args, context, info);
    return result;
  }

  const decodedToken = jwt.decode(jwtToken, { complete: true });

  if (!decodedToken) {
    return new JWTError({
      message: 'Malformed JWT',
    });
  }
  const kid = String(getKID(decodedToken));

  if (!kid) {
    return new JWTError({
      message: 'Kid not found in JWT',
    });
  }
  const pubkey = await getMatchingPubKey(kid);

  try {
    const token: any = jwt.verify(jwtToken, pubkey, {
      audience: config.auth.jwtAudience,
      issuer: `https://${config.auth.domain}/`,
      algorithms: ['RS256'],
    });
    const scopes: string[] = getScopes(token.scope);
    const updatedContext = {
      ...context,
      scopes,
    };
    const result = await resolve(parent, args, updatedContext, info);
    return result;
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return new JWTError({
        message: 'Token is expired',
      });
    }
    console.error('Error name', e.name);
    console.error(e);
    return new Error('Not able to get public key');
  }
};

export default requestScopes;
