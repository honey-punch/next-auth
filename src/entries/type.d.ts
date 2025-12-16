interface KeyFlowResponse<T> {
  code: number;
  message: string;
  result: T;
}

type AnyObject = Record<string, unknown>;
