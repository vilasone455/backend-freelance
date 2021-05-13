import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';
import {  getRepository, Repository } from 'typeorm';

import {Service} from '../entity/Service'
import authMiddleware from "../middleware/auth.middleware";
import RequestWithUser from '../interfaces/requestWithUser.interface'
import BadPermissionExpections from '../exceptions/BadPermissionExpection';

import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import { ServicePackage } from '../entity/ServicePackage';
import { ServiceFaq } from '../entity/ServiceFaq';
import { ServiceStep } from '../entity/ServiceStep';

class ServiceController implements Controller {
  public path = '/service';
  public router = Router();

  private serviceRespotity = getRepository(Service);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` , this.getAllService);
    this.router.get(`${this.path}/:id` , this.getService);
    this.router.post(`${this.path}/test/:id` , authMiddleware , this.testService);
    this.router.post(`${this.path}` , authMiddleware , this.newService);
    this.router.put(`${this.path}/:id` , authMiddleware , this.updateService);
    this.router.delete(`${this.path}/:id` , authMiddleware , this.removeService);
  }

  private async isHavePermission<T>(respotity : Repository<T> , userId : number , updateId : number) {
    const rs  = await respotity.find({where:{"user" : {
      "id" : userId
    }}})
    const ishave = rs.find(r=>r["id"] === updateId)
    if(ishave === null) console.log("dont have")
    console.log(rs)
  }

  private testService = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const id = request.params.id
    await this.isHavePermission(this.serviceRespotity , user.id , Number(id))
    response.send("ss")
  }

  private getService = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id
    const services = await this.serviceRespotity.findOne({relations : ["user" , "category" , "subCategory" ,"serviceSteps" , "servicePackages" , "serviceReviews" , "serviceFaqs" , "user.profile" , 
    "user.profile.generalProfile" , "user.profile.address" ] , where : {id : Number(id)}})
    response.send(services)
  }

  private getAllService = async (request: Request, response: Response, next: NextFunction) => {
    const services = await this.serviceRespotity.find({relations : ["user" , "user.profile" , "user.profile.generalProfile"  ]})
    response.send(services)
  }

  private async saveService(service : Service) {
    const servicePackageRes = getRepository(ServicePackage)
    const serviceFaqRes = getRepository(ServiceFaq)
    const serviceStepRes = getRepository(ServiceStep)

    const packages = await servicePackageRes.save(service.servicePackages)
    const faq = await serviceFaqRes.save(service.serviceFaqs)
    const steps = await serviceStepRes.save(service.serviceSteps)

    service.serviceSteps = steps
    service.serviceFaqs = faq
    service.servicePackages = packages
    const rs = await this.serviceRespotity.save(service)
    return rs
  }

  private updateService = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const service : Service = request.body
    const id = request.params.id
    const user = request.user
    if(Number(id) !== service.id){
      response.status(400).send("wrong id")
    }

    const userServices = await this.serviceRespotity.find({user : {id : user.id}})
    const isHavePermission = userServices.find(s=>s.id === service.id)
    if(isHavePermission === null) next(new BadPermissionExpections());

    const rs = await this.saveService(service)

    response.send(rs)
  }

  private newService = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const service : Service = request.body
    const user = request.user

    if(user.id !== service.user.id){
      next(new WrongAuthenticationTokenException())
    } 
    const rs = this.saveService(service)
    response.send(rs)
  }

  private removeService = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const service : Service = request.body
    const user = request.user
    if(Number(id) !== service.id) response.status(400).send("wrong id")
    
    const userServices = await this.serviceRespotity.find({user : {id : user.id}})
    const isHavePermission = userServices.find(s=>s.id === user.id)
    if(isHavePermission === null) next(new BadPermissionExpections());
    const rs = await this.serviceRespotity.delete(id)
    response.send(rs)
  }


}

export default ServiceController;