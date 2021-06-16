import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Message } from '../entity/Message';
import { UserType } from '../interfaces/UserType';
import { Payment } from '../entity/Payment';
import { Order } from '../entity/Order';
import { User } from '../entity/User';
import BadRequestExpection from '../exceptions/BadRequestExpection';

class PaymentController implements Controller {
  public path = '/payment';
  public router = Router();

  private paymentRespotity = getRepository(Payment);
  private orderRespotity = getRepository(Order);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllPayment);
    this.router.post(`${this.path}` , authMiddleware , this.addPayment);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updatePayment);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deletePayment);
  }

  private async isHavePermission(payment : Payment , user : User)  {
    const order = await this.orderRespotity.findOne({where:{id:payment.order} , relations : ["proposal" , "proposal.user"]})
    
    if(user.userType !== UserType.User) return new BadPermissionExpections()

    if(!order) return new BadPermissionExpections()

    if(order.proposal.user.id != user.id){
        return new BadPermissionExpections()
    }

    return null
  }

  private addPayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const payment : Payment = request.body

    const err = await this.isHavePermission(payment , user)
    if(err !== null) return next(err)

    try {
        const rs = await this.paymentRespotity.save(payment)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllPayment = async (request: Request, response: Response, next: NextFunction) => {

      const rs = await this.paymentRespotity.find({relations:[]})
      response.send(rs)
  }

  private updatePayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    let payment : Payment = request.body
    console.log(request.params.id)
    if(Number(request.params.id) !== payment.id){
      return next(new BadPermissionExpections())
    }
    const err = await this.isHavePermission(payment , user)
    if(err !== null) return next(err)

    try {
        const rs = await this.paymentRespotity.save(payment)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }

   
  }

  private deletePayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    const deleteItem = await this.paymentRespotity.findOne({where : {id : id} , relations : ['order' , 'order.proposal' , 'order.proposal.user']})
    console.log(user)
    if(user.userType !== UserType.User) {
        console.log("user role dont wokr")
        return next(new BadPermissionExpections())
    }

    if(!deleteItem) {
        console.log("item not found")
        return next(new BadPermissionExpections())
    }

    if(deleteItem.order.proposal.user.id != user.id){
        console.log("user not equal")
        return next(new BadPermissionExpections())
    }

    
    try {
        const rs = await this.paymentRespotity.delete(id)
        response.send(rs)
    } catch (error) {
        console.log('error request')
        console.log(error)
        response.status(400).send("Bad Request")
    }
  }




}

export default PaymentController;