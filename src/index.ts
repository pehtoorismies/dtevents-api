import { formatError } from 'apollo-errors';
import { GraphQLServer } from 'graphql-yoga';
import { connect, connection, model } from 'mongoose';
import { makeSchema } from 'nexus';
import { join } from 'path';

import { config } from './config';
import { EventSchema, UserSchema } from './db-schema';
import {
  accessToken,
  addUserData,
  permissions,
  requestScopes,
} from './middleware';
import resolvers from './resolvers';

// import { Context } from './types';
const {
  AuthPayload,
  User,
  DateTime,
  Mutation,
  Query,
  Event,
  SimpleUser,
} = resolvers;

const { mongoUrl } = config;

const serverOptions = {
  port: 4000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
  getEndpoint: true, // enable for liveness/readiness probes
  formatError,
};

const mongoOptions = {
  useNewUrlParser: true,
  autoIndex: false,
  reconnectInterval: 500,
  reconnectTries: Number.MAX_VALUE,
  bufferMaxEntries: 10,
};

const startServer = () => {
  const schema = makeSchema({
    types: [AuthPayload, Event, User, DateTime, Mutation, Query, SimpleUser],
    outputs: {
      typegen: join(__dirname, '../generated/nexus-typegen.ts'),
      schema: join(__dirname, '/schema.graphql'),
    },
    // typegenAutoConfig: {
    //   sources: [
    //     {
    //       source: '@generated/photon',
    //       alias: 'photon',
    //     },
    //     {
    //       source: join(__dirname, 'types.ts'),
    //       alias: 'ctx',
    //     },
    //   ],
    //   contextType: 'ctx.Context',
    // },
  });

  const server = new GraphQLServer({
    schema,
    context: req => ({
      ...req,
      mongoose: {
        UserModel: model('User', UserSchema),
        EventModel: model('Event', EventSchema),
      },
    }),
    middlewares: [accessToken, requestScopes, addUserData, permissions],
    // middlewares: [accessToken],
  });

  server.start(serverOptions, ({ port }) =>
    console.log(`🚀🚀🚀🚀🚀🚀🚀 Server started on port ${port} 🚀🚀🚀🚀🚀🚀🚀`),
  );
};

// Mongo events

connection.on('connecting', () => {
  console.log('connecting to mongo');
});
connection.on('disconnected', () => {
  console.log('-> lost connection');
});

connection.on('reconnect', () => {
  console.log('-> reconnected');
});

connection.on('connected', () => {
  console.log('-> connected');
});

connect(
  mongoUrl,
  mongoOptions,
).then(
  () => {
    console.log('Ready');
  },
  err => {
    console.error(err);
  },
);

startServer();
