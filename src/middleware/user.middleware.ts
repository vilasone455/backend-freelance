import { NextFunction, Response , Request} from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import {User} from '../entity/User';
import { getRepository } from 'typeorm';

import BanException from '../exceptions/BanExpection';

async function userMiddleware(request: RequestWithUser, response: Response, next: NextFunction ) {
    
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
            next(new BanException())
          }else{
            request.user = user;
            next();
          }
          
        } else {
          next();
        }
      } catch (error) {
        next();
      }
    } else {
      next();
    }
  }
  
  export default userMiddleware