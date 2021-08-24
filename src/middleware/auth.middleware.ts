import { NextFunction, Response , Request} from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import {User} from '../entity/User';
import { getRepository } from 'typeorm';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import HttpException from '../exceptions/HttpException';
import BanException from '../exceptions/BanExpection';


export interface DataWithError<T> {
  data : T
  error : HttpException
}

export const jwtToUser = async (rq : Request) : Promise<DataWithError<User>> => {

  const auth = rq.headers["authorization"]
  if (auth) {
    const secret = process.env.SECRET_KEY;
    const userRepository = getRepository(User)
    try {

      const verificationResponse = jwt.verify(auth, secret) as DataStoredInToken;
      const userTokenId = verificationResponse._id;
      const user = await userRepository.findOne({where : {id : userTokenId } , relations : ["profile"]} );
      return {data : user , error : null}
        
      } catch (error) {
        console.log(error)
        return {error : new WrongAuthenticationTokenException() , data : null}
      }
    }else {
      return {error : new WrongAuthenticationTokenException() , data : null}
    }
}

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction ) {
 // console.log("cookie : "+request.cookies["authorization"])
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
          next(new BanException())
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
