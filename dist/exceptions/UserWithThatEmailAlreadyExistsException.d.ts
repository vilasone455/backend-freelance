import HttpException from './HttpException';
declare class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string);
}
export default UserWithThatEmailAlreadyExistsException;
