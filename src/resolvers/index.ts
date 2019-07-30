import { AuthPayload } from './AuthPayload';
import { Event } from './Event';
import { EventType } from './EventType';
import { Query } from './Query';
import { Mutation } from './Mutation';
import { User } from './User';

const resolvers = {
  Query,
  User,
  Event,
  EventType,
  // Post,
  Mutation,
  AuthPayload,
};

export default resolvers;
