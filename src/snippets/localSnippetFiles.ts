import { prefix } from "../convertFilenames";
const path = require('path');
const fs = require('fs');

export function clearSnippetFiles(snippetsDir: string): void {
  const filesInDir: string[] = fs.readdirSync(snippetsDir)
    .filter((filename: string) => filename.startsWith(prefix));

  for (const file of filesInDir) {
    const snippetFilePath = path.resolve(snippetsDir, file);
    console.log(`Deleting snippet file ${snippetFilePath}`);
    fs.unlinkSync(snippetFilePath);
  }
}