import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Message } from '../entity/Message';
import { UserType } from '../interfaces/UserType';

class MessageController implements Controller {
  public path = '/message';
  public router = Router();

  private messageRespotity = getRepository(Message);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllMessage);
    this.router.post(`${this.path}` , authMiddleware , this.addMessage);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updateMessage);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteCategory);
  }

  private addMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const message : Message = request.body
    if(user.userType !== UserType.Admin){next(new BadPermissionExpections())}
    try {
        const rs = await this.messageRespotity.save(message)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllMessage = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.messageRespotity.find({ relations: ["subCategorys"] })
      response.send(rs)
  }

  private updateMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const message : Message = request.body
    if(Number(request.params.id) == message.id) next(new BadPermissionExpections())

    const isVaild = this.messageRespotity.findOne({where:{"senderId" : request.user.id , id : message.id}})
    if(!isVaild) next(new BadPermissionExpections())
    try {
        
        await this.messageRespotity.save(message)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
   
  }

  private deleteCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    
  }




}

export default MessageController;