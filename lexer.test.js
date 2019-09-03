const lexer = require('./lexer')
const sourceCode = `
function fib(n){
  if(n == 1 or n == 2) {
    return 1;
  }
  return fib(n - 1) + fib(n-1);
}

print( fib(n) );
`

const sourceCode2 = `
  auto x = 3 * 7 + 1
  print(x)
`   
lexer(sourceCode).forEach(x => console.log(`${x.type}:${x.v}`))
