import Photon from '@generated/photon';
import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import { makeSchema } from '@prisma/nexus';
import { GraphQLServer } from 'graphql-yoga';
import { join } from 'path';
import { formatError } from 'apollo-errors';
import { Context } from './types';
import resolvers from './resolvers';

const photon = new Photon();

const { AuthPayload, User, Query, Mutation, Event, EventType } = resolvers;

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
});

const schema = makeSchema({
  types: [AuthPayload, Query, Mutation, EventType, Event, User, nexusPrisma],
  outputs: {
    typegen: join(__dirname, '../generated/nexus-typegen.ts'),
    schema: join(__dirname, '/schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
      {
        source: join(__dirname, 'types.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
});

const options = {
  port: 4000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
  getEndpoint: true,// enable for liveness/readiness probes
  formatError,
};

const server = new GraphQLServer({
  schema,
  context: { photon },
});

server.start(options, ({ port }) =>
  console.log(
    `🚀 Server started, listening on port ${port} for incoming requests.`,
  ),
);
