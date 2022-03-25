import config from './config';

export function convertUrlToFilename(url: string): string {
  const filename = config.filePrefix + encodeURIComponent(url) + config.fileExtension;
  console.debug('Converted URL to filename:', { url, filename });
  return filename;
}

export function convertFilenameToUrl(filename: string): string {
  const strippedFilename = filename
    .replace(new RegExp(`^${config.filePrefix}`, 'm'), '')
    .replace(new RegExp(`${config.fileExtension}$`, 'm'), '');
  const url = decodeURIComponent(strippedFilename);
  console.debug('Converted filename to URL:', { filename, url });
  return url;
}