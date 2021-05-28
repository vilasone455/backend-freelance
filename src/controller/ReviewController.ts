import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Review } from '../entity/Review';
import { Order } from '../entity/Order';
import { OrderStat } from '../interfaces/OrderStat';
import { Proposal } from 'src/entity/Proposal';

class ReviewController implements Controller {
  public path = '/review';
  public router = Router();

  private reviewRespoity = getRepository(Review);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:freelanceid` ,  this.getReviewByUser);
    this.router.post(`${this.path}/:orderid` , authMiddleware , this.addReview);
   
  }

  private addReview = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const orderid = request.params.orderid
    const review : Review = request.body
    const user = request.user
    const orderRes = getRepository(Order)

    const order = await orderRes.findOne({relations: ["proposal" , "proposal.user" , "review"] , where : {id:orderid , orderStatus : OrderStat.Finish}})
    if(order){
        console.log(order.review)
        if(order.review !== undefined) return response.status(400).send("You already review")
            if(order.proposal.user.id === user.id){
                review.order = order
                const rs = await this.reviewRespoity.save(review)
                response.send(rs)
            }else{
                next(new BadPermissionExpections())
            }
        }else{
            response.status(404).send("Order Not found")
    }
  }
    
    
    //is that freelance have order of you and is that order finished 
  

  private getReviewByUser = async (request: Request, response: Response, next: NextFunction) => {

      const freelanceId = request.params.freelanceid
      const orderRes = getRepository(Order)
      const myOrder = await orderRes.find({
      where:{proposal:{freelance : freelanceId}},relations:['proposal' , 'proposal.freelance' , 'review']})
      response.send(myOrder)
  }

  
}

export default ReviewController;