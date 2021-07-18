import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { Profile } from '../entity/Profile';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Address } from '../entity/Address';
//import { GeneralProfile } from '../entity/GeneralProfile';
import { WorkEx } from '../entity/WorkEx';
import { Education } from '../entity/Education';
import { Portfilio } from '../entity/Portfilio';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import permissionMiddleWare from '../middleware/permisson1To1.middleware';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';

import RequestWithEntity from '../interfaces/requestWithEntity.interface';
import { Language } from '../entity/Language';

enum Gender {
  Male = 1,
  Female = 2
}

enum OrderStatus {
  Wait = 1,
  Start = 2,
  Finish = 3
}

class ProfileController implements Controller {
  public path = '/profile';
  public router = Router();

  private profileRespotity = getRepository(Profile);

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.get(`${this.path}`, this.getAllProject);
    this.router.put(`${this.path}/:id`, permissionMiddleWare(User, "profile"), this.updateProfileV2);
    this.router.post(`${this.path}`, authMiddleware, this.newProfile);

  }

  private updateProfileV2 = async (request: RequestWithEntity<User>, response: Response, next: NextFunction) => {

    try {
      let user = request.data
      let profile: Profile = request.body
      await this.saveProfile(user, profile)
      response.send(user)
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Request")
    }
  }

  private updateProfile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    let profile: Profile = request.body;
    const profileId = request.params.id
    const field = request.params.field
    console.log(profileId)
    //const user = await this.userRespotity.findOne({relations: ["profile" , "profile.address" , "profile.generalProfile" , "profile.workExs" , "profile.educations" , "profile.skills" , "profile.portfilios"] , where : {id : Number(userId)}})
    const user = await this.userRespotity.findOne({ profile: { id: Number(profileId) } })

    if (profile.id !== Number(profileId)) response.status(400).send("wrong id")

    if (user.id !== request.user.id) next(new BadPermissionExpections())

    try {
      console.log("do update")
      //update only want change for optimize 
      if (field === "address") {
        const addressRes = getRepository(Address)
        const newAddress = await addressRes.save(profile.address)
        profile.address = newAddress
      } else if (field === "general") {
      //  const generalRes = getRepository(GeneralProfile)
     //   const general = await generalRes.save(profile.generalProfile)
      //  profile.generalProfile = general
      } else if (field === "workexs") {
        const workExRes = getRepository(WorkEx)
        const workExs = await workExRes.save(profile.workExs)
        profile.workExs = workExs

      } else if (field === "portfilios") {
        const portfilioRes = getRepository(Portfilio)
        const portfilios = await portfilioRes.save(profile.portfilios)
        profile.portfilios = portfilios

      } else if (field === "educations") {
        const educationRes = getRepository(Education)
        const educations = await educationRes.save(profile.educations)
        profile.educations = educations
      }

      const rs = await this.profileRespotity.save(profile)

      response.status(200).send(rs)
    } catch (error) {
      response.send(error)
    }

  }

  private async saveProfile(user: User, profile: Profile) {

    try {
      const addressRes = getRepository(Address)
     // const generalRes = getRepository(GeneralProfile)
      const workExRes = getRepository(WorkEx)
      const lanRes = getRepository(Language)
      const educationRes = getRepository(Education)
      const portfilioRes = getRepository(Portfilio)

      const newAddress = await addressRes.save(profile.address)
     // const newGeneral = await generalRes.save(profile.generalProfile)
      const workExs = await workExRes.save(profile.workExs)
      const lans = await lanRes.save(profile.languages)
      const educations = await educationRes.save(profile.educations)
      const portfilios = await portfilioRes.save(profile.portfilios)

      profile.address = newAddress
     // profile.generalProfile = newGeneral
      profile.workExs = workExs
      profile.languages = lans
      profile.educations = educations
      profile.portfilios = portfilios

      const rs = await this.profileRespotity.save(profile)

      user.profile = rs
      return await this.userRespotity.save(user)

    } catch (error) {
      throw new Error(error);
    }

  }



  private newProfile = async (request: RequestWithUser, response: Response, next: NextFunction) => {

    const user = request.user
    let profile: Profile = request.body

    const addressRes = getRepository(Address)
 //   const generalRes = getRepository(GeneralProfile)
    const workExRes = getRepository(WorkEx)
    const lanRes = getRepository(Language)
    const educationRes = getRepository(Education)
    const portfilioRes = getRepository(Portfilio)

    if (user) {

      const newAddress = await addressRes.save(profile.address)
     // const newGeneral = await generalRes.save(profile.generalProfile)
      const workExs = await workExRes.save(profile.workExs)
      const lans = await lanRes.save(profile.languages)
      const educations = await educationRes.save(profile.educations)
      const portfilios = await portfilioRes.save(profile.portfilios)


      profile.address = newAddress
    //  profile.generalProfile = newGeneral
      profile.workExs = workExs
      profile.languages = lans
      profile.educations = educations
      profile.portfilios = portfilios

      const rs = await this.profileRespotity.save(profile)

      user.profile = rs
      await this.userRespotity.save(user)

      response.status(200).send(rs)
    } else {
      next(new UserNotFoundException(user.id.toString()));
    }

  }

  private getAllProject = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.profileRespotity.find()
    response.send(users)
  }

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    const findId = Number(id)
    const userQuery = this.profileRespotity.findOne({ id: findId });

    const user = await userQuery;
    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(id));
    }
  }


}

export default ProfileController;
