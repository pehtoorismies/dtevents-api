import { emailList, recipientVariables } from '../util';
import { path } from 'ramda';

test('emailList', () => {
  expect(
    emailList([
      { email: 'koira', name: 'sika' },
      { email: 'repo', name: 'kissa' },
    ]),
  ).toBe('koira,repo');
});

test('recipientVariables', () => {
  const rvs = recipientVariables([
    { email: 'koira', name: 'sika' },
    { email: 'repo', name: 'kissa' },
  ]);
  expect(path(['koira', 'first'], rvs)).toBe('sika');
  expect(path(['repo', 'first'], rvs)).toBe('kissa');
  expect(path(['koira', 'id'], rvs)).toBe('0');
  expect(path(['repo', 'id'], rvs)).toBe('1');
});
