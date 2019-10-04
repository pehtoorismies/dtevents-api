import { GraphQLDateTime } from "graphql-iso-date";
import { asNexusMethod } from 'nexus';

export const GQLDate = asNexusMethod(GraphQLDateTime, "date");
export const DateTime = GraphQLDateTime;