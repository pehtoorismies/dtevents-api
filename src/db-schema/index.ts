import EmailValidator from 'email-validator';
import { model, Schema } from 'mongoose';

import { EVENT_TYPES } from '../constants';
import { notifyEventCreationSubscribers } from '../nofications';

const timestamps = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const PreferencesSchema = new Schema({
  subscribeWeeklyEmail: {
    type: Boolean,
    default: true,
  },
  subscribeEventCreationEmail: {
    type: Boolean,
    default: true,
  },
});

// UserDetails
const UserDetailsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  preferences: {
    type: PreferencesSchema,
    default: PreferencesSchema,
  },
});

UserDetailsSchema.statics.findOneOrCreate = function findOneOrCreate(
  condition : any,
  doc : any,
) {
  const self = this;
  const newDocument = doc;
  return new Promise((resolve, reject) => {
    return self
      .findOne(condition)
      .then((result: any) => {
        if (result) {
          return resolve(result);
        }
        return self
          .create(newDocument)
          .then((result: any) => {
            return resolve(result);
          })
          .catch((error: Error) => {
            return reject(error);
          });
      })
      .catch((error: Error) => {
        return reject(error);
      });
  });
};

// USER
const UserSchema = new Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      validate: {
        validator: (email: string) => EmailValidator.validate(email),
        // @ts-ignore: Don't know how to fix
        message: (props: any) => `${props.value} is not a valid email!`,
      },
      index: true,
      required: true,
    },
    username: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    name: String,
  },
  { timestamps },
);

const SimpleUserSchema = new Schema({
  username: String,
  // _id: String
});

SimpleUserSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id.toHexString();
});

// EVENT
const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    subtitle: String,
    race: { type: Boolean, default: false },
    date: {
      type: Date,
      required: true,
    },
    exactTime: Boolean,
    description: String,
    participants: [SimpleUserSchema],
    creator: {
      type: SimpleUserSchema,
      default: {
        // _id: 0,
        username: 'unknown',
      },
    },
  },
  { timestamps },
);

EventSchema.post('save', (eventDoc: any, next: any) => {
  notifyEventCreationSubscribers(
    model('UserDetails', UserDetailsSchema),
    model('User', UserSchema),
    eventDoc,
  );
  next();
});

export {
  EventSchema,
  PreferencesSchema,
  SimpleUserSchema,
  UserDetailsSchema,
  UserSchema,
};
