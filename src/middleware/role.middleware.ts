import { RequestHandler } from "express";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { getRepository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { User } from "../entity/User";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";

import BadPermissionExpections from "../exceptions/BadPermissionExpection";
import { UserType } from "../interfaces/UserType";

function roleMiddleWare<T>(roles : UserType[] = [] , isAdd = true): RequestHandler {
    return async (req : RequestWithUser, res, next) => {
        const auth = req.headers["authorization"]
        if(isAdd && req.body.id) delete req.body.id
        if (auth) {
            const userRepository = getRepository(User)
            try {
                const verificationResponse = jwt.verify(auth, process.env.SECRET_KEY) as DataStoredInToken;
                const userTokenId = verificationResponse._id;
                const user = await userRepository.findOne({ id: userTokenId });
                if (user) {
                    req.user = user;
                    if(roles.length === 0) next()
                    console.log(user.userType)
                    console.log(roles)
                    const isVaildRole = roles.includes(user.userType)
                    if(isVaildRole){
                        next();
                    }else{
                        next(new BadPermissionExpections())
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
    };
}

export default roleMiddleWare;