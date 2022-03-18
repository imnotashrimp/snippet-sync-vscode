const axios = require('axios');
import {AxiosHttpResponse, HttpSuccessResult, HttpFailResult, HttpErrorResult} from './types';

/**
 * @function downloadSnippets
 * @param localSnippetsDir {string} Path to the local snippets directory
 * @param fileUrls {string[]} List of URLs of snippet JSON files to download
 */
export const downloadSnippets = async (localSnippetsDir: string, fileUrls: string[]): Promise<void> => {
  console.log('downloadSnippets() called', { fileUrls, localSnippetsDir });
  let allStatuses: Array<HttpSuccessResult|HttpFailResult|HttpErrorResult> = [];
  let successStatuses: Array<HttpSuccessResult|HttpFailResult|HttpErrorResult> = [];

  // Using `for` instead of fileUrls.forEach() because `for` blocks execution
  // until the loops are finished
  for (const fileUrl of fileUrls) {
    const response = await fetchFile(fileUrl);
    allStatuses.push(response);
    if (response.status === 'success') {
      successStatuses.push(response);
    }
  }
  console.log('Statuses for retrieved files:', {allStatuses, successStatuses});
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
