import { createEventMail, createWeeklyEmail } from '../emailTemplate';
import { IEventEmailOptions, IWeeklyEmailOptions } from '../../types';

test('Creation email', async () => {
  const options: IEventEmailOptions = {
    title: 'some title',
    type: 'skiing',
    typeHeader: 'Hiihto',
    date: '12.2.2022 (tiistai)',
    eventUrl: '/url/',
    creator: 'metsäsika',
    description: 'kuvaus',
  };

  const data = await createEventMail(options);
  expect(data.mjmlText).toMatch(/<mjml>/);
  expect(data.mjmlText).toMatch(/some title/);
  expect(data.mjmlText).toMatch(/skiing/);
  expect(data.mjmlText).toMatch(/Hiihto/);
  expect(data.mjmlText).toMatch(/metsäsika/);
  expect(data.mjmlText).toMatch(/kuvaus/);
  expect(data.plainText).toMatch(/Kippis,/);
});

test('Creation email', async () => {
  const options: IWeeklyEmailOptions[] = [
    {
      title: 'some title',
      type: 'skiing',
      typeHeader: 'Hiihto',
      date: '12.2.2022',
      eventUrl: '/url/',
      creator: 'metsäsika',
      description: 'kuvaus',
      subtitle: 'subbis',
      weekDay: 'tiistai',
      participantCount: 5,
    },
    {
      title: 'some other',
      type: 'orienteering',
      typeHeader: 'Suunnistus',
      date: '12.2.2022',
      eventUrl: '/url/',
      creator: 'koira',
      description: 'deskaus',
      subtitle: 'subtitle2',
      weekDay: 'keskiviikko',
      participantCount: 6,
    },
  ];

  const data = await createWeeklyEmail(options);
  expect(data.mjmlText).toMatch(/<mjml>/);
  expect(data.mjmlText).toMatch(/some title/);
  expect(data.mjmlText).toMatch(/skiing/);
  expect(data.mjmlText).toMatch(/Hiihto/);
  expect(data.mjmlText).toMatch(/tiistai/);
  
  
  expect(data.mjmlText).toMatch(/some title/);
  expect(data.mjmlText).toMatch(/orienteering/);
  
  expect(data.mjmlText).toMatch(/Suunnistus/);
  expect(data.mjmlText).toMatch(/Hiihto/);
});
