import { enumType } from 'nexus';

export const EventTypeEnum = enumType({
  name: 'EventTypeEnum',
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
