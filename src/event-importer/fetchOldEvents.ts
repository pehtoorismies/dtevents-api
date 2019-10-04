import rp from 'request-promise';
import {
  map,
  compose,
  join,
  juxt,
  toUpper,
  head,
  takeLast,
  tail,
  take,
  replace,
} from 'ramda';
import { parseISO } from 'date-fns';
import { setHours, setMinutes } from 'date-fns/fp';

const capitalize = compose(
  join(''),
  juxt([
    compose(
      toUpper,
      head,
    ),
    tail,
  ]),
);

const parseDate = (date: string, time: string): string => {
  const t1 = replace(/\./, ':', time);
  const t2 = take(5, t1);

  const hour = Number(take(2, t2) || 0);

  const minute = Number(takeLast(2, t2) || 0);

  const d = parseISO(date);

  const updated: Date = compose(
    setHours(hour),
    setMinutes(minute),
  )(d);

  return updated.toISOString();
};

const parseEvent = (evtDoc: any) => {
  const exactTime = !!evtDoc.time;
  const subtitle = evtDoc.sub;
  const date = exactTime ? parseDate(evtDoc.date, evtDoc.time) : evtDoc.date;
  const title = take(25, evtDoc.name);

  return {
    type: capitalize(evtDoc.eventType),
    title,
    race: evtDoc.race,
    description: evtDoc.contentHTML,
    date,
    subtitle,
    exactTime,
  };
};

const fetchOldEvents = async () => {
  const eventJson = await rp({
    method: 'GET',
    url: `https://api.downtown65.com/api/dt-events/next`,
  });

  const events = JSON.parse(eventJson);
  const compliantEvents = map(parseEvent, events);
  return compliantEvents;
};

export default fetchOldEvents;

