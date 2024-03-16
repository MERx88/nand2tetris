let tokenCount = 0;

const INT_CONST = /\\d+/;

async function CompilationEngine(tokenizedFile) {
  let xmlFile = [];

  xmlFile = await compileClass(tokenizedFile);

  console.log(xmlFile);
  return xmlFile;
}

async function process(str) {
  tokenCount++;

  if (str == "<") {
    return `<symbol> &lt; </symbol>`;
  } else if (str == ">") {
    return `<symbol> &gt; </symbol>`;
  } else if (str == "&") {
    return `<symbol> &amp; </symbol>`;
  }

  if (str.startsWith('"')) {
    str = str.replace(/^"|"$/g, "");
    return `<stringConstant> ${str} </stringConstant>`;
  }

  if (/^\d+$/.test(str)) {
    return `<integerConstant> ${str} </integerConstant>`;
  }

  switch (str) {
    case "class":
    case "constructor":
    case "function":
    case "method":
    case "field":
    case "static":
    case "var":
    case "int":
    case "char":
    case "boolean":
    case "void":
    case "true":
    case "false":
    case "null":
    case "this":
    case "let":
    case "do":
    case "if":
    case "else":
    case "while":
    case "return":
      return `<keyword> ${str} </keyword>`;
    case "{":
    case "}":
    case "(":
    case ")":
    case "[":
    case "]":
    case ".":
    case ",":
    case ";":
    case "+":
    case "-":
    case "*":
    case "/":
    case "&":
    case "|":
    case "<":
    case ">":
    case "=":
    case "~":
      return `<symbol> ${str} </symbol>`;
    default:
      return `<identifier> ${str} </identifier>`;
  }
}

//=====program struct=====//

