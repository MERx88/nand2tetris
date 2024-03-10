let boolCount = 0;
let returnAdderssCount = 0;

const SET_END = "(END)\n@END\n0;JMP";

const INC_SP = "@SP\nM=M+1";
const DEC_SP = "@SP\nM=M-1\nA=M";
const SET_TRUE = "@SP\nA=M\nM=-1";
const SET_FALSE = "@SP\nA=M\nM=0";

const PUSH = "@SP\nA=M\nM=D\n@SP\nM=M+1";
const POP = "@SP\nM=M-1\nA=M\nD=M";

const POP_PUSH_SEGMENT = "@R13\nM=D\n@SP\nM=M-1\nA=M\nD=M\n@R13\nA=M\nM=D";
const BOOTSTRAP = `@256\nD=A\n@SP\nM=D\n@Bootstrap$ret\nD=A\n${PUSH}\n@LCL\nD=M\n${PUSH}\n@ARG\nD=M\n${PUSH}\n@THIS\nD=M\n${PUSH}\n@THAT\nD=M\n${PUSH}\n@SP\nD=M\nD=D-1\nD=D-1\nD=D-1\nD=D-1\nD=D-1\n@ARG\nM=D\n@SP\nD=M\n@LCL\nM=D\n@Sys.init\n0;JMP\n(Bootstrap$ret)`;

async function CodeWriter(parsedFile) {
  let assemblyCodeFile = [];

  assemblyCodeFile.push(BOOTSTRAP);

  for await (let line of parsedFile) {
    if (2 > line.length) {
      if (line[0] == "return") {
        assemblyCodeFile.push(await writeReturn(line));
      } else {
        assemblyCodeFile.push(await writeArithmetic(line));
      }
    } else {
      switch (line[0]) {
        case "label":
          assemblyCodeFile.push(await writeLabel(line));
          break;
        case "goto":
          assemblyCodeFile.push(await writeGoto(line));
          break;
        case "if-goto":
          assemblyCodeFile.push(await writeIf(line));
          break;
        case "function":
          assemblyCodeFile.push(await writeFunction(line));
          break;
        case "call":
          assemblyCodeFile.push(await writeCall(line));
          break;
        default:
          assemblyCodeFile.push(await writePushPop(line));
      }
    }
    console.log(boolCount);
  }
  assemblyCodeFile.push(SET_END);

  console.log(assemblyCodeFile);
  return assemblyCodeFile;
}

async function writeArithmetic(line) {
  let TranslatedCommand;
  switch (line[0]) {
    case "add":
      TranslatedCommand = `//add\n${DEC_SP}\nD=M\n${DEC_SP}\nD=D+M\n${PUSH}\n`;
      break;
    case "sub":
      TranslatedCommand = `//sub\n${DEC_SP}\nD=M\n${DEC_SP}\nD=M-D\n${PUSH}\n`;
      break;
    case "eq":
    case "lt":
    case "gt":
      if (line[0] === "eq") {
        TranslatedCommand = `//eq\n${POP}\n${DEC_SP}\nD=D-M\n@SET_TRUE_${boolCount}\nD;JEQ\n${SET_FALSE}\n@END_EQ_${boolCount}\n0;JMP\n(SET_TRUE_${boolCount})\n${SET_TRUE}\n@END_EQ_${boolCount}\n0;JMP\n(END_EQ_${boolCount})\n${INC_SP}\n`;
      }
      if (line[0] === "lt") {
        TranslatedCommand = `//lt\n${POP}\n${DEC_SP}\nD=M-D\n@SET_TRUE_${boolCount}\nD;JLT\n${SET_FALSE}\n@END_LT_${boolCount}\n0;JMP\n(SET_TRUE_${boolCount})\n${SET_TRUE}\n@END_LT_${boolCount}\n0;JMP\n(END_LT_${boolCount})\n${INC_SP}\n`;
      }
      if (line[0] === "gt") {
        TranslatedCommand = `//gt\n${POP}\n${DEC_SP}\nD=M-D\n@SET_TRUE_${boolCount}\nD;JGT\n${SET_FALSE}\n@END_GT_${boolCount}\n0;JMP\n(SET_TRUE_${boolCount})\n${SET_TRUE}\n@END_GT_${boolCount}\n0;JMP\n(END_GT_${boolCount})\n${INC_SP}\n`;
      }
      boolCount += 1;
      break;
    case "and":
      TranslatedCommand = `//and\n${POP}\n${DEC_SP}\nD=D&M\n${PUSH}\n`;
      break;
    case "or":
      TranslatedCommand = `//or\n${POP}\n${DEC_SP}\nD=D|M\n${PUSH}\n`;
      break;
    case "neg":
      TranslatedCommand = `//neg\n@SP\nA=M-1\nM=-M\n`;
      break;
    case "not":
      TranslatedCommand = `//not\n@SP\nA=M-1\nM=!M\n`;
      break;
  }

  return TranslatedCommand;
}

