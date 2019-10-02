import mailgun, { messages } from 'mailgun-js';
import mjml2html from 'mjml';

import { config } from '../config';
import {
  IEventEmailOptions,
  IMailRecipient,
  IWeeklyEmailOptions,
} from '../types';
import { emailList, recipientVariables } from '../util';
import { createEventMail, createWeeklyEmail } from './emailTemplate';

const { mailgun: mgConfig } = config;

const mg = mailgun({
  apiKey: mgConfig.apiKey,
  domain: mgConfig.domain,
  host: mgConfig.host,
});

const sendEventCreationEmail = async (
  recipients: IMailRecipient[],
  options: IEventEmailOptions,
): Promise<boolean> => {
  const { typeHeader } = options;
  const { mjmlText, plainText } = await createEventMail(options);
  const mailContent = mjml2html(mjmlText);

  const data: messages.BatchData = {
    from: 'Kyttäki <hello@downtown65.com>',
    to: emailList(recipients),
    subject: `Uusi tapahtuma (${typeHeader})`,
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

const sendWeeklyEmail = async (
  recipients: IMailRecipient[],
  options: IWeeklyEmailOptions[],
): Promise<boolean> => {
  const { mjmlText, plainText } = await createWeeklyEmail(options);
  const mailContent = mjml2html(mjmlText);

  const data: messages.BatchData = {
    from: 'Kyttäki <hello@downtown65.com>',
    to: emailList(recipients),
    subject: 'Ensi viikon tapahtumat',
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

export { sendEventCreationEmail, sendWeeklyEmail };
