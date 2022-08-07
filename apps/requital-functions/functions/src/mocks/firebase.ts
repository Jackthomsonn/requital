const mockDoc = {
  set: jest.fn(() => {
    return Promise.resolve();
  }),
  update: jest.fn(() => {
    return Promise.resolve();
  }),
};

export const mockFirebase = (docs: any[]) => {
  return {
    firestore: jest.fn(() => {
      return {
        collection: jest.fn(() => {
          return {
            withConverter: jest.fn(() => {
              return {
                where: jest.fn(() => {
                  return {
                    doc: jest.fn(() => mockDoc),
                    get: jest.fn(() => {
                      return {
                        docs: jest.fn(() => Promise.resolve(docs)),
                      };
                    }),
                  };
                }),
                doc: jest.fn(() => mockDoc),
              };
            }),
          };
        }),
      };
    }),
  };
};
