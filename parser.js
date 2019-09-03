const lexer = require('./lexer')

const { successOneOrError, epsilon, printAST } = require('./util')

// Program -> Stmts 
// Stmts -> Stmt :: Stmts
// Stmt -> Block | IfStmt | AssignStmt | CallStmt | Expr
// IfStmt -> if(expr) Block | if(expr) Block else Block
// Block -> { Stmts }
// Expr -> (Expr) |Expr + Term | Expr - Term | Term
// equalv : Expr -> (Expr) | Term RExpr
//          RExpr -> + Term RExpr | - Term RExpr | e
// Term -> Term * factor | Term / factor | factor
// equalv :  Term -> (Expr) | factor RTerm
//           RTerm -> * Term RTerm | / Term RTerm | e
// 
class Parser{

  constructor(sourceCode){
    // 使用this.wrapper装饰左右parseXXX开头的函数
    this.inited = false
  }

  init(){
    if(!this.inited) {
      for(let key in Object.getOwnPropertyDescriptors(this.__proto__)){        
        if(key.match(/^parse[A-Z].*$/)){          
          this[key] = this.wrapper(this[key].bind(this))
        }
      }
    }
  }

  parse(sourceCode){
    this.init()
    this.tokens = lexer(sourceCode)

    for(let token of this.tokens){
      console.log(token)
    }

    this.i = 0
    return this.parseProgram()
  }

  parseProgram(){
    return this.parseStmts()
  }

  parseStmts(){
    console.log('parse-stmts')

    let stmt = null
    const stmts = []
    while(stmt = this.parseStmt()) {
      stmts.push(stmt)
      console.log('-------------')
    }
    return stmts

  }

  parseStmt(){
    console.log('parse-stmt')
    return successOneOrError( 
      this.parseBlock, 
      this.parseIfStmt, 
      this.parseAssignStmt, 
      this.parseCallStmt 
    )()
  }

  parseBlock(){
    console.log('parse-block')
    this.eat('{')
    const stmts = this.parseStmts()
    this.eat('}')
    return stmts
  }

  parseIfStmt(){
    console.log('parse-if-stmt')
    const stmt = {
      type : 'if'
    }
    this.eat('if')
    stmt.if_expr = this.parseExpr()
    stmt.if_block = this.parseBlock()
    const currentToken = this.getCurrent()

    if(currentToken.v === 'else'){
      this.eat('else')
      stmt.else_expr = this.parseExpr()
      stmt.else_block = this.parseBlock()
    }
    return stmt
  }

  parseAssignStmt(){
    console.log('parse-assign-stmt')
    const result = successOneOrError(
      this.concatWith('auto', this.parseVariable, '=', this.parseExpr, ';'),
      this.concatWith(this.parseVariable, '=', this.parseExpr, ';'),
    )()

    

    if(result[0] === 'auto') {
      return {
        type :'stmt',
        tag :'assign',
        alloc : true,        
        name :result[1],
        expr : result[3]
      }
    }else {
      return {
        type :'stmt',
        tag :'assign',
        name :result[1],
        expr : result[2]
      }
    }


  }

  parseCallStmt(){
    console.log('parse-call-stmt')
    throw 'not impl.'
  }
  
  parseExpr(){
    console.log('parse-expr')
    const result = this.concatWith(            
      this.parseTerm,
      this.parseRExpr,
    )()


    if(result[1]) {
      return {
        type :'expr',
        op : result[1][0],
        left : result[0],
        right : result[1][1]
      }
    }else {
      return result[0]
    }
  }

  parseRExpr() {
    console.log('parse-r-expr')
    console.log(this.getCurrent())
    return successOneOrError(
      this.concatWith('+', this.parseTerm),
      this.concatWith('-', this.parseTerm),
      epsilon
    )()
  }

  parseTerm() {
    console.log('parse-term', this.getCurrent().v, this.tokens[this.i +1].v)
    const result = successOneOrError(
      this.concatWith( '(', this.parseExpr, ')'),
      this.concatWith(
        this.parseFactor,
        this.parseRTerm
      )
    )()
    if(result[0] === '('){
      return result[1]
    }
    if(result[1]){
      return {
        type :'term',
        op : result[1][0],
        left : result[0],
        right : result[1][1]
      }
    }
    return result[0]
  }

  parseRTerm(){
    console.log('parse-r-term')
    const result = successOneOrError(            
      this.concatWith( '*', this.parseTerm, this.parseRTerm ),
      this.concatWith( '/', this.parseTerm, this.parseRTerm ),
      epsilon
    )()
    return result
  }

  parseFactor() {
    console.log('parse-factor')

    return successOneOrError(
      this.parseNumber,
      this.parseVariable
    )()
  }

  parseNumber(){
    console.log('parse-number')
    const val = this.eatByType('number')

    return {
      type: 'number',
      value: val
    }
  }

  parseVariable(){
    const val = this.eatByType('variable')
  
    return {
      type: 'variable',
      value: val
    }
  }


  eat(value){
    const token = this.getCurrent()
    if(token.v === value) {
      this.i ++
    } else {
      throw new Error(`expect a ${value} but ${token.v} found.`) 
    }
  }

  eatByType(type){
    const token = this.getCurrent()
    if(token.type === type) {
      this.i++
      return token.v
    }
    throw new Error(`expect a ${type} but ${token.type} found.`)
  }



  getCurrent(){
    return this.tokens[this.i]
  }


  /**
   * 如果被代理的函数执行成功，那么不更新parser的位置
   * 否则回滚
   * @param {*} func 
   */
  wrapper(func){
    return (...args) => {      
      const ii = this.i
      try{
        return func(...args)
      }catch(ex){
        this.i = ii
        throw ex
      }
      
    }
  }

  /**
   * 接收函数和字符，生成一个函数判断当前tokens是否满足和输入一样的格式
   * 如果执行成功，那么传入的函数执行，和字符串一起返回一个数组和原数组一一对应
   */
  concatWith( ...list ){
    const func = (...args) => {
      const result = []

      for(let o of list){

        if(typeof o === 'function') {
          result.push( o(...args) )
        }else { // String       

          this.eat(o)
          result.push(o)
        }
      }
      return result
    }
    return this.wrapper(func)

  }

}

const sourceCode = `
  auto x = 1 * (2 + 3);
  x = x * 10;
`  

const parser = new Parser()

const ast = parser.parse(sourceCode)
console.log(JSON.stringify(ast, null, 2))

printAST(ast)
module.exports = Parser