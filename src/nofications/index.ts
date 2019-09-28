import format from 'date-fns/format';
import { fi } from 'date-fns/locale';
import { pluck } from 'ramda';

import { config } from '../config';
import sendMail from '../mail';
import { IEventEmailOptions } from '../types';

const { clientDomain } = config;

export const notifyEventCreationSubscribers = async (
  UserDetailsModel: any,
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
    type: eventDoc.type.toLowerCase(),
  };
  // const retVal = await sendMail(recients, eventOptions);

  const userIdObjects = await UserDetailsModel.find(
    {
      'preferences.subscribeEventCreationEmail': true,
    },
    { userId: 1 },
  );

  const userIds = pluck('userId')(userIdObjects);

  if (!userIds || userIds.length === 0) {
    return;
  }

  const emailObjects = await UserModel.find(
    { _id: { $in: userIds } },
    { email: 1 },
  );
  const recipients: string[] = pluck('email')(emailObjects);
  if (!recipients || recipients.length === 0) {
    console.error('cant find recipient emails for userIds');
    console.error(userIds);
    return;
  }
  sendMail(recipients, eventOptions);
};
