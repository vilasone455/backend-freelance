import HttpException from './HttpException';
declare class UserNotFoundException extends HttpException {
    constructor(id: string);
}
export default UserNotFoundException;
