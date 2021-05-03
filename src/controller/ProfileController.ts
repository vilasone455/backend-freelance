import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import {Profile} from '../entity/Profile';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import {  getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Address } from '../entity/Address';
import { GeneralProfile } from '../entity/GeneralProfile';
import { WorkEx } from '../entity/WorkEx';
import { Skill } from '../entity/Skill';
import { Education } from '../entity/Education';
import { Portfilio } from '../entity/Portfilio';
import { PortfilioImage } from '../entity/PortfilioImage';

class ProfileController implements Controller {
  public path = '/profile';
  public router = Router();

  private profileRespotity = getRepository(Profile);

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id` ,  this.getUserById);
    this.router.get(`${this.path}` ,  this.getAllProject);
    this.router.put(`${this.path}/:id/:field` ,  this.updateProfile);
    this.router.post(`${this.path}/:id` ,  this.newProfile);
  }


  private updateProfile  = async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.params.id
    const field = request.params.field
    const user = await this.userRespotity.findOne({relations: ["profile" , "profile.address" , "profile.generalProfile" , "profile.workExs" , "profile.educations" , "profile.skills" , "profile.portfilios"] , where : {id : Number(userId)}})
    
    let profile : Profile = request.body;
  
    if(user){
      //update only want change for optimize 
      if(field === "address"){
        const addressRes = getRepository(Address)
        const newAddress = await addressRes.save(profile.address)
        profile.address = newAddress
      }else if(field === "general"){
        const generalRes = getRepository(GeneralProfile)
        const general = await generalRes.save(profile.generalProfile)
        profile.generalProfile = general
      }else if(field === "workexs"){
        const workExRes = getRepository(WorkEx)
        const workExs = await workExRes.save(profile.workExs)
        profile.workExs = workExs
     
      }else if(field === "portfilios"){
        const portfilioRes = getRepository(Portfilio)
        const portfilios = await portfilioRes.save(profile.portfilios)
        profile.portfilios = portfilios
    
      } else if(field === "educations"){
        const educationRes = getRepository(Education)
        const educations = await educationRes.save(profile.educations)
        profile.educations = educations
      }

      const rs = await this.profileRespotity.save(profile)

      response.status(200).send(rs)

  }else {
    next(new UserNotFoundException(userId));
  }
    response.status(200).send("test")
  }

  private newProfile = async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.params.id
    const user = await this.userRespotity.findOne({id:Number(userId)})
    let profile : Profile = request.body;

    const addressRes = getRepository(Address)
    const generalRes = getRepository(GeneralProfile)
    const workExRes = getRepository(WorkEx)
    const skillRes = getRepository(Skill)
    const educationRes = getRepository(Education)

    const portfilioRes = getRepository(Portfilio)
    const portfilioImageRes = getRepository(PortfilioImage)

    if(user){
  
        const newAddress = await addressRes.save(profile.address)
        const newGeneral = await generalRes.save(profile.generalProfile)
        const workExs = await workExRes.save(profile.workExs)
        const skills = await skillRes.save(profile.skills)
        const educations = await educationRes.save(profile.educations)
        const portfilios = await portfilioRes.save(profile.portfilios)


        profile.address = newAddress
        profile.generalProfile = newGeneral
        profile.workExs = workExs
        profile.skills = skills
        profile.educations = educations
        profile.portfilios = portfilios

        const rs = await this.profileRespotity.save(profile)

        user.profile = rs
        await this.userRespotity.save(user)

        response.status(200).send(rs)
    }else {
      next(new UserNotFoundException(userId));
    }

    }

  private getAllProject = async (request: Request, response: Response, next: NextFunction) => {
      const users = await this.profileRespotity.find()
      console.log(users.length)
      response.send(users)
  }

  private getProfile = async (request: Request, response: Response, next: NextFunction) => {
    var userId = request.params.id
    //const profileResposity = getRepository()
    //var profile = 
    //response.send(users)
}

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    const findId = Number(id)
    const userQuery = this.profileRespotity.findOne({id : findId});
 
    const user = await userQuery;
    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(id));
    }
  }


}

export default ProfileController;