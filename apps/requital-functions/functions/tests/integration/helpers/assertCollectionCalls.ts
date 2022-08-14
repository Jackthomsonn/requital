export const assertNumberOfCallsForCollection = (collection: string, spy: jest.SpyInstance, amount: number) => {
  const numberOfCalls = spy.mock.calls.flat().reduce((acc, cur) => {
    if (cur == collection) return acc + 1;

    return acc;
  }, 0);

  expect(numberOfCalls).toBe(amount);
};
