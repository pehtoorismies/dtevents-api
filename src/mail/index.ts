import mailgun from 'mailgun-js';
import { join } from 'ramda';
import mjml2html from 'mjml';
import { IEventEmailOptions } from '../types';
import creationTemplate from './eventEmail';
import { config } from '../config';

const { mailgun: mgConfig } = config;

const mg = mailgun({
  apiKey: mgConfig.apiKey,
  domain: mgConfig.domain,
});

const sendMail = async (
  recipients: string[],
  options: IEventEmailOptions,
): Promise<boolean> => {
  const { type } = options;
  const { mjmlText, plainText } = creationTemplate(options);
  const mailContent = mjml2html(mjmlText);

  const data = {
    from: 'Kyttäki <hello@downtown65.com>',
    to: join(',', recipients),
    subject: `Uusi tapahtuma (${type})`,
    text: plainText,
    html: mailContent.html,
  };

  try {
    await mg.messages().send(data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default sendMail;
