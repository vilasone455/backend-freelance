import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import {User} from '../entity/User';
import { getRepository } from 'typeorm';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';


async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction ) {

  const auth = request.headers["authorization"]
  if (auth) {
    const secret = process.env.SECRET_KEY;
    const userRepository = getRepository(User)
    try {

      const verificationResponse = jwt.verify(auth, secret) as DataStoredInToken;
      const userTokenId = verificationResponse._id;
      const user = await userRepository.findOne({id:userTokenId});
      
      if (user) {
        if(user.isBan){
          console.log("ban")
          next(new BadPermissionExpections())
        }else{
          request.user = user;
          next();
        }
        
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;
