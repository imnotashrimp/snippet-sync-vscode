import { ParsedGitHubFileUri } from "../types";
import { URL } from "url";

export function parseGitHubUrl(gitHubUrl: string): ParsedGitHubFileUri {
  const url = new URL(gitHubUrl);
  const path = url.pathname.split('/');
  const owner = path[1];
  const repo = path[2];
  const pathParts = path.slice(3);
  const ref = pathParts[1];
  const pathString = pathParts.slice(2).join('/');

  const parsedUri = {
    host: url.host,
    owner,
    repo,
    ref,
    path: pathString
  };

  console.log(`${gitHubUrl} parsed to`, parsedUri);
  return parsedUri;
}

export function createGitHubApiRequestUrl(parsedUri: ParsedGitHubFileUri): string {
  const { owner, repo, path } = parsedUri;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  console.log(`Created GitHub API request URL: ${url}`);
  return url;
}