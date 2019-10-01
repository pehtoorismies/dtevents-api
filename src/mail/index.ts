import mailgun from 'mailgun-js';
import mjml2html from 'mjml';
import { join } from 'ramda';

import { config } from '../config';
import { EVENT_TYPES } from '../constants';
import { IEventEmailOptions } from '../types';
import { findType } from '../util';
import creationTemplate from './eventEmail';

const { mailgun: mgConfig } = config;

const mg = mailgun({
  apiKey: mgConfig.apiKey,
  domain: mgConfig.domain,
  host: mgConfig.host,
});

const sendMail = async (
  recipients: string[],
  options: IEventEmailOptions,
): Promise<boolean> => {
  const { type } = options;
  const { mjmlText, plainText } = creationTemplate(options);
  const mailContent = mjml2html(mjmlText);

  const typeTitle = findType(type, EVENT_TYPES, EVENT_TYPES[0].title);

  const data = {
    from: 'Kyttäki <hello@downtown65.com>',
    to: join(',', recipients),
    subject: `Uusi tapahtuma (${typeTitle})`,
    text: plainText,
    html: mailContent.html,
  };

  try {
    const resp = await mg.messages().send(data);
    console.log(resp);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default sendMail;
