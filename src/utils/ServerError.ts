import { IServerErrorCode } from '@/definitions';
import errors from '@/errors';

export class ServerError {
  code: number;

  status: number;

  message: string;

  constructor(code: IServerErrorCode, message: string = null) {
    const errObject = this.getErrorObject(code);

    this.code = code;
    this.status = errObject.status;
    this.message = message
      ? `${errObject.message}: '${message}'`
      : errObject.message;
  }

  static fromError(e: Error) {
    if (typeof e === typeof ServerError) {
      return e;
    }

    return new ServerError(0, e.message);
  }

  getErrorObject(code: IServerErrorCode) {
    return errors[code] || errors[0];
  }
}
