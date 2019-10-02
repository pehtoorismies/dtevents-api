import format from 'date-fns/format';
import { fi } from 'date-fns/locale';
import addWeeks from 'date-fns/addWeeks';

import { EVENT_TYPES } from '../constants';
import { config } from '../config';
import { sendEventCreationEmail, sendWeeklyEmail } from '../mail';
import {
  IEventEmailOptions,
  IMailRecipient,
  IWeeklyEmailOptions,
} from '../types';
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
    creator: eventDoc.creator.username,
    date,
    typeHeader,
    type: type.toLowerCase(),
    description: eventDoc.description || 'ei tarkempaa kuvausta.',
  };
};

export const notifyEventCreationSubscribers = async (
  UserModel: any,
  eventDoc: any,
): Promise<void> => {
  
  const eventOptions: IEventEmailOptions = mapEventOptions(eventDoc);
  const emailObjects: IMailRecipient[] = await UserModel.find(
    {
      'preferences.subscribeEventCreationEmail': true,
    },
    { email: 1, name: 1 },
  );

  if (emailObjects.length === 0) {
    // no subsriptions
    return;
  }
  sendEventCreationEmail(emailObjects, eventOptions);
};

export const notifyWeeklySubscribers = async (
  UserModel: any,
  EventModel: any,
): Promise<void> => {
  const now = new Date();
  const weekFromNow = addWeeks(now, 1);
  const search = {
    date: { $gte: now, $lte: weekFromNow },
  };

  const events = await EventModel.find(search);

  const emailObjects: IMailRecipient[] = await UserModel.find(
    {
      'preferences.subscribeWeeklyEmail': true,
    },
    { email: 1, name: 1 },
  );
  const options: IWeeklyEmailOptions[] = events.map((eventDoc: any) => {
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
    }
  });

  sendWeeklyEmail(emailObjects, options);
};
