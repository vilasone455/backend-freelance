import HttpException from './HttpException';
declare class PostNotFoundException extends HttpException {
    constructor(id: string);
}
export default PostNotFoundException;
