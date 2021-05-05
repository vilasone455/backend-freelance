import HttpException from './HttpException';

class BadPermissionExpections extends HttpException {
  constructor() {
    super(400, `Error you are dont have permission to do this`);
  }
}

export default BadPermissionExpections;
