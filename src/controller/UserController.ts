import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';
import * as jwt from 'jsonwebtoken';
import { User, UserWithReview } from '../entity/User';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository, In } from 'typeorm';
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
import * as Formidable from 'formidable';
import { v2 } from 'cloudinary'
import { Category } from '../entity/Category';
import { randomSkill, randomSkillSet } from './Util';
import { Skill } from '../entity/Skill';
import { Portfilio } from '../entity/Portfilio';
import { ViewStat } from '../interfaces/ViewStat';
import * as bcrypt from 'bcrypt';
import userMiddleware from '../middleware/user.middleware';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/ajustprice`, this.ajustPrice);
    this.router.get(`/portfilio/:id`, this.getPortfilio);
    this.router.get(`/ajustcat`, this.ajustCategory);
    this.router.get(`/ajustuser`, this.ajustProfile);
    this.router.get(`/getbans`, this.allBan);
    this.router.get(`/usertoken`, this.getUserByToken);
    this.router.get(`${this.path}/:id`, userMiddleware , this.getUserById);
    this.router.get(`${this.path}`, userMiddleware  , this.getAllUser);
    this.router.get(`/freelances`, userMiddleware , this.getAllFreelance);
    this.router.get(`${this.path}all`, this.allUser);
    this.router.put(`${this.path}image/:id`, authMiddleware ,this.updateImage);
    this.router.post(`/skill` , this.addSkill);

    this.router.post(`/admin/addadmin`, roleMiddleWare([UserType.MainAdmin]) ,this.addAdmin);
    this.router.put(`/admin/editadmin/:id`, roleMiddleWare([UserType.MainAdmin] , false) ,this.editAdmin);
    this.router.get(`/admin/getadmin`, roleMiddleWare([UserType.MainAdmin]) ,this.getAdmins);
    this.router.get(`${this.path}/jobs`, this.getAllJob);
    
    this.router.post(`${this.path}/ban`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.banUser);
    this.router.post(`${this.path}/unban`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.unBanUser);
    this.router.post(`${this.path}/warn`, roleMiddleWare([UserType.Admin , UserType.MainAdmin]) , this.warnUser);
    this.router.get(`${this.path}/ban/all` , authMiddleware  ,this.getBanUser);
    this.router.get(`${this.path}/unban/all`, authMiddleware , this.getUnBanUser);
    this.router.get(`${this.path}/warn/all`, authMiddleware , this.getWarnUser);

  }

  private updateImage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    console.log("updaet image")
    console.log(user)
    const form = new Formidable();
    form.parse(request, async (err, fields, files) => {
        try {
          const rs = await v2.uploader.upload(files.file.path, { resource_type: "auto" })
          user.image =  rs.secure_url
          const u = await this.userRespotity.save(user)
          response.send(u)
        } catch (error) {
          response.status(400).send("Cant Upload File")
        }      
    });

  }

  private allBan = async (request: Request, response: Response, next: NextFunction) => {
    const banRes = getRepository(BanUser)
    const rs = await banRes.find({order : {id : "DESC"} , relations : ["admin" , "user"]})
    response.send(rs)
  }

  private allUser = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find();
    response.send(users)
  }

  private ajustPrice = async (request: Request, response: Response, next: NextFunction) => {
    const profileRes = getRepository(Profile)
    let ps = await profileRes.find({where:{
      endPrice : 0
    }})
    ps.forEach(p=>{
      p.endPrice = p.startPrice
    })
    const rs = await profileRes.save(ps)
    response.send(rs)
  }


  private ajustCategory = async (request: Request, response: Response, next: NextFunction) => {
    const profileRes = getRepository(Profile)
    const catRes = getRepository(Category)
    const users = await this.userRespotity.find({relations : ["profile"] , where : {userType : UserType.Freelance}})
    const process : Promise<Profile>[]  = []
    const category = await catRes.findOne({relations : ["subCategorys"] , where : {id : 2}})
    users.forEach(u => {
      let pro = u.profile
      if(pro && (!pro.category || !pro.subCategory) ){
        pro.category = category
        const random = Math.floor(Math.random()*category.subCategorys.length)
        pro.subCategory = category.subCategorys[random]
        process.push(profileRes.save(pro))
      }
      //this.userRespotity.save()
    });
    const rs = await Promise.all(process)
    response.send(rs)
  }

  private ajustSkill = async (request: Request, response: Response, next: NextFunction) => {
    const skillRes = getRepository(Skill)
    
    const users = await this.userRespotity.find({relations : ["profile" , "profile.skillSet"] , where : {userType : UserType.Freelance}})
    const process : Promise<Skill>[]  = []
    users.forEach(u => {
      let pro = u.profile
      if(pro && pro.skillSet){
        if(pro.skillSet.length === 0){
          let sk = randomSkillSet(4 , pro.id)
          console.log(sk)
          sk.forEach(s=>{
            process.push(skillRes.save(s))
          })
        }
      }
      //this.userRespotity.save()
    });
    const rs = await Promise.all(process)
    response.send(rs)
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

  private addSkill = async (request: Request, response: Response, next: NextFunction) => {
    const skillRes = getRepository(Skill)
    let skill : Skill = request.body
    try {
      const rs = await skillRes.save(skill)
      response.send(rs)
    } catch (error) {
      response.status(400).send("Error Bad Request")
    }
    
  }


  private addAdmin = async (request: Request, response: Response, next: NextFunction) => {
    let pag = getPagination(request)
    let u : User = request.body
    const hashedPassword = await bcrypt.hash(u.userPassword, 10);
    u.userPassword = hashedPassword
    u.userType = 3
    try {
      await this.userRespotity.save(u)
      const [val , count] = await this.userRespotity.findAndCount({skip : pag.skip , take : pag.take , order:{id:"DESC"}  , where : {userType : 3}})
      response.send({val , count})
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Request")
    }

  }

  private editAdmin = async (request: Request, response: Response, next: NextFunction) => {
    let u : User = request.body
    const id = request.params.id
    console.log(id)
    console.log(u)
    if(Number(id) !== u.id) return next(new BadPermissionExpections())
    const editUser = await this.userRespotity.findOne(id)
    u.userType = 3
    u.userPassword = editUser.userPassword
    const users = await this.userRespotity.save(u)
    response.send(users)
  }

  private getAdmins = async (request: Request, response: Response, next: NextFunction) => {
    let pag = getPagination(request)
    const [val , count] = await this.userRespotity.findAndCount({where : {userType : 3} ,skip : pag.skip , take : pag.take , order:{id:"DESC"}} )
    response.send({val , count})
  }

  private getAllFriend = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find({ relations: ["jobPosts"] });
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
    const pag = getPagination(request)
    const user = request.user

    const banRes = getRepository(BanUser)
    const ban : BanUser = request.body
    const banuser = await this.userRespotity.findOne(ban.user)
    try {

      if(banuser){
        if(banuser.userType === UserType.Admin && user.userType === UserType.Admin) return next(new BadPermissionExpections())
        console.log(banuser)
        console.log("pass")
        banuser.isBan = true
        ban.admin = user
        await banRes.save(ban)
        await this.userRespotity.save(banuser)
        const [data,count] = await banRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take  })
        response.send({count : count,val : data})
      }else{
        console.log("canot find user")
        response.status(404).send("Cant find user")
      }
      
    } catch (error) {
      console.log(error)
      response.status(400).send("Error Cant Ban")
    }
    
  }

  private unBanUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const pag = getPagination(request)
    const user = request.user

    const unbanRes = getRepository(UnBanUser)
    const unBanData : UnBanUser = request.body
    const banUser = await this.userRespotity.findOne(unBanData.user)
    console.log(banUser)
    if(banUser){
      if(banUser.userType === UserType.Admin && user.userType === UserType.Admin) return next(new BadPermissionExpections())
      if(banUser.isBan){
        banUser.isBan = false
        unBanData.admin = user
        try {
          const rs = await unbanRes.save(unBanData)
          await this.userRespotity.save(banUser)
          const [data,count] = await unbanRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take  })
          response.send({count : count,val : data})
        } catch (error) {
          response.status(400).send("Bad Request")
        }
      }else{
        console.log("error unban user")
        return next(new BadPermissionExpections())
      }
    }else{
      response.status(404).send("Cant Find User")
    }
  }

  private warnUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const pag = getPagination(request)
    const user = request.user

    const warnRes = getRepository(WarnUser)
    const warn : WarnUser = request.body
    const warnuser = await this.userRespotity.findOne(warn.user)
    try {

      if(warnuser){
        if((warnuser.userType === UserType.Admin && user.userType === UserType.Admin ) || warnuser.isBan) return next(new BadPermissionExpections())
        warn.admin = user
        await warnRes.save(warn)
        const [data,count] = await warnRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take  })
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
      let emply : WarnUser[] = []
      let [data,count] = [emply , 0]
      if(user.userType === 3){
        [data,count] = await warnRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take , where : {
          admin : {id : user.id}
        } })
      }else if(user.userType === 4){
        [data,count] = await warnRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take })
      }
     
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
      let emply : BanUser[] = []
      let [data,count] = [emply , 0]
      if(user.userType === 3){
        [data,count] = await banRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take , where : {
          admin : {id : user.id}
        } })
      }else if(user.userType === 4){
        [data,count] = await banRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take })
      }
      
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
      let emply : UnBanUser[] = []
      let [data,count] = [emply , 0]
      if(user.userType === 3){
        [data,count] = await unbanRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take , where : {
          admin : {id : user.id}
        } })
      }else if(user.userType === 4){
        [data,count] = await unbanRes.findAndCount({relations:["user" , "admin"] , order:{id:"DESC"} , skip : pag.skip , take : pag.take })
      }
    
      response.send({count : count,val : data})
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getPortfilio = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const portRes = getRepository(Portfilio)
    const id = request.params.id
    try {
      let viewStat = ViewStat.ViewOther
      const rs = await portRes.findOne({where : {id : id} , relations : ["profile" , "profile.user"]})
      if(rs.profile.user === user) viewStat = ViewStat.ViewSelf
      response.send({...rs , viewStat})
    } catch (error) {
      response.status(400).send("Bad Request")
    }
    
  }

  private getAllFreelance = async (request: Request, response: Response, next: NextFunction) => {
    let category = request.query["category"]
    let subCategory = request.query["subCategory"]
    let search = request.query["search"]
    let age = request.query["age"]

    let price = request.query["price"]

    let skill = request.query["skill"]

    let location = request.query["location"]

    let pag = getPagination(request)
    const chainQuery = this.userRespotity
      .createQueryBuilder('u')
      .orderBy('u.id', "DESC")
      .innerJoinAndSelect("u.profile" , "profile")
      .leftJoinAndSelect("profile.skillSet" , "skillSet")
      .leftJoinAndSelect("profile.category" , 'category')
      .leftJoinAndSelect("profile.subCategory" , 'subCategory')
      .innerJoinAndSelect("profile.address" , "address")
      .leftJoinAndSelect("u.reviews" , "reviews")
      .where("u.userType=2 AND u.isBan=false")

      if(search) chainQuery.andWhere("profile.firstName like :name " , {name : '%' + search.toString() + '%'})
      if(subCategory){
        console.log("sub cat")
        chainQuery.andWhere("profile.subCategoryId= :catId" , {catId : subCategory})
      }else if(category){
        console.log("cat")
        chainQuery.andWhere("profile.categoryId= :catId" , {catId : category})
      }

      if(price){
        let rs = price.toString().split("-")
        console.log("filter price")
        if(rs.length === 1){
          chainQuery.andWhere("profile.startPrice >= :start" , {start : rs[0] })
        }else if(rs.length === 2){
          chainQuery.andWhere("profile.endPrice >= :start AND profile.endPrice <= :end" , {start : rs[0] , end : rs[1] })
        }
      }

      if(age){
        let rs = age.toString().split("-")
        if(rs.length === 1){
          chainQuery.andWhere("profile.age >= :start" , {start : rs[0] })
        }else if(rs.length === 2){
          chainQuery.andWhere("profile.age >= :start AND profile.age <= :end" , {start : rs[0] , end : rs[1] })
        }
      }

      if(location){
        let locationLike = `'%${location.toString()}%'`
        chainQuery.andWhere("profile.location like " + locationLike)
      }


      if(skill){
        let skillset = skill.toString().split(",")
        let skillrs = "("
        skillset.forEach(s => skillrs += "'" + s + "'," )
        skillrs = skillrs.substring(0 , skillrs.length - 1)
        skillrs += ")"
        chainQuery.andWhere("skillSet.skillName IN "+skillrs )
      }


      const [data , count] = await chainQuery
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()

      const userWithReviews : UserWithReview[] = []
    
      data.forEach(d => {
        console.log(d.reviews)
        let reviewCount = d.reviews.length
        let score = d.reviews.reduce((a, b) => {
       
          let average =  (b.productScore + b.chatScore + b.serviceScore + b.priceScore ) / 4
          //console.log(average)
          let s = average <= 0 ? 0 : average
          //console.log(`cal of ${d.userEmail} : ${b.productScore} + ${b.chatScore} + ${b.serviceScore} + ${b.priceScore} / 4 = ${average}`)
          return a+ s 
        } , 0.0)
       // console.log("total score : " + score)
        let averageTotal = score / reviewCount
        averageTotal = averageTotal <= 0 ? 0 : averageTotal
        d.reviews = []
        userWithReviews.push({...d , reviewCount , averageReview : averageTotal})
        
      });


    response.send({count : count,val : userWithReviews})
  }


  private getAllUser = async (request: Request, response: Response, next: NextFunction) => {
    const userType = request.query["usertype"]
    const uname = request.query["search"]

    let pag = getPagination(request)
    const chainQuery =  this.userRespotity
      .createQueryBuilder('user')
      .orderBy('user.id', "DESC")
      .where("(user.userType != 3 OR user.userType != 4)")

    if(userType) chainQuery.andWhere("user.userType = :uType" , {uType : userType.toString()})
    if(uname) chainQuery.andWhere("user.userName like :uName" , {uName : uname.toString()})
    
    const [data , count] = await chainQuery.skip(pag.skip)
    .take(pag.take)
    .getManyAndCount()

      response.send({count : count,val : data})
  }

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]
    
    const id = request.params.id;
    const user = await this.userRespotity.findOne({ relations: ["profile", "profile.educations" ,  "profile.address", 
    "profile.workExs", "profile.portfilios" ,  "profile.skillSet" , "profile.languages"] , where : {
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