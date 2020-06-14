/**
 * This file was automatically generated by GraphQL Nexus
 * Do not make changes to this file directly
 */


import { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    date<FieldName extends string>(fieldName: FieldName, opts?: core.ScalarInputFieldConfig<core.GetGen3<"inputTypes", TypeName, FieldName>>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  EventData: { // input type
    date: string; // String!
    description?: string | null; // String
    exactTime?: boolean | null; // Boolean
    race?: boolean | null; // Boolean
    subtitle?: string | null; // String
    title: string; // String!
    type: string; // String!
  }
}

export interface NexusGenEnums {
  EventType: "Cycling" | "Karonkka" | "Meeting" | "NordicWalking" | "Orienteering" | "Other" | "Running" | "Skiing" | "Spinning" | "Swimming" | "TrackRunning" | "TrailRunning" | "Triathlon" | "Ultras"
}

export interface NexusGenRootTypes {
  AuthPayload: { // root type
    accessToken: string; // String!
    expiresIn: string; // String!
    idToken: string; // String!
  }
  BaseUser: { // root type
    email: string; // String!
    id: string; // String!
    name: string; // String!
    nickname: string; // String!
    picture: string; // String!
  }
  Event: { // root type
    createdAt: any; // DateTime!
    creator: NexusGenRootTypes['SimpleUser']; // SimpleUser!
    date: any; // DateTime!
    description?: string | null; // String
    exactTime?: boolean | null; // Boolean
    id: string; // String!
    participants: NexusGenRootTypes['SimpleUser'][]; // [SimpleUser!]!
    race: boolean; // Boolean!
    subtitle?: string | null; // String
    title: string; // String!
    type: NexusGenEnums['EventType']; // EventType!
    updatedAt: any; // DateTime!
  }
  IDPayload: { // root type
    id: string; // String!
  }
  Mutation: {};
  Preferences: { // root type
    subscribeEventCreationEmail: boolean; // Boolean!
    subscribeWeeklyEmail: boolean; // Boolean!
  }
  Query: {};
  SimpleUser: { // root type
    id: string; // String!
    nickname?: string | null; // String
    sub?: string | null; // String
    username?: string | null; // String
  }
  User: { // root type
    createdAt: any; // DateTime!
    email: string; // String!
    id: string; // String!
    name: string; // String!
    nickname?: string | null; // String
    preferences: NexusGenRootTypes['Preferences']; // Preferences!
    updatedAt?: any | null; // DateTime
  }
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  DateTime: any;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  EventData: NexusGenInputs['EventData'];
  EventType: NexusGenEnums['EventType'];
}

export interface NexusGenFieldTypes {
  AuthPayload: { // field return type
    accessToken: string; // String!
    expiresIn: string; // String!
    idToken: string; // String!
  }
  BaseUser: { // field return type
    email: string; // String!
    id: string; // String!
    name: string; // String!
    nickname: string; // String!
    picture: string; // String!
  }
  Event: { // field return type
    createdAt: any; // DateTime!
    creator: NexusGenRootTypes['SimpleUser']; // SimpleUser!
    date: any; // DateTime!
    description: string | null; // String
    exactTime: boolean | null; // Boolean
    id: string; // String!
    participants: NexusGenRootTypes['SimpleUser'][]; // [SimpleUser!]!
    race: boolean; // Boolean!
    subtitle: string | null; // String
    title: string; // String!
    type: NexusGenEnums['EventType']; // EventType!
    updatedAt: any; // DateTime!
  }
  IDPayload: { // field return type
    id: string; // String!
  }
  Mutation: { // field return type
    createEvent: NexusGenRootTypes['Event']; // Event!
    deleteEvent: NexusGenRootTypes['IDPayload']; // IDPayload!
    forgotPassword: boolean; // Boolean!
    login: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    signup: NexusGenRootTypes['User']; // User!
    toggleJoinEvent: NexusGenRootTypes['Event']; // Event!
    updateEvent: NexusGenRootTypes['Event']; // Event!
    updateMe: NexusGenRootTypes['User']; // User!
    updateMyPreferences: NexusGenRootTypes['User']; // User!
  }
  Preferences: { // field return type
    subscribeEventCreationEmail: boolean; // Boolean!
    subscribeWeeklyEmail: boolean; // Boolean!
  }
  Query: { // field return type
    findEvent: NexusGenRootTypes['Event']; // Event!
    findManyEvents: NexusGenRootTypes['Event'][]; // [Event!]!
    findOldEvents: NexusGenRootTypes['Event'][]; // [Event!]!
    liveness: boolean; // Boolean!
    me: NexusGenRootTypes['User']; // User!
    readiness: boolean; // Boolean!
    sendWeeklyEmail: boolean; // Boolean!
    users: NexusGenRootTypes['BaseUser'][]; // [BaseUser!]!
  }
  SimpleUser: { // field return type
    id: string; // String!
    nickname: string | null; // String
    sub: string | null; // String
    username: string | null; // String
  }
  User: { // field return type
    createdAt: any; // DateTime!
    email: string; // String!
    id: string; // String!
    name: string; // String!
    nickname: string | null; // String
    preferences: NexusGenRootTypes['Preferences']; // Preferences!
    updatedAt: any | null; // DateTime
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createEvent: { // args
      addMe?: boolean | null; // Boolean
      event: NexusGenInputs['EventData']; // EventData!
      notifySubscribers?: boolean | null; // Boolean
    }
    deleteEvent: { // args
      id: string; // ID!
    }
    forgotPassword: { // args
      email: string; // String!
    }
    login: { // args
      email: string; // String!
      password: string; // String!
    }
    signup: { // args
      email: string; // String!
      name: string; // String!
      nickname: string; // String!
      password: string; // String!
      registerSecret: string; // String!
    }
    toggleJoinEvent: { // args
      id: string; // ID!
    }
    updateEvent: { // args
      event?: NexusGenInputs['EventData'] | null; // EventData
      id: string; // ID!
    }
    updateMe: { // args
      name?: string | null; // String
      nickname?: string | null; // String
    }
    updateMyPreferences: { // args
      subscribeEventCreationEmail: boolean; // Boolean!
      subscribeWeeklyEmail: boolean; // Boolean!
    }
  }
  Query: {
    findEvent: { // args
      id: string; // ID!
    }
    findManyEvents: { // args
      limit?: number | null; // Int
    }
    findOldEvents: { // args
      limit?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "AuthPayload" | "BaseUser" | "Event" | "IDPayload" | "Mutation" | "Preferences" | "Query" | "SimpleUser" | "User";

export type NexusGenInputNames = "EventData";

export type NexusGenEnumNames = "EventType";

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = "Boolean" | "DateTime" | "Float" | "ID" | "Int" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  allTypes: NexusGenAllTypes;
  inheritedFields: NexusGenInheritedFields;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;
}