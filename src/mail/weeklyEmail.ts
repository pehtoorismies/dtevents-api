import { IEmailTemplate } from '../types';
import fs from 'fs';
import util from 'util';
import path from 'path';

let template : string | undefined;



const weeklyEmail = async (): Promise<IEmailTemplate> => {
// const weeklyEmail = async (options: IEventEmailOptions[]): Promise<IEmailTemplate> => {
  if (!template) {
    const templateFile = path.join(__dirname, '../templates', 'weekly_email.mjml');
    const readFile = util.promisify(fs.readFile);
    template = await readFile(templateFile, 'utf8');
  } 
    
  console.log('template');
  console.log(template);




  return {
    mjmlText: template,
    plainText: 'as',
  };
};

export default weeklyEmail;
