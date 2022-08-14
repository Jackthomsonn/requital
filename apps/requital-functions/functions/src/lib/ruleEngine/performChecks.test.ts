import { performChecks } from './performChecks';

describe('performChecks', () => {
  test('when every check passes it should return allChecksPassed as true', () => {
    const { allChecksPassed } = performChecks([jest.fn(() => true), jest.fn(() => true)]);

    expect(allChecksPassed).toEqual(true);
  });

  test('when at least one check fails it should return allChecksPassed as false', () => {
    const { allChecksPassed } = performChecks([jest.fn(() => true), jest.fn(() => false)]);

    expect(allChecksPassed).toEqual(false);
  });
});
