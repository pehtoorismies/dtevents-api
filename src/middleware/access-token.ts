import * as R from 'ramda';

const getBearerToken = (header?: string) => {
  if (!header) {
    return null;
  }

  return R.pipe(
    R.split('Bearer'),
    R.last,
    R.trim,
  )(header);
};

const accessToken = async (
  resolve: any,
  parent: any,
  args: any,
  context: any,
  info: any,
) => {
  const authHeader = context.request.get('Authorization');
  const jwtToken = getBearerToken(authHeader);
  
  if (!jwtToken) {
    const result = await resolve(parent, args, context, info);
    return result;
  }
  const newContext = {
    ...context,
    accessToken: jwtToken,
  }
  
  return await resolve(parent, args, newContext, info)  
};

export default accessToken;
