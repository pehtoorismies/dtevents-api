import { objectType, enumType } from 'nexus';
import { EVENT_TYPES } from '../constants';
import { SimpleUser } from './User';

export const EventType = enumType({
  name: 'EventType',
  members: EVENT_TYPES,
});

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.string("id", { description: "Id of the event" });
    t.string('title');
    t.string('subtitle');
    t.boolean('race');
    t.field("type", {
      type: EventType,
    });
    t.date('date');
    t.string('time');
    t.string('description');
    t.date('createdAt');
    t.date('updatedAt');

    t.list.field("participants", {
      type: SimpleUser,

    });
    t.field("creator", {
      type: SimpleUser,
    });
  },
});

