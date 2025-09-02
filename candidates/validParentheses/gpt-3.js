function isValid(s) {
  if (s.length % 2 !== 0) return false;
  
  const stack = [];
  const openBrackets = ['(', '[', '{'];
  const closeBrackets = [')', ']', '}'];
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (openBrackets.includes(char)) {
      stack.push(char);
    } else if (closeBrackets.includes(char)) {
      if (stack.length === 0) return false;
      const lastOpen = stack.pop();
      const openIndex = openBrackets.indexOf(lastOpen);
      const closeIndex = closeBrackets.indexOf(char);
      if (openIndex !== closeIndex) return false;
    }
  }
  
  return stack.length === 0;
}