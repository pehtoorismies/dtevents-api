import { find, pipe, prop, propEq, reject, split } from 'ramda';
import rp from 'request-promise';

import { config } from './config';
import { IEventType } from './types';

const isEmailOrOpenId = (n: string) => n === 'email' || n === 'openid';

let kidCache: any = {};

export const getScopes = pipe(
  split(' '),
  reject(isEmailOrOpenId),
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

  const key = find(propEq('kid', kid), data.keys);

  const pubkey = key.x5c[0];

  const cert = `-----BEGIN CERTIFICATE-----\n${pubkey}\n-----END CERTIFICATE-----`;
  kidCache[kid] = cert;
  return cert;
};

export const findType = (
  type: string,
  eventTypes: IEventType[],
  defaultTitle: string,
) => {
  const e = find(propEq('id', type), eventTypes);
  if (e) {
    return prop('title', e);
  }
  // return something
  console.error('Not founding type ', type);
  return defaultTitle;
};
