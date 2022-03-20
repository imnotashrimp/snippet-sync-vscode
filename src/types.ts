export type AxiosHttpResponse = {
  status: string | number,
  statusText: string,
  data: any
};

export type AllHttpResults = {
  successes: HttpSuccessResult[],
  fails: (HttpFailResult|HttpErrorResult)[]
};

export type HttpSuccessResult = {
  status: 'http_fetch_success',
  data: object,
  url: string,
  targetSnippetFilename: string
};

export type HttpFailResult = {
  status: 'http_fetch_fail',
  reason: 'no_data_in_response' | 'data_type_not_object',
  url: string
};

export type HttpErrorResult = {
  status: 'http_fetch_fail',
  reason: 'error',
  error: any,
  url: string
};

export type AllWriteResults = {
  successes: WriteSuccessResult[],
  fails: WriteFailResult[]
}

export type WriteSuccessResult = {
  status: 'write_success',
  url: string
};

export type WriteFailResult = {
  status: 'write_fail',
  url: string,
  error: any
};