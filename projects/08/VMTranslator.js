const Parser = require("./Parser.js");
const CodeWriter = require("./CodeWriter.js");

const fs = require("fs");
const readline = require("readline");
const path = require("path");

const folderPath = process.argv[2];

const splitFolderPath = folderPath.split("/");
const inputFolderName = splitFolderPath[splitFolderPath.length - 1];
const combinedVmFile = inputFolderName + ".vm";
const combinedVmFilePath = path.join(folderPath, combinedVmFile);

// SimpleAdd

fs.readdir(folderPath, (err, files) => {
  if (err) {
    return console.error("Error reading directory:", err);
  }
  const vmFiles = files.filter((file) => path.extname(file) === ".vm");
  let combinedData = "";

  vmFiles.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileData = fs.readFileSync(filePath, "utf8");
    combinedData += fileData + "\n";
  });

  fs.writeFileSync(combinedVmFilePath, combinedData);
  console.log(`Combined .vm file created at: ${combinedVmFilePath}`);
});

const rl = readline.createInterface({
  input: fs.createReadStream(combinedVmFilePath),
  crlfDelay: Infinity,
  // console: false,
});
// const fileStream = fs.createReadStream(process.argv[2]);
// const splitPath = process.argv[2].split("/");
// const inputFileName = splitPath[splitPath.length - 1].split(".");
const outputFileName = inputFolderName + ".asm";
const writeStream = fs.createWriteStream(outputFileName);

// const rl = readline.createInterface({
//   input: fileStream,
//   crlfDelay: Infinity,
// });

// console.log(rl);

async function VMTranslator(rl) {
  const parsedFile = await Parser(rl);

  const file = await CodeWriter(parsedFile);

  file.forEach((line) => {
    writeStream.write(`${line}\n`);
  });

  writeStream.end();

  writeStream.on("finish", () => {
    console.log("File write completed");
  });

  writeStream.on("error", (error) => {
    console.error("An error occurred:", error);
  });
  console.log("prompt" + process.argv[0]);
}

VMTranslator(rl);
