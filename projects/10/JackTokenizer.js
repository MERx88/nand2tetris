async function JackTokenizer(readLine) {
  const tokenizedArray = [];

  for await (const line of readLine) {
    let tokenizedLine = eraseAnnotationSpace(line);
    if (tokenizedLine) {
      // 문자열 리터럴을 제외한 나머지 텍스트에서 토큰을 찾음
      let indexOffset = 0;
      tokenizedLine
        .match(/"[^"]*"|[\[\]().,;\s-~]|[^"\[\]().,;\s-~]+/g)
        .forEach((token) => {
          if (token.startsWith('"')) {
            // 문자열 리터럴 직접 추가
            tokenizedArray.push(token);
          } else if (token.startsWith("-") || token.startsWith("~")) {
            tokenizedArray.push(token.charAt(0));
            const remainingString = token.slice(1);
            if (remainingString) {
              tokenizedArray.push(remainingString);
            }
          } else {
            // 공백, 쉼표, 기타 기호 등을 포함한 나머지 텍스트에서 토큰 추가
            const otherTokens = token
              .split(/(?=[\[\]().,;\s-~])|(?<=[\[\]().,;\s-~])/g)
              .filter(
                (token) =>
                  token.trim() && token.trim() !== "-" && token.trim() !== "~"
              );

            otherTokens.forEach((token) => {
              if (token.trim()) {
                tokenizedArray.push(token.trim());
              }
            });
          }
        });
    }
  }

  console.log(tokenizedArray);
  return tokenizedArray;
}

function eraseAnnotationSpace(line) {
  const trimmedLine = line.split("//")[0].trim();
  if (
    trimmedLine === "" ||
    trimmedLine.startsWith("/*") ||
    trimmedLine.startsWith("*")
  ) {
    return null;
  }
  return trimmedLine;
}

module.exports = JackTokenizer;
