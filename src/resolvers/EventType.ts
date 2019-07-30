import { enumType } from '@prisma/nexus';

export const EventType = enumType({
  name: 'EventType',
  members: [
    'Cycling',
    'Karonkka',
    'Meeting',
    'Orienteering',
    'Other',
    'Running',
    'Skiing',
    'Spinning',
    'Swimming',
    'TrackRunning',
    'Triathlon',
    'Ultras',
  ],
  description: 'Event Types',
});
