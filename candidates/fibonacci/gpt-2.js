function fibonacci(n) {
  const memo = {};
  
  function fib(n) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  }
  
  return fib(n);
}