import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import { Category } from '../entity/Category';
import { SubCategory } from '../entity/SubCategory';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Order } from '../entity/Order';
import { User } from '../entity/User';

enum OrderStat {
  onWaitClientStartAccept = 1,
  onWaitFreelanceStartAccept = 2,
  onStart = 2,
  onWaitFinishAccept = 3,
  onFinish = 4,
  onCancle = 5
}

class OrderController implements Controller {
  public path = '/order';
  public router = Router();

  private orderRespotity = getRepository(Order);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllOrder);
    this.router.get(`${this.path}/changestatus/:id/:status` ,  this.changeOrderStatus);
    this.router.get(`${this.path}/:id` ,  this.getOrderByUser);
    this.router.post(`${this.path}` ,  this.sendOrder);
  }

  private getOrderByUser = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id
    const rs = await this.orderRespotity.find({where : {user : {id : Number(id)}} , relations : ["user"]})
    response.send(rs)
    }

  private getAllOrder = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.orderRespotity.find({ relations: ["proposal" ] })
      response.send(rs)
  }

  private sendOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    if(user.userType !== 2) next(new BadPermissionExpections())
    const order : Order = request.body
    const rs = await this.orderRespotity.save(order)
    response.send(rs)
  } 

  //user top cannot change status order which belong to user mon 

  private changeOrderStatus = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const status  = request.params.status
    const orderId = request.params.id

    if(user.userType !== 1) next(new BadPermissionExpections())

    const order = await this.orderRespotity.findOne({proposal : {freelance : {id : user.id}} , id : Number(orderId) })
    if(order){
      order.orderStatus = Number(status)
      const rs = await this.orderRespotity.save(order)
      response.send(rs)
    }else{
      response.status(404).send("Order not found")
    }
  
    
  } 



}

export default OrderController;