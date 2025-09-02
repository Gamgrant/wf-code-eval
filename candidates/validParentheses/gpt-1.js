function isValid(s) {
  const stack = [];
  const map = new Map([
    [')', '('],
    [']', '['],
    ['}', '{']
  ]);
  
  for (const c of s) {
    if (!map.has(c)) {
      stack.push(c);
    } else if (stack.pop() !== map.get(c)) {
      return false;
    }
  }
  
  return stack.length === 0;
}