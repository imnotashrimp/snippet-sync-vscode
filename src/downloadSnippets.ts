const axios = require('axios');

type AxiosHttpResponse = {
    status: string | number,
    statusText: string,
    data: any
};

type HttpResult = {
  status: 'success' | 'fail',
  data?: object,
  reason?: string,
  error?: any
};

/**
 * @function downloadSnippets
 * @param localSnippetsDir {string} Path to the local snippets directory
 * @param fileUrls {string[]} List of URLs of snippet JSON files to download
 */
export const downloadSnippets = async (localSnippetsDir: string, fileUrls: string[]): Promise<void> => {
  console.log('downloadSnippets() called', { fileUrls, localSnippetsDir });
  let statuses: object[] = [];

  for (const fileUrl of fileUrls) {
    const response = await fetchFile(fileUrl);
    statuses.push(response);
  }

  console.log('Statuses for retrieved files:', statuses);
};

const fetchFile = async (url: string): Promise<HttpResult> => {
  console.log(`fetchFile() called for ${url}`);

  try {
    const response: AxiosHttpResponse = await axios.get(url);
    console.log(`Response received for ${url}:`, {response});

    if (!response?.data) {
      return { status: 'fail', reason: 'no_data_in_response' };
    }

    if (typeof response.data !== 'object') {
      return { status: 'fail', reason: 'data_not_object' };
    }

    return { status: 'success', data: response.data };
  } catch (error) {
    return { status: 'fail', reason: 'error', error };
  }
};
