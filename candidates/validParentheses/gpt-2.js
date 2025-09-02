function isValid(s) {
  // Incorrect - doesn't handle nesting properly
  let count = 0;
  for (let char of s) {
    if (char === '(' || char === '[' || char === '{') {
      count++;
    } else {
      count--;
    }
    if (count < 0) return false;
  }
  return count === 0;
}