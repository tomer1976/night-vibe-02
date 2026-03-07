export type ApiStatus = 'SUCCESS' | 'FAIL';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'PERMISSION_DENIED'
  | 'ACCESS_DENIED'
  | 'INTERNAL_ERROR';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiSuccess<TData> = {
  status: 'SUCCESS';
  data: TData;
  request_id: string;
};

export type ApiFailure = {
  status: 'FAIL';
  error: ApiError;
  request_id: string;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;