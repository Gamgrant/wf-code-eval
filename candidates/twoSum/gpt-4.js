function twoSum(nums, target) {
  const indices = [];
  const hashTable = {};
  
  for (let index = 0; index < nums.length; index++) {
    const numberToFind = target - nums[index];
    
    if (hashTable[numberToFind] !== undefined) {
      indices.push(hashTable[numberToFind]);
      indices.push(index);
      return indices;
    }
    
    hashTable[nums[index]] = index;
  }
  
  return indices;
}