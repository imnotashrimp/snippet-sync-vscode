import { HttpSuccessResult } from "./types";
const fs = require('fs');
const path = require('path');

export function writeSnippetFiles(snippetsDir: string, snippetsToWrite: HttpSuccessResult[]): void {
  for (const file of snippetsToWrite) {
    const snippetFilename = file.targetSnippetFilename;
    const snippetFilePath = path.resolve(snippetsDir, snippetFilename);
    console.log(`Writing snippet file to ${snippetFilePath}`);
    fs.writeFileSync(snippetFilePath, JSON.stringify(file.data, null, 2));
  }
}