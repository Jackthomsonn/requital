export const performChecks = (checks: any[]) => {
  return {
    allChecksPassed: checks.every((check) => check()),
  };
};
