const axios = require('axios');

import { URL } from 'url';
import {
  AxiosHttpResponse,
  AllHttpResults,
  HttpSuccessResult,
  HttpFailResult,
  HttpErrorResult
} from './types';
import { convertUrlToFilename } from './convertFilenames';
import { parseGitHubUrl, createGitHubApiRequestUrl } from './parseGitHubUrl';

/**
 * @function downloadSnippets
 * @param localSnippetsDir {string} Path to the local snippets directory
 * @param fileUrls {string[]} List of URLs of snippet JSON files to download
 */
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

    if (!response?.data) {
      return { status: 'http_fetch_fail', response, reason: 'no_data_in_response', url: gitHubFileUrl };
    }

    if (typeof response.data !== 'object') {
      return { status: 'http_fetch_fail', response, reason: 'data_type_not_object', url: gitHubFileUrl };
    }

    return { status: 'http_fetch_success', data: response.data, url: gitHubFileUrl, targetSnippetFilename };
  } catch (error) {
    return { status: 'http_fetch_fail', reason: 'error', error, url: gitHubFileUrl };
  }
}
