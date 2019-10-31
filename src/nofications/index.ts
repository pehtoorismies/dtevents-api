import format from 'date-fns/format';
import { fi } from 'date-fns/locale';

import { config } from '../config';
import { EVENT_TYPES } from '../constants';
import { sendEventCreationEmail, sendWeeklyEmail } from '../mail';
import { IEventEmailOptions, IMailRecipient, IWeeklyOptions } from '../types';
import { findType } from '../util';

const { clientDomain } = config;

const mapEventOptions = (eventDoc: any): IEventEmailOptions => {
  const date = format(new Date(eventDoc.date), 'dd.MM.yyyy (EEEE)', {
    locale: fi,
  });

  const type = eventDoc.type;
  const typeHeader = findType(type, EVENT_TYPES, EVENT_TYPES[0].title);

  return {
    title: eventDoc.title,
    eventUrl: `${clientDomain}/events/${eventDoc._id}`,
    creator: eventDoc.creator.nickname,
    date,
    typeHeader,
    type: type.toLowerCase(),
    description: eventDoc.description || 'ei tarkempaa kuvausta.',
    preferencesUrl: `${clientDomain}/preferences`,
  };
};

export const notifyEventCreationSubscribers = async (
  users: IMailRecipient[],
  eventDoc: any,
): Promise<void> => {
  const eventOptions: IEventEmailOptions = mapEventOptions(eventDoc);

  if (users.length === 0) {
    // no subsriptions
    return;
  }
  sendEventCreationEmail(users, eventOptions);
};

export const notifyWeeklySubscribers = async (
  users: IMailRecipient[],
  eventDocs: any[],
): Promise<void> => {
  const options: IWeeklyOptions[] = eventDocs.map((eventDoc: any) => {
    const weekDay = format(new Date(eventDoc.date), 'EEEE', {
      locale: fi,
    });
    const date = format(new Date(eventDoc.date), 'dd.MM.yyyy', {
      locale: fi,
    });

    return {
      ...mapEventOptions(eventDoc),
      subtitle: eventDoc.subtitle,
      weekDay,
      date,
      participantCount: eventDoc.participants.length,
    };
  });

  sendWeeklyEmail(users, {
    eventOptions: options,
    preferencesUrl: `${clientDomain}/preferences`,
  });
};
