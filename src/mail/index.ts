import mailgun, { messages } from 'mailgun-js';
import mjml2html from 'mjml';

import { config } from '../config';
import { EVENT_TYPES } from '../constants';
import { IEventEmailOptions, IMailRecipient } from '../types';
import { emailList, findType, recipientVariables } from '../util';
import creationTemplate from './eventEmail';

const { mailgun: mgConfig } = config;

const mg = mailgun({
  apiKey: mgConfig.apiKey,
  domain: mgConfig.domain,
  host: mgConfig.host,
});

const sendMail = async (
  recipients: IMailRecipient[],
  options: IEventEmailOptions,
): Promise<boolean> => {
  const { type } = options;
  const { mjmlText, plainText } = creationTemplate(options);
  const mailContent = mjml2html(mjmlText);

  const typeTitle = findType(type, EVENT_TYPES, EVENT_TYPES[0].title);

  const data: messages.BatchData = {
    from: 'Kyttäki <hello@downtown65.com>',
    to: emailList(recipients),
    subject: `Uusi tapahtuma (${typeTitle})`,
    text: plainText,
    html: mailContent.html,
    'recipient-variables': recipientVariables(recipients),
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
