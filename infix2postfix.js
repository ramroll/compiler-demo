// 定义操作符优先级
const precedence = {
  '(': 0,
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2
}

// 将中缀(infix)序列转成后缀(postfix)序列，
// 比如 A + B -> A B +
// 再比如 A + B * C -> A B C * +
// 再比如 A * (B + C) -> A B C + *
// 本质上 ABC的相对顺序不变，后缀序列的操作符会在不同的地方
function infix2postfix(tokens) {

  const stack = [] // 用于存储序不确定的元素
  const postfix = [] // 用于存储序确定的元素
  while(tokens.length > 0) {

    const token = tokens.pop()
    if(token.type === 'op'){
      if(stack.length === 0){ // 栈为空，那么不确定计算顺序，将操作符放入stack
        stack.push(token)
      } else {
        const last = stack[stack.length - 1]

        // 当前操作符优先级比栈中的更高
        // 后续是否有更高优先级不确定
        // 因此将当前操作符放入stack
        if(precedence[token.v] > precedence[last.v]) {
          stack.push(token)
        }else {
          // 当前操作符比栈中的低（或一样），可以先计算栈中的符号
          // 然后将当前操作符放入栈
          postfix.push( stack.pop() )
          stack.push(token)
        }
      }
    }
    else if(token.v === '('){
      stack.push(token)
      break
    }
    else if(token.v === ')'){
      while(stack.length >0){
        const token = stack.pop()
        if(token === '('){
          break
        }else {
          postfix.push(token)
        }
      }
      break
    }else {
      postfix.push(token)
    }
  }
  while(stack.length > 0){
    postfix.push(stack.pop())
  }

  return postfix

}

module.exports = infix2postfix