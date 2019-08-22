import { createError } from 'apollo-errors';

const create = (type: string, defaultMessage: string): any => {
  return createError(type, {
    message: defaultMessage,
    options: {
      showPath: true,
      showLocations: true,
    },
  });
};

export const UserInputError = create('UserInputError', 'Wrong input');
export const Auth0Error = create('Auth0Error', 'Auth0 error');
export const AuthorizationError = create(
  'UserInputError',
  'Not enough privileges',
);
export const JWTError = create('JWTError', 'JWT error');
export const NotFoundError = create('NotFoundError', 'Record not found');
