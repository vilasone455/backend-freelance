import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';
import * as jwt from 'jsonwebtoken';
import { User, UserWithReview } from '../entity/User';
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
import roleMiddleWare from '../middleware/role.middleware';
import { UserType } from '../interfaces/UserType';
import { Profile } from '../entity/Profile';


class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/ajustuser`, this.ajustProfile);
    this.router.get(`/usertoken`, this.getUserByToken);
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.get(`${this.path}`, this.getAllUser);
    this.router.get(`/freelances`, this.getAllFreelance);
    this.router.get(`${this.path}all`, this.allUser);
    this.router.post(`${this.path}/addadmin`, roleMiddleWare([UserType.MainAdmin]) ,this.addAdmin);
    this.router.get(`${this.path}/getadmin`, roleMiddleWare([UserType.MainAdmin]) ,this.getAdmins);
    this.router.get(`${this.path}/jobs`, this.getAllJob);
    this.router.post(`${this.path}/ban`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.banUser);
    this.router.post(`${this.path}/unban`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.unBanUser);
    this.router.post(`${this.path}/warn`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.warnUser);
    this.router.get(`${this.path}/ban/all` , authMiddleware  ,this.getBanUser);
    this.router.get(`${this.path}/unban/all`, authMiddleware , this.getUnBanUser);
    this.router.get(`${this.path}/warn/all`, authMiddleware , this.getWarnUser);

  }

  private allUser = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find();
    response.send(users)
  }

  private ajustProfile = async (request: Request, response: Response, next: NextFunction) => {
    const profileRes = getRepository(Profile)
    const users = await this.userRespotity.find({relations : ["profile"] , where : {userType : UserType.Freelance}})
    const process : Promise<Profile>[]  = []
    users.forEach(u => {
      let pro = u.profile
      if(pro && pro.aboutMe && (pro.aboutMe === "" || pro.jobType === "" || pro.skills === "")){
        pro.aboutMe = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries"
        if(pro.jobType === "") pro.jobType = "None"
        if(pro.skills === "") pro.skills = "Javascript,PHP,HTML,Nodejs"
        process.push(profileRes.save(pro))
      }
      //this.userRespotity.save()
    });
    const rs = await Promise.all(process)
    response.send(rs)
  }


  private addAdmin = async (request: Request, response: Response, next: NextFunction) => {
    let u : User = request.body
    u.userType = 3
    const users = await this.userRespotity.save(u)
    response.send(users)
  }

  private getAdmins = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find({where : {userType : UserType.Admin}})
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

    const banRes = getRepository(BanUser)
    const ban : BanUser = request.body
    const banuser = await this.userRespotity.findOne(ban.user)
    try {

      console.log(banuser)
      if(banuser){
        if(banuser.userType === UserType.Admin && user.userType === UserType.Admin) return next(new BadPermissionExpections())
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

    const unbanRes = getRepository(UnBanUser)
    const unBanData : UnBanUser = request.body
    const banUser = await this.userRespotity.findOne(unBanData.user)
    if(banUser){
      if(banUser.userType === UserType.Admin && user.userType === UserType.Admin) return next(new BadPermissionExpections())
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

    const warnRes = getRepository(WarnUser)
    const warn : WarnUser = request.body
    const warnuser = await this.userRespotity.findOne(warn.user)
    try {

      if(warnuser){
        if((warnuser.userType === UserType.Admin && user.userType === UserType.Admin ) || warnuser.isBan) return next(new BadPermissionExpections())
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
    let subCategory = request.query["subcategory"]
    let search = request.query["search"]
    let pag = getPagination(request)
    const chainQuery = this.userRespotity
      .createQueryBuilder('u')
      .orderBy('u.id', "DESC")
      .innerJoinAndSelect("u.profile" , "profile")
      .innerJoinAndSelect("profile.address" , "address")
      .leftJoinAndSelect("u.reviews" , "reviews")
      .where("u.userType=2 AND u.isBan=false")

      if(search) chainQuery.andWhere("profile.firstName like :name " , {name : '%' + search.toString() + '%'})
      if(subCategory){
        chainQuery.andWhere("j.subCategoryId= :catId" , {catId : subCategory})
      }else if(category){
        chainQuery.andWhere("j.categoryId= :catId" , {catId : category})
      }

      const [data , count] = await chainQuery
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()

      const userWithReviews : UserWithReview[] = []

      data.forEach(d => {
        let reviewCount = d.reviews.length
        let score = d.reviews.reduce((a, b) => {
          let average =  (b.productScore + b.chatScore + b.serviceScore + b.priceScore ) / 4
          //console.log(`cal of ${d.userEmail} : ${b.productScore} + ${b.chatScore} + ${b.serviceScore} + ${b.priceScore} / 4 = ${average}`)
          return average <= 0 ? 0 : average
        } , 0.0)
        let averageTotal = score / reviewCount
        averageTotal = averageTotal <= 0 ? 0 : averageTotal
        d.reviews = []
        userWithReviews.push({...d , reviewCount , averageReview : averageTotal})
        
      });


    response.send({count : count,val : userWithReviews})
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