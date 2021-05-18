import HttpException from './HttpException';

class BadRequestExpection extends HttpException {
  constructor() {
    super(400, `Bad Request`);
  }
}

export default BadRequestExpection;