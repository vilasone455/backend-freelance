import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Review } from '../entity/Review';
import { Order } from '../entity/Order';
import { OrderStat } from '../interfaces/OrderStat';

import { ReviewResponse } from '../interfaces/ReviewResponse';
import { getPagination } from '../util/pagination';

class ReviewController implements Controller {
  public path = '/review';
  public router = Router();

  private reviewRespoity = getRepository(Review);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.allReviews);
    this.router.get(`/reviewajust`, this.ajustReview);
    this.router.get(`${this.path}/user/:freelanceid`, this.getReviewByUser);
    this.router.post(`${this.path}/:orderid`, authMiddleware, this.addReview);

  }


  private allReviews = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.reviewRespoity.find({ relations: ["freelance" , "order" , "order.proposal" , "order.proposal.freelance"] })
    response.send(rs)
  }

  private ajustReview = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.reviewRespoity.find({ relations: ["freelance" , "order" , "order.proposal" , "order.proposal.freelance"] })
    
    let process : Promise<Review>[] = []
    rs.forEach(r=>{
      if(!r.freelance){
        console.log("not null ")
        const f = r.order.proposal.freelance
        r.freelance =f
        let add =  this.reviewRespoity.save(r)
        process.push(add)
      }
    })
    const r = await Promise.all(process)
    response.send(r)
  }


  private setEmplyFreelance = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.reviewRespoity.find({ relations: ["freelance" , "order" , "order.proposal" , "order.proposal.freelance"] })
    rs.forEach(r => {
      if(r.freelance){
        r.freelance = r.order.proposal.freelance
        //await this.reviewRespoity.save(r)
      }
    });
    response.send(rs)
  }


  private addReview = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const orderid = request.params.orderid
    const review: Review = request.body
    const user = request.user
    const orderRes = getRepository(Order)

    const order = await orderRes.findOne({ relations: ["proposal", "proposal.user" , "proposal.freelance", "review"], where: { id: orderid, orderStatus: OrderStat.Finish } })
    if (order) {
      console.log(order.review)
      if (order.review) return response.status(400).send("You already review")
      if (order.proposal.user.id === user.id) {
        review.order = order
        review.freelance = order.proposal.freelance
        const rs = await this.reviewRespoity.save(review)
        response.send(rs)
      } else {
        next(new BadPermissionExpections())
      }
    } else {
      response.status(404).send("Order Not found")
    }
  }

  //is that freelance have order of you and is that order finished 

  private getReviewByUser = async (request: Request, response: Response, next: NextFunction) => {
    const pag = getPagination(request)
    const id = request.params.freelanceid
  
    console.log("get review " + id)

    const [val , count] = await this.reviewRespoity.createQueryBuilder("r")
    .leftJoinAndSelect("r.order" , "order")
    .leftJoinAndSelect("order.proposal" , "proposal")
    .leftJoinAndSelect("proposal.jobPost", "jobPost")
    .leftJoinAndSelect("proposal.user" , "user")
    .where("proposal.freelanceId = :id" , {id:id})
    .skip(pag.skip)
    .take(pag.take)
    .getManyAndCount()

      console.log("get success")
    const reviewRs: ReviewResponse[] = []
    val.forEach(r => {
      const order = r.order
      let title = (order.proposal.jobPost) ? order.proposal.jobPost.title : order.proposal.title
      let add: ReviewResponse = {
        title,
        userName : order.proposal.user.userName,
        review: r.comment,
        score: r.productScore,
        reviewAt: r.createDate
      }
      reviewRs.push(add)
    });
    
    response.send({val : reviewRs , count})
  }


}

export default ReviewController;