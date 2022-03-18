export function convertUrlToFilename(url: string): string {
  const filename = encodeURIComponent(url);
  console.debug('Converted URL to filename:', { url, filename });
  return filename;
}

export function convertFilenameToUrl(filename: string): string {
  const url = decodeURIComponent(filename);
  console.debug('Converted filename to URL:', { filename, url });
  return url;
}