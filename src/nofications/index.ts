import format from 'date-fns/format';
import { fi } from 'date-fns/locale';

import { config } from '../config';
import sendMail from '../mail';
import { IEventEmailOptions, IMailRecipient } from '../types';

const { clientDomain } = config;

export const notifyEventCreationSubscribers = async (
  UserModel: any,
  eventDoc: any,
): Promise<void> => {
  const date = format(new Date(eventDoc.date), 'dd.MM.yyyy (EEEE)', {
    locale: fi,
  });

  const eventOptions: IEventEmailOptions = {
    title: eventDoc.title,
    eventUrl: `${clientDomain}/events/${eventDoc._id}`,
    creator: eventDoc.creator.username,
    date,
    type: eventDoc.type,
  };

  const emailObjects : IMailRecipient[] = await UserModel.find(
    {
      'preferences.subscribeEventCreationEmail': true,
    },
    { email: 1, name: 1 },
  );
  
  if (emailObjects.length === 0) {
    // no subsriptions
    return;
  }
  sendMail(emailObjects, eventOptions);
};
