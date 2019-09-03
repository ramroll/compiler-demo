const parse = require('./parser')
const lexer = require('./lexer')
const sourceCode = `
function fib(n){
  if(n == 1 or n == 2) {
    return 1
  }
  return fib(n - 1) + fib(n-1)
}

print( fib(n) )
`


const tokens = lexer(sourceCode)
parse(tokens)