// import EmailValidator from 'email-validator';
import { Schema } from 'mongoose';

import { EVENT_ENUMS } from '../constants';


const timestamps = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const SimpleUserSchema = new Schema({
  username: { type: String, required: false },
  nickname: { type: String, required: false },
  sub: { type: String, required: false },
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
      enum: EVENT_ENUMS,
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
    },
  },
  { timestamps },
);

export { EventSchema };
