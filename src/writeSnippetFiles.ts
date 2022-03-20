import { HttpSuccessResult, AllWriteResults, WriteSuccessResult, WriteFailResult } from "./types";
const fs = require('fs');
const path = require('path');

export function writeSnippetFiles(snippetsDir: string, snippetsToWrite: HttpSuccessResult[]): AllWriteResults {
  let writeResults: AllWriteResults = {
    successes: [] as WriteSuccessResult[],
    fails: [] as WriteFailResult[]
  };

  for (const file of snippetsToWrite) {
    const snippetFilename = file.targetSnippetFilename;
    const snippetFilePath = path.resolve(snippetsDir, snippetFilename);
    console.log(`Writing snippet file to ${snippetFilePath}`);

    try {
      fs.writeFileSync(snippetFilePath, JSON.stringify(file.data, null, 2));
      writeResults.successes.push({ status: 'write_success', url: file.url });
    } catch (error) {
      writeResults.fails.push({ status: 'write_fail', url: file.url, error });
    }
  }

  return writeResults;
}