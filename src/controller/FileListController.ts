import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';

import { UserType } from '../interfaces/UserType';

import { WorkFile } from '../entity/WorkFile';
import { Order } from '../entity/Order';
import { User } from '../entity/User';
import BadRequestExpection from '../exceptions/BadRequestExpection';

class FileListController implements Controller {
  public path = '/file';
  public router = Router();

  private fileRespotity = getRepository(WorkFile);
  private orderRespotity = getRepository(Order);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllFile);
    this.router.post(`${this.path}` , authMiddleware , this.addFile);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updateFile);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteFile);
  }

  private async isHavePermission(workFile : WorkFile , user : User)  {
    const order = await this.orderRespotity.findOne({where:{id:workFile.order} , relations : ["proposal" , "proposal.freelance"]})
    
    if(user.userType !== UserType.Freelance) return new BadPermissionExpections()

    if(!order) return new BadPermissionExpections()

    if(order.proposal.freelance.id != user.id){
        return new BadPermissionExpections()
    }

    return null
  }

  private addFile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const file : WorkFile = request.body
 
    const err = await this.isHavePermission(file , user)
    if(err !== null) return next(err)

    try {
        const rs = await this.fileRespotity.save(file)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllFile = async (request: Request, response: Response, next: NextFunction) => {
      
    const rs = await this.fileRespotity.find({relations:[]})
    response.send(rs)
  }

  private updateFile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const file : WorkFile = request.body

    if(Number(request.params.id) !== file.id){
        console.log("id not equal" + request.params.id)
      return next(new BadPermissionExpections())
    }

    const err = await this.isHavePermission(file , user)
    if(err !== null) return next(err)

    try {
        const rs = await this.fileRespotity.save(file)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
  
   
  }

  private deleteFile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    
    const deleteItem = await this.fileRespotity.findOne({where : {id : id} , relations : ['order' , 'order.proposal' , 'order.proposal.freelance']})
    console.log(user)
    if(user.userType !== UserType.Freelance) {
        console.log("user role dont wokr")
        return next(new BadPermissionExpections())
    }

    if(!deleteItem) {
        console.log("item not found")
        return next(new BadPermissionExpections())
    }

    if(deleteItem.order.proposal.freelance.id != user.id){
        console.log("user not equal")
        return next(new BadPermissionExpections())
    }

    try {
        await this.fileRespotity.delete(id)
        response.send("Delete Success")
    } catch (error) {
      response.status(400).send("Bad Request")
    }
  }


}

export default FileListController;