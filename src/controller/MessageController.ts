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
    this.router.put(`${this.path}/:msg` , authMiddleware ,  this.updateMessage);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteMessage);
  }

  private addMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const message : Message = request.body
    message.sender = user
    if(user.userType !== UserType.Admin){next(new BadPermissionExpections())}
    try {
        const rs = await this.messageRespotity.save(message)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllMessage = async (request: Request, response: Response, next: NextFunction) => {
      const skip = Number(request.query["skip"]) || 0
      const take = Number(request.query["take"]) || 5
      const rs = await this.messageRespotity.find({relations:["sender" , "receiver"],skip,take})
      response.send(rs)
  }

  private updateMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    let message : Message = request.body
    if(Number(request.params.msg) == message.id){
      return next(new BadPermissionExpections())
    }
    const id = 1
    console.log("id is : " + id)
    console.log(request.params)
    const messageFind = await this.messageRespotity.findOne({relations:["sender"] , where:{"id" : id}})
    console.log(messageFind)
    if(!messageFind) {
     
      return response.send("Message DOnt Found")
    }else{
      if(messageFind.sender.id !== request.user.id){
       
        return response.send("SEnder id not equal user")
      }
    }

    message.sender = request.user
    console.log(message)
    
    try {
      console.log("tryyyyyyyyyyyyyyyyyyyyyyyyyyy")
      const rs =  await this.messageRespotity.save(message)
      console.log("pass")
      return response.send(rs)
    } catch (error) {
        console.log("why not workkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        console.log(error)
        
        return response.status(400).send("Bad Request")
    }
   
  }

  private deleteMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    try {
        await this.messageRespotity.delete(id)
        response.send("Delete Success")
    } catch (error) {
      response.status(400).send("Bad Request")
    }
  }




}

export default MessageController;