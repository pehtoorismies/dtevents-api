import R from 'ramda';
import rp from 'request-promise';

import { config } from './config';

const isEmailOrOpenId = (n: string) => n === 'email' || n === 'openid';

let kidCache: any = {};

export const getScopes = R.pipe(
  R.split(' '),
  R.reject(isEmailOrOpenId),
);

export const getMatchingPubKey = async (kid: string) => {
  if (kidCache[kid]) {
    return kidCache[kid];
  }
  const jwks = await rp({
    method: 'GET',
    url: `https://${config.auth.domain}/.well-known/jwks.json`,
  });
  const data = JSON.parse(jwks);

  const key = R.find(R.propEq('kid', kid), data.keys);

  const pubkey = key.x5c[0];

  const cert = `-----BEGIN CERTIFICATE-----\n${pubkey}\n-----END CERTIFICATE-----`;
  kidCache[kid] = cert;
  return cert;
};
