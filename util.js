/**
 * 输入的函数数组其中只要有一个返回结果，就返回该结果， 否则报错
 * @param {} functions 
 */
function successOneOrError (...functions) {
    return (...args) => {
        for(let i = 0; i <functions.length; i++){
            try{
                const result = functions[i](...args)
                return result
            }
            catch(ex){
                console.log(ex)
                // 如果发生异常先跳过
            }
            
        }
        throw 'syntax error'
    }
}

function epsilon(){
    return null
}

function printAST(ast, level = 0){

    if(!ast) return

    if(Array.isArray(ast)){
        for(let node of ast){
            printAST(node)
        }
        return
    }
    
    const {type, tag, op, name, value} = ast
    

    switch(type){
        case 'stmt':
            console.log(''.padStart(level * 4, ' '), `stmt(${tag})`)
            if(tag === 'assign')
                console.log(''.padStart((level+1) * 4, ' '), `name=${name.value}`) 
            break
        case 'expr':
        case 'term':
            console.log(''.padStart(level * 4, ' '), `${type}(${op})`)
            break
        case 'number':
            console.log(''.padStart(level * 4, ' '), `${value}`)
            break
        case 'variable':
            console.log(''.padStart(level * 4, ' '), `${value}`)
            break
            
    }
    Object.keys(ast).forEach( (key) => {
        const obj = ast[key]

        if(typeof obj === 'object'){
            printAST(obj, level + 1)
        }

    })

}


module.exports = {
    successOneOrError,
    epsilon,
    printAST
}