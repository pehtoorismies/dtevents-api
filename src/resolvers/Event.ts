import { objectType, enumType } from 'nexus';
import { EVENT_TYPES } from '../constants';

export const EventType = enumType({
  name: 'EventType',
  members: EVENT_TYPES,
});

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.string('id', { description: 'Id of the event' });
    t.string('title');
    t.string('subtitle', { nullable: true });
    t.boolean('race');
    t.field('type', {
      type: EventType,
    });
    t.date('date');
    t.string('time', { nullable: true });
    t.string('description', { nullable: true });
    t.date('createdAt');
    t.date('updatedAt');

    t.list.field('participants', {
      type: 'SimpleUser',
    });
    t.field('creator', {
      type: 'SimpleUser',
    });
  },
});
