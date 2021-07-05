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
import { getPagination } from '../util/pagination';


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
    this.router.get(`/freelances`, this.getAllFreelance);
    this.router.get(`${this.path}all`, this.allUser);
    this.router.get(`${this.path}/jobs`, this.getAllJob);
    this.router.post(`${this.path}/ban`, authMiddleware , this.banUser);
    this.router.post(`${this.path}/unban`, authMiddleware , this.unBanUser);
    this.router.post(`${this.path}/warn`, authMiddleware , this.warnUser);
    this.router.get(`${this.path}/ban/all` , authMiddleware  ,this.getBanUser);
    this.router.get(`${this.path}/unban/all`, authMiddleware , this.getUnBanUser);
    this.router.get(`${this.path}/warn/all`, authMiddleware , this.getWarnUser);

  }

  private allUser = async (request: Request, response: Response, next: NextFunction) => {
    
    const users = await this.userRespotity.find();
    response.send(users)
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
    const take = Number(request.query["take"]) || 5
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    
    const banRes = getRepository(BanUser)
    const ban : BanUser = request.body
    const banuser = await this.userRespotity.findOne(ban.user)
    try {

      console.log(banuser)
      if(banuser){
        if(banuser.userType === 3) return next(new BadPermissionExpections())
        banuser.isBan = true
        ban.admin = user
        await banRes.save(ban)
        await this.userRespotity.save(banuser)
        const [data,count] = await banRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : 0 , take : take  })
        response.send({count : count,val : data})
      }else{
        response.status(404).send("Cant find user")
      }
      
    } catch (error) {
      console.log(error)
      response.status(400).send("Error Cant Ban")
    }
    
  }

  private unBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const take = Number(request.query["take"]) || 5
    const user = request.user
    
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const unbanRes = getRepository(UnBanUser)
    const unBanData : UnBanUser = request.body
    const banUser = await this.userRespotity.findOne(unBanData.user)
    if(banUser){
      if(banUser.userType === 3) return next(new BadPermissionExpections())
      if(banUser.isBan){
        banUser.isBan = false
        unBanData.admin = user
        try {
          const rs = await unbanRes.save(unBanData)
          await this.userRespotity.save(banUser)
          const [data,count] = await unbanRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : 0 , take : take  })
          response.send({count : count,val : data})
        } catch (error) {
          response.status(400).send("Bad Request")
        }
      }else{
        return next(new BadPermissionExpections())
      }
    }else{
      response.status(404).send("Cant Find User")
    }
  }

  private warnUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const take = Number(request.query["take"]) || 5
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const warnRes = getRepository(WarnUser)
    const warn : WarnUser = request.body
    const warnuser = await this.userRespotity.findOne(warn.user)
    try {

      if(warnuser){
        if(warnuser.userType === 3 || warnuser.isBan) return next(new BadPermissionExpections())
        warn.admin = user
        await warnRes.save(warn)
        const [data,count] = await warnRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : 0 , take : take  })
        response.send({count : count,val : data})
      }else{
        response.status(404).send("User Cannot Find")
      }
      
    } catch (error) {
      response.status(400).send("Error Cant Ban")
    }
    
  }

  private getWarnUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const warnRes = getRepository(WarnUser)
    let pag = getPagination(request)
    try {
      const [data,count] = await warnRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take})
      response.send({count : count,val : data})
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const banRes = getRepository(BanUser)
    let pag = getPagination(request)
    try {
      const [data,count] = await banRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take })

      response.send({count : count,val : data})
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getUnBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 3) return next(new BadPermissionExpections())
    const unbanRes = getRepository(UnBanUser)
    let pag = getPagination(request)
    try {
      const [data,count] = await unbanRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take })

      response.send({count : count,val : data})
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getAllFreelance = async (request: Request, response: Response, next: NextFunction) => {
    let category = request.query["category"]
    let pag = getPagination(request)
    const chainQuery = this.userRespotity
      .createQueryBuilder('u')
      .orderBy('u.id', "DESC")
      .innerJoinAndSelect("u.profile" , "profile")
      .innerJoinAndSelect("profile.address" , "address")
      .where("u.userType=2 AND u.isBan=false")

      if(category) chainQuery.andWhere("profile.categoryId= :catId" , {catId : category})

      const [data , count] = await chainQuery
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()

    response.send({count : count,val : data})
  }


  private getAllUser = async (request: Request, response: Response, next: NextFunction) => {

    let pag = getPagination(request)
    const [data , count] = await this.userRespotity
      .createQueryBuilder('user')
      .orderBy('user.id', "DESC")
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()

      response.send({count : count,val : data})
  }

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]
    
    const id = request.params.id;
    const user = await this.userRespotity.findOne({ relations: ["profile", "profile.educations" ,  "profile.address", 
    "profile.workExs", "profile.portfilios" ,  "profile.languages"] , where : {
      id : Number(id)
    } });    
    try {
      if (user) {
        if(user.userType !== 2){
          response.status(404).send({"msg" : "User Dont Found"})
          return 
        }
   
        
        const viewStat = await AuthTokenViewStat(auth , user)
        response.send({...user , viewStat : viewStat.viewStat });
      } else {
        next(new UserNotFoundException(id));
      }
    } catch (error) {
      response.status(400).send("Token Invaild")
    }
    
  }


}

export default UserController;