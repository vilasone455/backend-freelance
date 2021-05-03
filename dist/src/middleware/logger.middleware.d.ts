import { NextFunction, Request, Response } from 'express';
declare function loggerMiddleware(request: Request, response: Response, next: NextFunction): void;
export default loggerMiddleware;
