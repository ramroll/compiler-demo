const keywords = require('./keywords')

const STATES = {
  INIT : 0,
  NUMBER : 1,
  LITERAL : 2,
  STMTEND : 3,
  OP: 4
}
// 关键词表

function lexer(code) {

  // 代表扫描结果
  let m = ''

  // 当前状态
  let state = STATES.INIT

  // 最后的输出
  // 就是词法分析（断句）得到的符号表
  // 格式[{type, v}...]
  const tokens = []
  
  // 利用闭包的特性
  // 提取一个token并清空m和state
  function flush_make_token() {
    switch(state) {
      case STATES.INIT:
        break
      case STATES.LITERAL:{
        const type = keywords.includes(m) ? 'keyword' : 'variable'
        tokens.push({type, v : m})
        break
      }
      case STATES.OP:{
        tokens.push({type :'op', v: m})
        break
      }
      case STATES.NUMBER:
        tokens.push({type : 'number', v:m})
        break

      case STATES.STMTEND:
        tokens.push({type :'stmtend', v :';'})
        break
    }

    state = STATES.INIT
    m = ''
  }

  // 主循环体，每次读取一个字符并分析
  for(let i = 0; i < code.length; i++){
    const c = code[i]
    switch (c) {
      case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'h':
      case 'i':
      case 'j':
      case 'k':
      case 'l':
      case 'm':
      case 'n':
      case 'o':
      case 'p':
      case 'q':
      case 'r':
      case 's':
      case 't':
      case 'u':
      case 'v':
      case 'w':
      case 'x':
      case 'y':
      case 'z':
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
      case 'J':
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'O':
      case 'P':
      case 'Q':
      case 'R':
      case 'S':
      case 'T':
      case 'U':
      case 'V':
      case 'W':
      case 'X':
      case 'Y':
      case 'Z':
        state = STATES.LITERAL
        m += c
        break
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        state = STATES.NUMBER
        m += c
        break
      case '+':
      case '-':
      case '*':
      case '/':        
        flush_make_token()
        state = STATES.OP
        m+=c
        flush_make_token()

        break
      case ';':
        flush_make_token()
        state = STATES.STMTEND
        flush_make_token()
        break
      case '=':
        if(m === '='){
          m+=c
          state = STATES.OP
          console.log(m, state)
          flush_make_token()
        }else {          
          flush_make_token()          
          m+=c
          if(code[i+1] !== '='){        
            state = STATES.OP
            flush_make_token()
          }
        }
        break
      case '{':
      case '}':
      case '(':
      case ')': {
        flush_make_token()
        state = STATES.OP
        m += c
        flush_make_token() 
        break
      }
      case ' ':
      case '\n' :
        flush_make_token()
        break
    }
  }
  return tokens
}


module.exports = lexer