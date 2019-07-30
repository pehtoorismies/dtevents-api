import Photon from '@generated/photon';
import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import { idArg, makeSchema, objectType, stringArg } from '@prisma/nexus';
import { GraphQLServer } from 'graphql-yoga';
import { join } from 'path';
import { Context } from './types';
import resolvers from './resolvers';

const photon = new Photon();

const { User, Query, Event } = resolvers;

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
});

const schema = makeSchema({
  types: [Query, Event, User, nexusPrisma],
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

const server = new GraphQLServer({
  schema,
  context: { photon },
});

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`));