async function writePushPop(line) {
  let TranslatedCommand;
  if (line[0] === "push") {
    switch (line[1]) {
      case "constant":
        TranslatedCommand = `//push\n@${line[2]}\nD=A\n${PUSH}\n`;
        break;
      case "local":
        TranslatedCommand = `//local_push\n@LCL\nD=M\n@${line[2]}\nA=D+A\nD=M\n${PUSH}\n`;
        break;
      case "argument":
        TranslatedCommand = `//argument_push\n@ARG\nD=M\n@${line[2]}\nA=D+A\nD=M\n${PUSH}\n`;
        break;
      case "this":
        TranslatedCommand = `//this_push\n@THIS\nD=M\n@${line[2]}\nA=D+A\nD=M\n${PUSH}\n`;
        break;
      case "that":
        TranslatedCommand = `//that_push\n@THAT\nD=M\n@${line[2]}\nA=D+A\nD=M\n${PUSH}\n`;
        break;
      case "temp":
        TranslatedCommand = `//temp_push\n@${
          5 + Number(line[2])
        }\nA=M\nD=A\n${PUSH}\n`;
        break;
      case "pointer":
        if (line[2] === "0") {
          TranslatedCommand = `//pointer_0_push\n@THIS\nD=M\n${PUSH}\n`;
        }
        if (line[2] === "1") {
          TranslatedCommand = `//pointer_1_push\n@THAT\nD=M\n${PUSH}\n`;
        }
        break;
      case "static":
        TranslatedCommand = `//static_push\n@STATIC_${line[2]}\nD=M\n${PUSH}\n`;
        break;
    }
  } else {
    switch (line[1]) {
      case "local":
        TranslatedCommand = `//local_pop\n@LCL\nD=M\n@${line[2]}\nD=D+A\n${POP_PUSH_SEGMENT}\n`;
        break;
      case "argument":
        TranslatedCommand = `//argument_pop\n@ARG\nD=M\n@${line[2]}\nD=D+A\n${POP_PUSH_SEGMENT}\n`;
        break;
      case "this":
        TranslatedCommand = `//this_pop\n@THIS\nD=M\n@${line[2]}\nD=D+A\n${POP_PUSH_SEGMENT}\n`;
        break;
      case "that":
        TranslatedCommand = `//that_pop\n@THAT\nD=M\n@${line[2]}\nD=D+A\n${POP_PUSH_SEGMENT}\n`;
        break;
      case "temp":
        TranslatedCommand = `//temp_pop\n${POP}\n@R${
          5 + Number(line[2])
        }\nM=D\n`;
        break;
      case "pointer":
        if (line[2] === "0") {
          TranslatedCommand = `//pointer_0_pop\n${POP}\n@THIS\nM=D\n`;
        }
        if (line[2] === "1") {
          TranslatedCommand = `//pointer_1_pop\n${POP}\n@THAT\nM=D\n`;
        }
        break;
      case "static":
        TranslatedCommand = `//static_pop\n@STATIC_${line[2]}\nD=A\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D\n`;
        break;
    }
  }
  return TranslatedCommand;
}

async function writeLabel(line) {
  let TranslatedCommand;
  return (TranslatedCommand = `//label\n(${line[1]})`);
}

async function writeGoto(line) {
  let TranslatedCommand;
  return (TranslatedCommand = `//goto\n@${line[1]}\n0;JMP\n`);
}

async function writeIf(line) {
  let TranslatedCommand;
  return (TranslatedCommand = `//if-goto\n${POP}\n@${line[1]}\nD;JNE\n`);
}

async function writeFunction(line) {
  let varNum = Number(line[2]);
  let varPush = Array.from({ length: varNum }, () => `@0\nD=A\n${PUSH}`).join(
    "\n"
  );
  let TranslatedCommand;
  TranslatedCommand = `//function\n(${line[1]})\n${varPush}\n`;
  return TranslatedCommand;
}

async function writeCall(line) {
  let ArgPositionNum = 5 + Number(line[2]);
  let ArgPosition = Array.from({ length: ArgPositionNum }, () => "D=D-1").join(
    "\n"
  );
  let TranslatedCommand;
  TranslatedCommand = `//call\n@${line[1]}$ret.${returnAdderssCount}\nD=A\n${PUSH}\n@LCL\nD=M\n${PUSH}\n@ARG\nD=M\n${PUSH}\n@THIS\nD=M\n${PUSH}\n@THAT\nD=M\n${PUSH}\n@SP\nD=M\n${ArgPosition}\n@ARG\nM=D\n@SP\nD=M\n@LCL\nM=D\n@${line[1]}\n0;JMP\n(${line[1]}$ret.${returnAdderssCount})`;
  returnAdderssCount += 1;
  return TranslatedCommand;
}

async function writeReturn(line) {
  let TranslatedCommand;
  return (TranslatedCommand = `//return\n@LCL\nD=M\n@R13\nM=D\nD=D-1\nD=D-1\nD=D-1\nD=D-1\nD=D-1\nA=D\nD=M\n@R14\nM=D\n${POP}\n@ARG\nA=M\nM=D\n@ARG\nD=M+1\n@SP\nM=D\n@R13\nD=M\nD=D-1\nA=D\nD=M\n@THAT\nM=D\n@R13\nD=M\nD=D-1\nD=D-1\nA=D\nD=M\n@THIS\nM=D\n@R13\nD=M\nD=D-1\nD=D-1\nD=D-1\nA=D\nD=M\n@ARG\nM=D\n@R13\nD=M\nD=D-1\nD=D-1\nD=D-1\nD=D-1\nA=D\nD=M\n@LCL\nM=D\n@R14\nA=M\n0;JMP\n`);
}
module.exports = CodeWriter;
