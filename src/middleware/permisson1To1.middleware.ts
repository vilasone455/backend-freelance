import {RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';

import { EntityTarget, getRepository } from 'typeorm';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import RequestWithEntity from 'src/interfaces/requestWithEntity.interface';

function permission1To1<T>(entity : EntityTarget<T> , entityName : string): RequestHandler {
    return async (req : RequestWithEntity<T>, res, next) => {
        const auth = req.headers["authorization"]
        const id = req.params.id
        if (auth) {
            try {
                const verificationResponse = jwt.verify(auth, process.env.SECRET_KEY) as DataStoredInToken;
                const entityRes = getRepository(entity)
                const cc = entityName
                const rs = await entityRes.findOne({where : { [cc] : {"id" : id}} , relations : [entityName] })
                
                if(rs){
                    req.data =rs
                    next()
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

export default permission1To1