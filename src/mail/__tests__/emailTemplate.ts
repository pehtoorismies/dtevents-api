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
    description: `<ol>
                    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                    <li>Aliquam tincidunt mauris eu risus.</li>
                    <li>Vestibulum auctor dapibus neque.</li>
                  </ol>`,
    preferencesUrl: 'do_not_care',
  };

  const data = await createEventMail(options);
  expect(data.mjmlText).toMatch(/<mjml>/);
  expect(data.mjmlText).toMatch(/some title/);
  expect(data.mjmlText).toMatch(/skiing/);
  expect(data.mjmlText).toMatch(/Hiihto/);
  expect(data.mjmlText).toMatch(/metsäsika/);
  expect(data.mjmlText).toMatch(/<ol>/);
  expect(data.plainText).toMatch(/Kippis,/);
});

test('Creation email', async () => {
  const options: IWeeklyEmailOptions = {
    eventOptions: [
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
        preferencesUrl: 'do_not_care',
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
        preferencesUrl: 'do_not_care',
      },
    ],
    preferencesUrl: 'some_url',
  };

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
