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
  status: 'success',
  data: object,
  url: string,
  targetSnippetFilename: string
};

export type HttpFailResult = {
  status: 'fail',
  reason: 'no_data_in_response' | 'data_type_not_object',
  url: string
};

export type HttpErrorResult = {
  status: 'fail',
  reason: 'error',
  error: any,
  url: string
};
