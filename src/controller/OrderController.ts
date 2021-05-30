import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';

import { Order } from '../entity/Order';

import { OrderStat } from '../interfaces/OrderStat';
import authMiddleware from '../middleware/auth.middleware';
import { Proposal } from '../entity/Proposal';



class OrderController implements Controller {
  public path = '/order';
  public router = Router();

  private orderRespotity = getRepository(Order);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}s` ,  this.getAllOrder);
   
    this.router.get(`${this.path}` , authMiddleware ,  this.getOrderByUser);
    this.router.get(`${this.path}/sendfinish/:orderid` , authMiddleware ,  this.sendFinish);
    this.router.get(`${this.path}/canclefinish/:orderid` , authMiddleware,  this.declineFinish);
    this.router.get(`${this.path}/finish/:orderid` , authMiddleware, this.acceptFinishOrder);
  }

  private getOrderByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id 
    const rs = await this.orderRespotity.createQueryBuilder("o")
    .innerJoinAndSelect("o.proposal", "proposal")
    .innerJoinAndSelect("proposal.user", "user")
    .innerJoinAndSelect("proposal.freelance", "freelance")
    .innerJoinAndSelect("o.review" , "review")
    .where("proposal.userId = :id or proposal.freelanceId= :id", { id })
    .getMany()

    response.send(rs)
  }

  private getAllOrder = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.orderRespotity.find({ relations: ["proposal" , "proposal.user" , "proposal.freelance" ] })
      response.send(rs)
  }


  private acceptFinishOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({where : {id:orderId},relations:["proposal" , "proposal.user"]})
    if(order){
      const isUser = order.proposal.user.id === user.id
      if(isUser){
        order.orderStatus = OrderStat.Finish
        order.finishAt = new Date()
        await this.orderRespotity.save(order)
        response.send("Accept")
      }else{
        return response.status(400).send("Bad Error")
      }
    }else{
      response.status(404).send("Order Not Found")
    }
    //response.send(rs)
  } 

  //user top cannot change status order which belong to user mon 

  private sendFinish = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({where : {id:orderId},relations:["proposal" , "proposal.freelance"]})
    if(order){
      const isFreelance = order.proposal.freelance.id === user.id
      if(isFreelance){
        order.orderStatus = OrderStat.WaitForFinish
        await this.orderRespotity.save(order)
        response.send("Send Success")
      }else{
        return response.status(400).send("Bad Error")
      }
    }else{
      response.status(404).send("Order Not Found")
    }
  
  } 

  private declineFinish = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({where : {id:orderId},relations:["proposal" , "proposal.user"]})
    if(order){
      const isUser = order.proposal.user.id === user.id
      if(isUser && order.orderStatus === OrderStat.WaitForFinish){
        order.orderStatus = OrderStat.Start
        await this.orderRespotity.save(order)
        response.send("Decline Finish")
      }else{
        return response.status(400).send("Bad Error")
      }
    }else{
      response.status(404).send("Order Not Found")
    }
  
  } 

  private cancleOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({where : {id:orderId},relations:["proposal" , "proposal.freelance" , "proposal.user"]})
    if(order){
      const isUser = order.proposal.user.id === user.id
      const isFreelance = order.proposal.freelance.id === user.id
      if(isUser || isFreelance){
        order.orderStatus = OrderStat.Cancle
        await this.orderRespotity.save(order)
        response.send("Accept")
      }else{
        return response.status(400).send("Bad Error")
      }
    }else{
      response.status(404).send("Order Not Found")
    }
  
  } 



}

export default OrderController;