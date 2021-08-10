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
import NoficationService from '../service/nofication-service';
import { NoficationType } from '../util/nofication-until';
import { CreatePaymentDto } from '../dto/CreatePayment.dto';

interface PermissionResponse{
  err : BadPermissionExpections,
  order : Order
}

class PaymentController implements Controller {
  public path = '/payment';
  public router = Router();

  private paymentRespotity = getRepository(Payment);
  private orderRespotity = getRepository(Order);
  private nofiService = new NoficationService()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllPayment);
    this.router.get(`${this.path}/accept/:id` , authMiddleware ,  this.acceptPayment);
    this.router.get(`${this.path}/reject/:id` , authMiddleware, this.acceptPayment);
    this.router.post(`${this.path}` , authMiddleware , this.addPayment);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updatePayment);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deletePayment);
  }

  private async isFreelancePermission(payment : Payment , user : User)  {
    const order = await this.orderRespotity.findOne({where:{id:payment.order.id} , relations : ["proposal" , "proposal.freelance"]})
    
    if(user.userType !== UserType.Freelance) return new BadPermissionExpections()

    if(!order) return new BadPermissionExpections()

    if(order.proposal.freelance.id != user.id){
        return new BadPermissionExpections()
    }

    return null
  }

  private async isHavePermission(payment : CreatePaymentDto , user : User) : Promise<PermissionResponse> {
    const order = await this.orderRespotity.findOne({where:{id:payment.order} , relations : ["proposal" , "proposal.user" , "freelance"]})
    
    if(user.userType !== UserType.User) return {err : new BadPermissionExpections() , order : null}

    if(!order) return {err : new BadPermissionExpections() , order : null}

    if(order.proposal.user.id != user.id){
      return {err : new BadPermissionExpections() , order : null}
    }

    return {err : null , order : order}
  }

  private acceptPayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    let id = request.params.id
    const user =request.user
    const payment = await this.paymentRespotity.findOne({where : {id : id} , relations : ["order"]})

    const err = await this.isFreelancePermission(payment , user)
    if(err !== null) return next(err)

    try {
      const rs = await this.paymentRespotity 
      .createQueryBuilder()
      .update(Payment)
      .set({     isPayment : true })
      .where("id = :id", { id: id })
      .execute();
      response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private rejectPayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    let id = request.params.id
    const payment = await this.paymentRespotity.findOne({where : {id : id} , relations : ["order"]})
    

    const err = await this.isFreelancePermission(payment , user)
    if(err !== null) return next(err)

    try {
        const rs = await this.paymentRespotity.delete(request.params.id)
        response.send(rs)
    } catch (error) {
        response.status(400).send("Bad Request")
    }
    
  }

  private addPayment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user =request.user
    const payment : CreatePaymentDto = request.body

    const permission = await this.isHavePermission(payment , user)
    if(permission.err !== null) return next(permission.err)

    try {
        this.nofiService.addNofication(NoficationType.UserSendPayment , permission.order.id , user.id , 
        permission.order.proposal.freelance.id )
        const rs = await this.paymentRespotity.save(payment as any)
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
    let payment : CreatePaymentDto = request.body
    console.log(request.params.id)
    if(Number(request.params.id) !== payment.id){
      return next(new BadPermissionExpections())
    }
    const permission = await this.isHavePermission(payment , user)
    if(permission.err !== null) return next(permission.err)

    try {
        const rs = await this.paymentRespotity.save(payment as any)
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