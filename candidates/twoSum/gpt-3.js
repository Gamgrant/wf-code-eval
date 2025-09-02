function twoSum(nums, target) {
  // Broken implementation - wrong logic
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] + nums[i+1] === target) {
      return [i, i+1];
    }
  }
  return [];
}