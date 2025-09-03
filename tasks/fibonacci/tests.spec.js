const testCases = [
  {
    input: { n: 0 },
    expected: 0
  },
  {
    input: { n: 1 },
    expected: 1
  },
  {
    input: { n: 2 },
    expected: 1
  },
  {
    input: { n: 3 },
    expected: 2
  },
  {
    input: { n: 4 },
    expected: 3
  },
  {
    input: { n: 5 },
    expected: 5
  },
  {
    input: { n: 10 },
    expected: 55
  },
  {
    input: { n: 15 },
    expected: 610
  }
];

// module.exports = { testCases };
export { testCases };