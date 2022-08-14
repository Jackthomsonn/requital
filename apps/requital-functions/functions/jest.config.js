module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src/lib", "tests/integration"],
  coveragePathIgnorePatterns: ["tests/mocks"],
  clearMocks: true,
  coverageDirectory: "./coverage/",
  collectCoverage: true,
};
