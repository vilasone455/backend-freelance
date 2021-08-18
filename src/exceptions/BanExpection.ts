import HttpException from './HttpException';

class BanException extends HttpException {
  constructor() {
    super(403, 'Your account is ban');
  }
}

export default BanException;
