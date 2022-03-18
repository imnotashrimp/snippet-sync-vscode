const axios = require('axios');
import {AxiosHttpResponse, AllHttpResults, HttpSuccessResult, HttpFailResult, HttpErrorResult} from './types';

/**
 * @function downloadSnippets
 * @param localSnippetsDir {string} Path to the local snippets directory
 * @param fileUrls {string[]} List of URLs of snippet JSON files to download
 */
export const downloadSnippets = async (localSnippetsDir: string, fileUrls: string[]): Promise<AllHttpResults> => {
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
      case 'success':
        results.successes.push(response);
        break;
      default: // 'fail'
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
const fetchFile = async (url: string): Promise<HttpSuccessResult|HttpFailResult|HttpErrorResult> => {
  console.log(`fetchFile() called for ${url}`);

  try {
    const response: AxiosHttpResponse = await axios.get(url);
    console.log(`Response received for ${url}:`, {response});

    if (!response?.data) {
      return { status: 'fail', reason: 'no_data_in_response', url };
    }

    if (typeof response.data !== 'object') {
      return { status: 'fail', reason: 'data_type_not_object', url };
    }

    return { status: 'success', data: response.data, url };
  } catch (error) {
    return { status: 'fail', reason: 'error', error, url };
  }
};
