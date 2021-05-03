import { NextFunction, Response } from 'express';
import RequestWithUser from '../interfaces/requestWithUser.interface';
declare function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction): Promise<void>;
export default authMiddleware;
