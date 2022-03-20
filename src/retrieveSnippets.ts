const axios = require('axios');
import {AxiosHttpResponse, AllHttpResults, HttpSuccessResult, HttpFailResult, HttpErrorResult} from './types';
import {convertUrlToFilename, convertFilenameToUrl} from './convertFilenames';

/**
 * @function downloadSnippets
 * @param localSnippetsDir {string} Path to the local snippets directory
 * @param fileUrls {string[]} List of URLs of snippet JSON files to download
 */
export async function retrieveSnippets (localSnippetsDir: string, fileUrls: string[]): Promise<AllHttpResults> {
  console.log('downloadSnippets() called', { fileUrls, localSnippetsDir });
  let results: AllHttpResults = {
    successes: [],
    fails: []
  };

  // Using `for` instead of fileUrls.forEach() because `for` blocks execution
  // until the loops are finished
  for (const fileUrl of fileUrls) {
    const response = await fetchFile(fileUrl);

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

/**
 * @function fetchFile
 * @param url {string} URL of the file to download
 * @returns result {Promise<HttpSuccessResult|HttpFailResult|HttpErrorResult>}
 */
async function fetchFile (url: string): Promise<HttpSuccessResult|HttpFailResult|HttpErrorResult> {
  console.log(`fetchFile() called for ${url}`);
  const targetSnippetFilename = convertUrlToFilename(url);

  try {
    const response: AxiosHttpResponse = await axios.get(url);
    console.log(`Response received for ${url}:`, {response});

    if (!response?.data) {
      return { status: 'http_fetch_fail', reason: 'no_data_in_response', url };
    }

    if (typeof response.data !== 'object') {
      return { status: 'http_fetch_fail', reason: 'data_type_not_object', url };
    }

    return { status: 'http_fetch_success', data: response.data, url, targetSnippetFilename };
  } catch (error) {
    return { status: 'http_fetch_fail', reason: 'error', error, url };
  }
};
