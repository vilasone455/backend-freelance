import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';
import * as jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository } from 'typeorm';
import DataStoredInToken from '../interfaces/dataStoredInToken';

import { AuthTokenViewStat } from './AuthTokenToViewStat';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import { BanUser } from '../entity/BanUser';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { UnBanUser } from '../entity/UnBanUser';
import { WarnUser } from '../entity/WarnUser';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/usertoken`, this.getUserByToken);
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.get(`${this.path}`, this.getAllUser);
    this.router.get(`${this.path}/jobs`, this.getAllJob);
    this.router.post(`${this.path}/ban`, authMiddleware , this.banUser);
    this.router.post(`${this.path}/unban`, authMiddleware , this.unBanUser);
    this.router.post(`${this.path}/warn`, authMiddleware , this.warnUser);
    this.router.get(`${this.path}/ban/all` , authMiddleware  ,this.getBanUser);
    this.router.get(`${this.path}/unban/all`, authMiddleware , this.getUnBanUser);
    this.router.get(`${this.path}/warn/all`, authMiddleware , this.getWarnUser);

  }

  private getAllJob = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find({ relations: ["jobPosts"] });
    response.send(users)
  }

  private getUserByToken = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]

    if(auth){
      const verificationResponse = jwt.verify(auth, process.env.SECRET_KEY) as DataStoredInToken;
      const userTokenId = verificationResponse._id;
      const user = await this.userRespotity.findOne(userTokenId);
      response.send(user)
    }else{
      response.status(400).send("require auth header")
    }
  }

  private banUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    console.log("do")
    if(user.userType !== 3) return next(new BadPermissionExpections())
    
    const banRes = getRepository(BanUser)
    const ban : BanUser = request.body
    const banuser = await this.userRespotity.findOne(ban.user)
    try {
      let rs : BanUser = null
      console.log(banuser)
      if(banuser){
        if(banuser.userType === 3) return next(new BadPermissionExpections())
        banuser.isBan = true
        ban.admin = user
        rs = await banRes.save(ban)
        const u = await this.userRespotity.save(banuser)
        console.log(u)
      }
      response.send(rs)
    } catch (error) {
      response.status(400).send("Error Cant Ban")
    }
    
  }

  private unBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    console.log("is admin")
    const unbanRes = getRepository(UnBanUser)
    const unBanData : UnBanUser = request.body
    const banUser = await this.userRespotity.findOne(unBanData.user)
    if(banUser){
      console.log("found user")
      console.log(banUser)
      if(banUser.userType === 3) return next(new BadPermissionExpections())
      if(banUser.isBan){
        console.log("is ban")
        banUser.isBan = false
        unBanData.admin = user
        try {
          const rs = await unbanRes.save(unBanData)
          await this.userRespotity.save(banUser)
          response.send(rs)
        } catch (error) {
          response.status(400).send("Bad Request")
        }
      }else{
        return next(new BadPermissionExpections())
      }
    }
  }

  private warnUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const warnRes = getRepository(WarnUser)
    const warn : WarnUser = request.body
    const warnuser = await this.userRespotity.findOne(warn.user)
    try {
      let rs : WarnUser = null
      if(warnuser){
        if(warnuser.userType === 3 || warnuser.isBan) return next(new BadPermissionExpections())
        warn.admin = user
        rs = await warnRes.save(warn)
        response.send(rs)
      }
      response.send(rs)
    } catch (error) {
      response.status(400).send("Error Cant Ban")
    }
    
  }

  private getWarnUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    console.log(user)
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const warnRes = getRepository(WarnUser)
    try {
      const rs = await warnRes.find({relations:["user" , "admin"]})
      response.send(rs)
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    console.log(user)
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const banRes = getRepository(BanUser)
   
    try {
      const rs = await banRes.find({relations:["user" , "admin"]})
      response.send(rs)
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getUnBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const unbanRes = getRepository(UnBanUser)
    try {
      const rs = await unbanRes.find({relations:["user" , "admin"]})
      response.send(rs)
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }


  private getAllUser = async (request: Request, response: Response, next: NextFunction) => {
    const skip = Number(request.query["skip"]) || 0
    const take = Number(request.query["take"]) || 5
    const users = await this.userRespotity.
    find({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.generalProfile.category"] , skip:skip,take:take });
    response.send(users)
  }

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]
    
    const id = request.params.id;
    const user = await this.userRespotity.findOne({ relations: ["profile", "profile.educations" ,  "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios" , "profile.generalProfile.category" , "profile.generalProfile.subCategory" , "profile.languages"] , where : {
      id : Number(id)
    } });    
    try {
      if (user) {
        const viewStat = await AuthTokenViewStat(auth , user)
        response.send({...user , viewStat : viewStat.viewStat});
      } else {
        next(new UserNotFoundException(id));
      }
    } catch (error) {
      response.status(400).send("Token Invaild")
    }
    
  }


}

export default UserController;