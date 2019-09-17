import R from 'ramda';
import * as jwt from 'jsonwebtoken';

import { getMatchingPubKey, getScopes } from '../util';

import { JWTError } from '../errors';
import { config } from '../config';

const getKID = R.path(['header', 'kid']);

const requestScopes = async (
  resolve: any,
  parent: any,
  args: any,
  context: any,
  info: any,
) => {
  const { accessToken } = context;
  if (!accessToken) {
    const result = await resolve(parent, args, context, info);
    return result;
  }

  const decodedToken = jwt.decode(accessToken, { complete: true });
  
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
    const token: any = jwt.verify(accessToken, pubkey, {
      audience: config.auth.jwtAudience,
      issuer: `https://${config.auth.domain}/`,
      algorithms: ['RS256'],
    });
    
    const scopes: string[] = getScopes(token.scope);
    const sub = R.path(['payload', 'sub'], decodedToken)

    const updatedContext = {
      ...context,
      scopes,
      sub
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
