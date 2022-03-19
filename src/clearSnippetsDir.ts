const fs = require('fs');

export function clearSnippetsDir(snippetsDir: string): void {
  console.log(`Clearing snippets dir at ${snippetsDir}`);

  if (fs.existsSync(snippetsDir)) {
    fs.rmdirSync(snippetsDir, { recursive: true });
    console.log(`Deleted snippets dir`);
  }

  fs.mkdirSync(snippetsDir);
  console.log(`Created snippets dir`);
}
