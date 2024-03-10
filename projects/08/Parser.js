async function parser(readLine) {
  let parsedVMCommandsArr = [];

  for await (let line of readLine) {
    let VMCommandLine;
    let parsedVMCommandArr;

    VMCommandLine = await eraseAnnotationSpace(line);
    if (!VMCommandLine) {
      continue;
    }
    parsedVMCommandArr = VMCommandLine.split(" ");

    parsedVMCommandsArr.push(parsedVMCommandArr);
  }

  console.log(parsedVMCommandsArr);

  return parsedVMCommandsArr;
}

async function eraseAnnotationSpace(line) {
  let trimedLine = line.replace(/\/\/.*$/, "").trim();
  if (trimedLine === "" || trimedLine.startsWith("//")) {
    return null;
  }
  return trimedLine;
}

module.exports = parser;
