export const prefix = 'snippet-sync__';
const extension = '.code-snippets';

export function convertUrlToFilename(url: string): string {
  const filename = prefix + encodeURIComponent(url) + extension;
  console.debug('Converted URL to filename:', { url, filename });
  return filename;
}

export function convertFilenameToUrl(filename: string): string {
  const strippedFilename = filename
    .replace(new RegExp(`^${prefix}`, 'm'), '')
    .replace(new RegExp(`${extension}$`, 'm'), '');
  const url = decodeURIComponent(strippedFilename);
  console.debug('Converted filename to URL:', { filename, url });
  return url;
}