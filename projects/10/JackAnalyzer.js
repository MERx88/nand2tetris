const JackTokenizer = require("./JackTokenizer.js");
const CompilationEngine = require("./CompilationEngine.js");

const fs = require("fs");
const readline = require("readline");

const filePath = process.argv[2];

// SimpleAdd

const fileStream = fs.createReadStream(process.argv[2]);
const splitPath = process.argv[2].split("/");
const inputFileName = splitPath[splitPath.length - 1].split(".");
const outputFileName = inputFileName[0] + ".xml";
const writeStream = fs.createWriteStream(outputFileName);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

function formatXml(xml) {
  let formatted = "";
  let indent = 0;
  const indentChar = "  ";

  xml.split(/>\s*</).forEach((element) => {
    if (element.match(/^\/\w/)) indent--;
    formatted += `${indentChar.repeat(indent)}<${element.trim()}>\n`;
    if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("!--"))
      indent++;
  });

  return formatted.trim();
}

async function JackAnalyzer(rl) {
  const tokenizedArray = await JackTokenizer(rl);

  const xml = await CompilationEngine(tokenizedArray);

  const formattedXml = formatXml(xml);

  writeStream.write(`${formattedXml}\n`);

  writeStream.end();

  writeStream.on("finish", () => {
    console.log("File write completed");
  });

  writeStream.on("error", (error) => {
    console.error("An error occurred:", error);
  });
  console.log("prompt" + process.argv[0]);
}

JackAnalyzer(rl);
