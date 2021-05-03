import { RequestHandler } from 'express';
declare function validationMiddleware<T>(type: any, skipMissingProperties?: boolean): RequestHandler;
export default validationMiddleware;
