import {
  IEventEmailOptions,
  IEmailTemplate,
  IWeeklyEmailOptions,
} from '../types';

import fs from 'fs';
import util from 'util';
import path from 'path';
import nunjucks from 'nunjucks';
import { map } from 'ramda';

interface ICache {
  event?: string;
  weekly?: string;
}

const cache: ICache = {};

const loadTemplate = async (fileName: string): Promise<string> => {
  const templateFile = path.join(__dirname, '../templates', fileName);
  const readFile = util.promisify(fs.readFile);
  const template = await readFile(templateFile, 'utf8');
  return template;
};

const createEventMail = async (
  options: IEventEmailOptions,
): Promise<IEmailTemplate> => {
  if (!cache.event) {
    const t: string = await loadTemplate('event_created.mjml');
    cache.event = t;
  }

  const { title, type, date, eventUrl, creator, description } = options;
  const mjmlText = nunjucks.renderString(cache.event, options);

  const plainText = `
    Kippis, 

    käyttäjä ${creator} loi uuden ${type}-tapahtuman ${title}.

    Tapahtuman päivämäärä: ${date}

    ${description}

    Tarkastele tapahtumaa: ${eventUrl}
  
    Admin terveisin, 
    Kyttäki
  `;

  return {
    mjmlText,
    plainText,
  };
};

const createWeeklyEvent = (options: IWeeklyEmailOptions) =>
  `
    ---
    ${options.title}
    ${options.subtitle}
    ${options.weekDay} ${options.date}

    Tarkastele tapahtumaa: ${options.eventUrl}
    
  `;

const createWeeklyEmail = async (
  options: IWeeklyEmailOptions[],
): Promise<IEmailTemplate> => {
  if (!cache.weekly) {
    const t: string = await loadTemplate('weekly_email.mjml');
    cache.weekly = t;
  }
  
  const mjmlText = nunjucks.renderString(cache.weekly, {
    eventOptions: options,
  });
  const plainText = `
    Kippis, 

    ${map(createWeeklyEvent, options)}
  
    Admin terveisin, 
    Kyttäki
  `;

  return {
    mjmlText,
    plainText,
  };
};

export { createEventMail, createWeeklyEmail };
