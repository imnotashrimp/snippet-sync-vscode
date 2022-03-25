import {
  HttpSuccessResult,
  AllWriteResults,
  WriteSuccessResult,
  WriteFailResult
} from "../types";
import config from "../config";
const path = require('path');
const fs = require('fs');

export function deleteLocalSnippetFiles(snippetsDir: string): void {
  const filesInDir: string[] = fs.readdirSync(snippetsDir)
    .filter((filename: string) => filename.startsWith(config.filePrefix));

  for (const file of filesInDir) {
    const snippetFilePath = path.resolve(snippetsDir, file);
    console.log(`Deleting snippet file ${snippetFilePath}`);
    fs.unlinkSync(snippetFilePath);
  }
}

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
      fs.writeFileSync(snippetFilePath, file.content);
      writeResults.successes.push({ status: 'write_success', url: file.url, content: file.content });
      console.debug(`Successfully wrote snippet file to ${snippetFilePath}`);
    } catch (error) {
      writeResults.fails.push({ status: 'write_fail', url: file.url, error });
      console.debug(`Failed to write snippet file to ${snippetFilePath}`, error);
    }
  }

  console.debug(`Snippet file write results:`, writeResults);
  return writeResults;
}