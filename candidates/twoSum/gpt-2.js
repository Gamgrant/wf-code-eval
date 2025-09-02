function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (diff in seen) {
      return [seen[diff], i];
    }
    seen[nums[i]] = i;
  }
}