import {RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { EntityTarget, getRepository } from 'typeorm';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import RequestWithEntity from '../interfaces/requestWithEntity.interface';
import BanException from '../exceptions/BanExpection';


function validationMiddleware<T>(entity : EntityTarget<T> , fieldName : string = "user"): RequestHandler {
    return async (req : RequestWithUser, res, next) => {
        const auth = req.headers["authorization"]
        console.log(auth)
        const id = req.params.id
        if (auth) {
            try {
                const verificationResponse = jwt.verify(auth, process.env.SECRET_KEY) as DataStoredInToken;
                const userTokenId = verificationResponse._id;
                const entityRes = getRepository(entity)
                const rs = await entityRes.findOne({where : {"user" : {"id" : userTokenId} , "id" : id } , relations : ["user"] })

                if(rs){
                    req.user = rs["user"]
                    if(req.user.isBan){
                        next(new BanException()) 
                    }else{
                        next()
                    }
                    
                }else{
                    next(new BadPermissionExpections()) 
                }
            } catch (error) {
                console.log(error)
                next(new WrongAuthenticationTokenException());
            }
        } else {
            next(new AuthenticationTokenMissingException());
        }
    };
}

export default validationMiddleware;

