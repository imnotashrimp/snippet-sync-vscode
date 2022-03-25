import config from '../config';
import { parseGitHubUrl } from './gitHubUrl';

export function convertUrlToFilename(url: string): string {
  const { owner, repo, path } = parseGitHubUrl(url);
  const filename = config.filePrefix + `${owner}_${repo}_${path.replace('/', '_')}` + config.fileExtension;
  console.debug('Converted URL to filename:', { url, filename });
  return filename;
}