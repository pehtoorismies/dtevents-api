import { addIndex, find, pipe, prop, propEq, reject, split, join, pluck, reduce, assoc } from 'ramda';
import rp from 'request-promise';
import { messages } from 'mailgun-js';

import { config } from './config';
import { IEventType, IMailRecipient } from './types';

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

export const emailList = (recipients: IMailRecipient[]): string => {
  return pipe(
    // @ts-ignore
    pluck('email'),
    join(','),
  )(recipients);
};

const indexedReducer = addIndex(reduce);

export const recipientVariables = (
  recipients: IMailRecipient[],
): messages.BatchSendRecipientVars => {
  const reducer = (acc : any, curr: IMailRecipient, id: number) => {
    const { email, name } = curr;
    
    const valueObj = {
      first: name,
      id: String(id),
    }
    return assoc(email, valueObj, acc);
  };
  // @ts-ignore
  return indexedReducer(reducer, {}, recipients);

};
