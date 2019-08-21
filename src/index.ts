import { makeSchema } from 'nexus';
import { connect, model } from 'mongoose';
import { GraphQLServer } from 'graphql-yoga';
import { join } from 'path';
import { formatError } from 'apollo-errors';
// import { Context } from './types';
import resolvers from './resolvers';
import { UserSchema, EventSchema } from './db-schema'
import { requestScopes, permissions, accessToken, addUserData } from './middleware';
const { AuthPayload, User, DateTime, Mutation, Query, Event, SimpleUser } = resolvers;

const startServer = () => {
  const options = {
    port: 4000,
    endpoint: '/graphql',
    subscriptions: '/subscriptions',
    playground: '/playground',
    getEndpoint: true,// enable for liveness/readiness probes
    formatError,
  };
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
      ...req, mongoose: {
        UserModel: model('User', UserSchema),
        EventModel: model('Event', EventSchema),
      }
    }),
    middlewares: [accessToken, requestScopes, addUserData, permissions],
    // middlewares: [accessToken],
  });

  server.start(options, ({ port }) =>
    console.log(
      `🚀🚀🚀🚀🚀🚀🚀 Server started on port ${port} 🚀🚀🚀🚀🚀🚀🚀`,
    ),
  );
}


const createServer = async () => {
  try {
    await connect('mongodb://localhost/dt65', { useNewUrlParser: true, autoIndex: false, dbName: 'dt65' });
    startServer();

  } catch (error) {
    console.error(error);
  }
}


createServer();








