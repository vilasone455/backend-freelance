import { ViewStat } from "../interfaces/ViewStat"
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from "../interfaces/dataStoredInToken";
import { User } from "../entity/User";
import { getRepository } from "typeorm";

export const AuthTokenViewStat = async (auth : string , user : User) => {
    let viewStat : ViewStat = (auth) ? ViewStat.ViewSelf : ViewStat.ViewOther
    if(viewStat === ViewStat.ViewOther) return viewStat
    try {
      const verificationResponse = jwt.verify(auth, process.env.SECRET_KEY) as DataStoredInToken;
      const userRes = getRepository(User)
      const userSender = await userRes.findOne(verificationResponse._id)
      if(verificationResponse._id ===  user.id){
        viewStat = ViewStat.ViewSelf
      }else{
        if(userSender.userType === 1) viewStat = ViewStat.ViewUser
        if(userSender.userType === 2) viewStat = ViewStat.ViewFreelance
    }
    return viewStat
    } catch (error) {
      throw new Error("Invaild Token");
      
    }    
    
}