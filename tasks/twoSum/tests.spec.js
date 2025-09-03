const testCases = [
  {
    input: { nums: [2, 7, 11, 15], target: 9 },
    expected: [0, 1]
  },
  {
    input: { nums: [3, 2, 4], target: 6 },
    expected: [1, 2]
  },
  {
    input: { nums: [3, 3], target: 6 },
    expected: [0, 1]
  },
  {
    input: { nums: [-1, -2, -3, -4, -5], target: -8 },
    expected: [2, 4]
  },
  {
    input: { nums: [0, 4, 3, 0], target: 0 },
    expected: [0, 3]
  }
];

// module.exports = { testCases };
export { testCases };