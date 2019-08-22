import { AuthPayload } from './AuthPayload';
import { DateTime } from './DateTime';
import { Event } from './Event';
import { EventTypeEnum } from './EventTypeEnum';
import { Query } from './Query';
import { Mutation } from './Mutation';
import { User, SimpleUser } from './User';

const resolvers = {
  Query,
  User,
  Event,
  EventTypeEnum,
  DateTime,
  Mutation,
  AuthPayload,
  SimpleUser
};

export default resolvers;
