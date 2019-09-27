import EmailValidator from 'email-validator';
import { Schema } from 'mongoose';

import { EVENT_TYPES } from '../constants';

const timestamps = {
  createdAt: 'createdAt', updatedAt: 'updatedAt'
}

// USER
export const UserSchema = new Schema({
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
    required: true
  },
  username: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name: String,
}, { timestamps });


export const SimpleUser = new Schema({
  username: String,
  // _id: String
});

SimpleUser.virtual('id').get(function(){
  // @ts-ignore
  return this._id.toHexString();
});


// EVENT
export const EventSchema = new Schema({
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
  participants: [SimpleUser],
  creator: {
    type: SimpleUser,
    default: {
      // _id: 0,
      username: 'unknown'
    },
  },

}, { timestamps });
