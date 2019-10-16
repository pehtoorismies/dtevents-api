import { emailList, recipientVariables, filterUndefined } from '../util';
import { path } from 'ramda';
import dequal from 'deep-equal';

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

test('filterUndefined', () => {
  const me1 = { name: 'koira', username: 'sika' };
  const me2 = { name: 'koira', username: undefined };
  const me3 = { name: 'koira', username: null };
  expect(dequal(filterUndefined(me1), me1)).toBeTruthy();

  const filtered2 = filterUndefined(me2);
  expect(dequal(filtered2, me2)).toBeFalsy();
  expect(filtered2.username).toBeUndefined();
  expect(filterUndefined(me3).username).toBeUndefined();
});
