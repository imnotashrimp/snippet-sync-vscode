const axios = require('axios');

import { Buffer } from 'buffer';
import {
  AxiosHttpResponse,
  AllHttpResults,
  HttpSuccessResult,
  HttpFailResult,
  HttpErrorResult
} from './types';
import { convertUrlToFilename } from './convertFilenames';
import { parseGitHubUrl, createGitHubApiRequestUrl } from './parseGitHubUrl';

export async function retrieveSnippets (localSnippetsDir: string, fileUrls: string[], authToken: string|null): Promise<AllHttpResults> {
  console.log('downloadSnippets() called', { fileUrls, localSnippetsDir });
  let results: AllHttpResults = {
    successes: [],
    fails: []
  };

  // Using `for` instead of fileUrls.forEach() because `for` blocks execution
  // until the loops are finished
  for (const fileUrl of fileUrls) {
    const response = await fetchFileFromGitHub(fileUrl, authToken);

    switch (response.status) {
      case 'http_fetch_success':
        results.successes.push(response);
        break;
      default: // 'http_fetch_fail'
        results.fails.push(response);
        break;
    }
  };

  console.log('Results for retrieved files:', results);

  return results;
};

async function fetchFileFromGitHub(gitHubFileUrl: string, authToken: string|null): Promise<HttpSuccessResult|HttpFailResult|HttpErrorResult> {
  console.log(`fetchFileFromGitHub() called for ${gitHubFileUrl}`);

  const parsedGitHubUri = parseGitHubUrl(gitHubFileUrl);
  const requestUrl = createGitHubApiRequestUrl(parsedGitHubUri);
  const targetSnippetFilename = convertUrlToFilename(gitHubFileUrl);

  if (authToken) {
    console.log('Currently in auth session. Using auth token to access...');
  };
  const axiosOptions = authToken ? {headers: {'Authorization': `token ${authToken}`}} : null;

  try {
    const response: AxiosHttpResponse = await axios.get(requestUrl, axiosOptions);
    console.log(`Response received for ${gitHubFileUrl}:`, {response});

    const content = Buffer.from(response.data.content, 'base64').toString('utf8');

    return { status: 'http_fetch_success', data: response.data, content, url: gitHubFileUrl, targetSnippetFilename };
  } catch (error) {
    return { status: 'http_fetch_fail', reason: 'error', error, url: gitHubFileUrl };
  }
}
