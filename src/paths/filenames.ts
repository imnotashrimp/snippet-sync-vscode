import config from '../config';

export function convertUrlToFilename(url: string): string {
  const filename = config.filePrefix + encodeURIComponent(url) + config.fileExtension;
  console.debug('Converted URL to filename:', { url, filename });
  return filename;
}