async function compileClass(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "class>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "class"
  compileSyntax += await process(tokenizedFile[tokenCount]); // className
  compileSyntax += await process(tokenizedFile[tokenCount]); // "{"
  while (
    tokenizedFile[tokenCount] === "static" ||
    tokenizedFile[tokenCount] === "field"
  ) {
    compileSyntax += await compileClassVarDec(tokenizedFile);
  }
  while (
    tokenizedFile[tokenCount] === "constructor" ||
    tokenizedFile[tokenCount] === "function" ||
    tokenizedFile[tokenCount] === "method"
  ) {
    compileSyntax += await compileSubroutine(tokenizedFile);
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // "}"
  compileSyntax += "</class";
  return compileSyntax;
}

async function compileClassVarDec(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<classVarDec>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // (static || field)
  compileSyntax += await process(tokenizedFile[tokenCount]); // type
  compileSyntax += await process(tokenizedFile[tokenCount]); // varName
  while (tokenizedFile[tokenCount] == ",") {
    compileSyntax += await process(tokenizedFile[tokenCount]); //","
    compileSyntax += await process(tokenizedFile[tokenCount]); // varName
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // ";"
  compileSyntax += "</classVarDec>";
  return compileSyntax;
}

async function compileSubroutine(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<subroutineDec>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // (constructor || function|| method)
  compileSyntax += await process(tokenizedFile[tokenCount]); // (void || type)
  compileSyntax += await process(tokenizedFile[tokenCount]); // subroutineName
  compileSyntax += await process(tokenizedFile[tokenCount]); // "("
  compileSyntax += await compileParameterList(tokenizedFile); // parameterList
  compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
  compileSyntax += await compileSubroutineBody(tokenizedFile); // SubroutineBody
  compileSyntax += "</subroutineDec>";
  return compileSyntax;
}

async function compileParameterList(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<parameterList>";
  if (tokenizedFile[tokenCount] != ")") {
    compileSyntax += await process(tokenizedFile[tokenCount]); // type
    compileSyntax += await process(tokenizedFile[tokenCount]); // varName
    while (tokenizedFile[tokenCount] == ",") {
      compileSyntax += await process(tokenizedFile[tokenCount]); //","
      compileSyntax += await process(tokenizedFile[tokenCount]); // type
      compileSyntax += await process(tokenizedFile[tokenCount]); // varName
    }
  }
  compileSyntax += "</parameterList>";
  return compileSyntax;
}

async function compileSubroutineBody(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<subroutineBody>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "{"
  while (tokenizedFile[tokenCount] == "var") {
    compileSyntax += await compileVarDec(tokenizedFile); // varDec
  }
  compileSyntax += await compileStatements(tokenizedFile); // statements
  compileSyntax += await process(tokenizedFile[tokenCount]); // "}"
  compileSyntax += "</subroutineBody>";
  return compileSyntax;
}

async function compileVarDec(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<varDec>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "var"
  compileSyntax += await process(tokenizedFile[tokenCount]); // type
  compileSyntax += await process(tokenizedFile[tokenCount]); // varName
  while (tokenizedFile[tokenCount] == ",") {
    compileSyntax += await process(tokenizedFile[tokenCount]); //","
    compileSyntax += await process(tokenizedFile[tokenCount]); // varName
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // ";"
  compileSyntax += "</varDec>";
  return compileSyntax;
}

//=====statement=====//

async function compileStatements(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<statements>";
  while (
    tokenizedFile[tokenCount] == "let" ||
    tokenizedFile[tokenCount] == "if" ||
    tokenizedFile[tokenCount] == "while" ||
    tokenizedFile[tokenCount] == "do" ||
    tokenizedFile[tokenCount] == "return"
  ) {
    switch (tokenizedFile[tokenCount]) {
      case "let":
        compileSyntax += await compileLet(tokenizedFile);
        break;
      case "if":
        compileSyntax += await compileIf(tokenizedFile);
        break;
      case "while":
        compileSyntax += await compileWhile(tokenizedFile);
        break;
      case "do":
        compileSyntax += await compileDo(tokenizedFile);
        break;
      case "return":
        compileSyntax += await compileReturn(tokenizedFile);
        break;
      default:
        break;
    }
  }

  compileSyntax += "</statements>";
  return compileSyntax;
}

async function compileLet(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<letStatement>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "let"
  compileSyntax += await process(tokenizedFile[tokenCount]); // varName
  if (tokenizedFile[tokenCount] == "[") {
    compileSyntax += await process(tokenizedFile[tokenCount]); //"["
    compileSyntax += await compileExpression(tokenizedFile); // expression
    compileSyntax += await process(tokenizedFile[tokenCount]); //"]"
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // "="
  compileSyntax += await compileExpression(tokenizedFile); // expression
  compileSyntax += await process(tokenizedFile[tokenCount]); // ";"
  compileSyntax += "</letStatement>";
  return compileSyntax;
}

async function compileIf(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<ifStatement>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "if"
  compileSyntax += await process(tokenizedFile[tokenCount]); // "("
  compileSyntax += await compileExpression(tokenizedFile); // expression
  compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
  compileSyntax += await process(tokenizedFile[tokenCount]); // "{"
  compileSyntax += await compileStatements(tokenizedFile); // statements
  compileSyntax += await process(tokenizedFile[tokenCount]); // "}"
  if (tokenizedFile[tokenCount] == "else") {
    compileSyntax += await process(tokenizedFile[tokenCount]); // "else"
    compileSyntax += await process(tokenizedFile[tokenCount]); //"{"
    compileSyntax += await compileStatements(tokenizedFile); // statements
    compileSyntax += await process(tokenizedFile[tokenCount]); //"}"
  }
  compileSyntax += "</ifStatement>";
  return compileSyntax;
}

async function compileWhile(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<whileStatement>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "while"
  compileSyntax += await process(tokenizedFile[tokenCount]); // "("
  compileSyntax += await compileExpression(tokenizedFile); // expression
  compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
  compileSyntax += await process(tokenizedFile[tokenCount]); // "{"
  compileSyntax += await compileStatements(tokenizedFile); // statements
  compileSyntax += await process(tokenizedFile[tokenCount]); // "}"
  compileSyntax += "</whileStatement>";
  return compileSyntax;
}

async function compileDo(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<doStatement>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "do"
  if (tokenizedFile[tokenCount + 1] == "(") {
    compileSyntax += await process(tokenizedFile[tokenCount]); // "subroutineName"
    compileSyntax += await process(tokenizedFile[tokenCount]); // "("
    compileSyntax += await compileExpressionList(tokenizedFile); // expressionList
    compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
  } else {
    compileSyntax += await process(tokenizedFile[tokenCount]); // "(varName || className)"
    compileSyntax += await process(tokenizedFile[tokenCount]); // "."
    compileSyntax += await process(tokenizedFile[tokenCount]); // "subroutineName"
    compileSyntax += await process(tokenizedFile[tokenCount]); // "("
    compileSyntax += await compileExpressionList(tokenizedFile); // expressionList
    compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // ";"
  compileSyntax += "</doStatement>";
  return compileSyntax;
}

async function compileReturn(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<returnStatement>";
  compileSyntax += await process(tokenizedFile[tokenCount]); // "return"
  if (tokenizedFile[tokenCount] != ";") {
    compileSyntax += await compileExpression(tokenizedFile); // expression
  }
  compileSyntax += await process(tokenizedFile[tokenCount]); // ";"
  compileSyntax += "</returnStatement>";
  return compileSyntax;
}

//=====Expression=====//

async function compileTerm(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<term>";
  switch (tokenizedFile[tokenCount]) {
    case INT_CONST:
    case "true":
    case "false":
    case "null":
    case "this":
      compileSyntax += await process(tokenizedFile[tokenCount]);
      break;
    case "-":
    case "~":
      compileSyntax += await process(tokenizedFile[tokenCount]); // unaryOp
      compileSyntax += await compileTerm(tokenizedFile); // term
      break;
    case "(":
      compileSyntax += await process(tokenizedFile[tokenCount]); // "("
      compileSyntax += await compileExpression(tokenizedFile); // expression
      compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
      break;
    default:
      if (tokenizedFile[tokenCount].startsWith('"')) {
        compileSyntax += await process(tokenizedFile[tokenCount]);
      } else if (tokenizedFile[tokenCount + 1] == "[") {
        compileSyntax += await process(tokenizedFile[tokenCount]); // varName
        compileSyntax += await process(tokenizedFile[tokenCount]); // "["
        compileSyntax += await compileExpression(tokenizedFile); // expression
        compileSyntax += await process(tokenizedFile[tokenCount]); // "]"
      } else if (tokenizedFile[tokenCount + 1] == "(") {
        compileSyntax += await process(tokenizedFile[tokenCount]); // "subroutineName"
        compileSyntax += await process(tokenizedFile[tokenCount]); // "("
        compileSyntax += await compileExpressionList(tokenizedFile); // expressionList
        compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
      } else if (tokenizedFile[tokenCount + 1] == ".") {
        compileSyntax += await process(tokenizedFile[tokenCount]); // "(varName || className)"
        compileSyntax += await process(tokenizedFile[tokenCount]); // "."
        compileSyntax += await process(tokenizedFile[tokenCount]); // "subroutineName"
        compileSyntax += await process(tokenizedFile[tokenCount]); // "("
        compileSyntax += await compileExpressionList(tokenizedFile); // expressionList
        compileSyntax += await process(tokenizedFile[tokenCount]); // ")"
      } else {
        compileSyntax += await process(tokenizedFile[tokenCount]); // varName
      }
  }
  compileSyntax += "</term>";
  return compileSyntax;
}

async function compileExpression(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<expression>";
  compileSyntax += await compileTerm(tokenizedFile); // term
  while (
    tokenizedFile[tokenCount] == "+" ||
    tokenizedFile[tokenCount] == "-" ||
    tokenizedFile[tokenCount] == "*" ||
    tokenizedFile[tokenCount] == "/" ||
    tokenizedFile[tokenCount] == "&" ||
    tokenizedFile[tokenCount] == "|" ||
    tokenizedFile[tokenCount] == "<" ||
    tokenizedFile[tokenCount] == ">" ||
    tokenizedFile[tokenCount] == "="
  ) {
    compileSyntax += await process(tokenizedFile[tokenCount]); //op
    compileSyntax += await compileTerm(tokenizedFile); // term
  }
  compileSyntax += "</expression>";
  return compileSyntax;
}

async function compileExpressionList(tokenizedFile) {
  let compileSyntax = "";
  compileSyntax += "<expressionList>";
  while (tokenizedFile[tokenCount] != ")") {
    compileSyntax += await compileExpression(tokenizedFile); // expression
    while (tokenizedFile[tokenCount] == ",") {
      compileSyntax += await process(tokenizedFile[tokenCount]); // ","
      compileSyntax += await compileExpression(tokenizedFile); // expression
    }
  }
  compileSyntax += "</expressionList>";
  return compileSyntax;
}

module.exports = CompilationEngine;
