import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../interfaces/controller.interface';
import { getRepository } from 'typeorm';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { Order } from '../entity/Order';
import { OrderStat } from '../interfaces/OrderStat';
import authMiddleware from '../middleware/auth.middleware';
import { User, UserWithHireCount } from '../entity/User';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { getPagination, paginateArray } from '../util/pagination';

import { UserType } from '../interfaces/UserType';
import NoficationService from '../service/nofication-service';
import { NoficationType } from '../util/nofication-until';
import { Review } from '../entity/Review';

class OrderController implements Controller {
  public path = '/order';
  public router = Router();

  private orderRespotity = getRepository(Order);
  private nofiService = new NoficationService()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/end/:id`, authMiddleware , this.endOrder);
    this.router.get(`${this.path}s`, this.getAllOrder);
    this.router.get(`${this.path}/user/all`, authMiddleware, this.getFreelanceByOrderV1);
    this.router.get(`${this.path}/userinfo/:id`, this.getFreelanceByOrderV2);
    this.router.get(`${this.path}`, authMiddleware, this.getOrderByUser);
    //this.router.get(`${this.path}/user/:id` , this.getFreelanceByOrder);
    this.router.get(`${this.path}`, authMiddleware, this.getOrderByUser);
    this.router.get(`${this.path}/info/:id`, authMiddleware, this.getOrderById);
    this.router.get(`${this.path}/sendfinish/:orderid`, authMiddleware, this.sendFinish);
    this.router.get(`${this.path}/canclefinish/:orderid`, authMiddleware, this.declineFinish);
    this.router.get(`${this.path}/finish/:orderid`, authMiddleware, this.acceptFinishOrder);
  }

  private getOrderByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const pag = getPagination(request , 15)
    const status = request.query["status"]
  
    
    const chainQuery  =  this.orderRespotity.createQueryBuilder("o")
      .orderBy('o.id', "DESC")
      .innerJoinAndSelect("o.proposal", "proposal")
      .leftJoinAndSelect("proposal.jobPost", "jobPost")
      .leftJoinAndSelect("o.review" , "review")
      .innerJoinAndSelect("proposal.user", "user")
      .innerJoinAndSelect("proposal.freelance", "freelance")
      .leftJoinAndSelect("o.payments", "payments")
      .where("(proposal.userId = :id OR proposal.freelanceId=:id)", { id })

    if(status) {
      console.log(status)
      console.log("have status " + Number(status).toString())
      chainQuery.andWhere("o.orderStatus = :status" , {status : Number(status).toString()})
    }

    const [val , count] = await chainQuery
    .skip(pag.skip)
    .take(pag.take)
    .getManyAndCount()
    
    response.send({val , count})
  }

  private getOrderById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = Number(request.params.id)
    const userId = request.user.id

    const chainQuery = this.orderRespotity.createQueryBuilder("o")
      .leftJoinAndSelect("o.payments", "payments")
      .leftJoinAndSelect("o.workFiles", "workFiles")
      .leftJoinAndSelect("workFiles.owner", "owner")
      .leftJoinAndSelect("o.review", "r")
      .innerJoinAndSelect("o.proposal", "proposal")
    
      if(request.user.userType === UserType.Freelance){
        chainQuery.innerJoinAndSelect("proposal.user" , "user")
      }else if(request.user.userType === UserType.User){
        chainQuery.innerJoinAndSelect("proposal.freelance" , "freelance")
      }

      const rs = await  chainQuery.where("o.id = :id AND (proposal.userId = :uId OR proposal.freelanceId = :uId)", { id: id, uId: userId })
      .getOne()

    if(rs){
      response.send(rs)
    }else{
      next(new BadPermissionExpections())
    }

    
  }
  
  private endOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    let review : Review = request.body
    let id = request.params.id
    let user = request.user
    
    const order = await this.orderRespotity.findOne({ relations : ["payments" , "proposal" , "proposal.user" , "proposal.freelance"] , 
    where : {id : Number(id)} } )
    if(!order) return response.status(404).send("Error Order Not Found")
    if(order.proposal.user.id !== user.id ) return response.status(400).send("Error This Order not own by you")
    if(order.orderStatus !== OrderStat.Start) return response.status(400).send("Only Active Order Can do this process")

    let totalPay = 0
    order.payments.forEach(p=>{
      if(p.isPayment) totalPay += p.amount
    })

    console.log("total pay : " + totalPay)
    if(totalPay < order.proposal.budget) return response.status(400).send("You must payment before end order") 

    const reviewRes = getRepository(Review)
    order.orderStatus = OrderStat.Finish
    order.finishAt = new Date()
    const rs = await this.orderRespotity.save(order)
    try {
      review.freelance = order.proposal.freelance
      review.order = rs
      await reviewRes.save(review)
      this.nofiService.addNofication(NoficationType.UserAcceptFinishRequest , order.id , user.id , order.proposal.freelance.id)
      response.send(rs)
    } catch (error) {
      response.status(400).send("Bad Request")
    }
   
    //response.send(rs)
  }

  private getAllOrder = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.orderRespotity.find({ relations: ["proposal", "proposal.user", "proposal.freelance"] , order : {id : "DESC"} } )
    response.send(rs)
  }

  private getFreelanceByOrderV1 = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    let pag = getPagination(request)
    let pageRs = Number(request.query["page"]) || 1
    
    console.log("get freelance by order ")
    const rs = await this.orderRespotity.createQueryBuilder("o")
      .innerJoinAndSelect("o.proposal", "proposal")
      .leftJoinAndSelect("proposal.jobPost", "jobPost")
      .innerJoinAndSelect("proposal.freelance", "freelance")
      .innerJoinAndSelect("freelance.profile", "profile")
      .where("proposal.userId = :id", { id })
      .getMany();

    const users: UserWithHireCount[] = []
    rs.forEach(r => {
      let indexof = users.findIndex(u => u.id === r.proposal.freelance.id)
      if (indexof === -1) {
        users.push({...r.proposal.freelance , count : 1})
      }else{
        users[indexof].count += 1 
      }
    })
    let userList = paginateArray(users , pag.take ,pageRs )
    console.log(users)
    response.send({val : userList , count : users.length})
  }

  private getFreelanceByOrderV2 = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    console.log("get freelance by order : ")
    const id = request.params.id
    console.log("user id : " + id)
    //const r = await this.orderRespotity.query("select * from order")
    const rs = await this.orderRespotity.createQueryBuilder("o")
      .innerJoin("o.proposal" , "proposal")
      
      .select([
        'sum(o.id)',
        'o.id',
        "proposal.id",
        'proposal.title',
        "proposal.freelanceId",
      ])
      .groupBy("o.id")
      .groupBy("proposal.id")
      .groupBy("proposal.freelanceId")

      .getRawMany();
    
    response.send(rs)
  }



  private acceptFinishOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.user" , "proposal.freelance" ] })
    if (order) {
      const isUser = order.proposal.user.id === user.id
      if (isUser) {
        order.orderStatus = OrderStat.Finish
        order.finishAt = new Date()
        await this.orderRespotity.save(order)
        this.nofiService.addNofication(NoficationType.UserAcceptFinishRequest , order.id , user.id , order.proposal.freelance.id)
        response.send("Accept")
      } else {
        return response.status(400).send("Bad Error")
      }
    } else {
      response.status(404).send("Order Not Found")
    }
    //response.send(rs)
  }

  //user top cannot change status order which belong to user mon 

  private sendFinish = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.freelance" , "proposal.user"] })
    if (order) {
      const isFreelance = order.proposal.freelance.id === user.id
      if (isFreelance) {

        order.orderStatus = OrderStat.WaitForFinish
       
        await this.orderRespotity.save(order)
        this.nofiService.addNofication(NoficationType.FreelanceFinishRequest , order.id , user.id , order.proposal.user.id)
        response.send("Send Success")
      } else {
        return response.status(400).send("Bad Error")
      }
    } else {
      response.status(404).send("Order Not Found")
    }

  }

  private declineFinish = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.user" , "proposal.freelance"] })
    if (order) {
      const isUser = order.proposal.user.id === user.id
      if (isUser && order.orderStatus === OrderStat.WaitForFinish) {
        order.orderStatus = OrderStat.Start
        await this.orderRespotity.save(order)
        this.nofiService.addNofication(NoficationType.UserRejectFinishRequest , order.id , user.id , order.proposal.freelance.id)
        response.send("Decline Finish")
      } else {
        return response.status(400).send("Bad Error")
      }
    } else {
      response.status(404).send("Order Not Found")
    }

  }

  private cancleOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.freelance", "proposal.user"] })
    if (order) {
      const isUser = order.proposal.user.id === user.id
      const isFreelance = order.proposal.freelance.id === user.id
      if (isUser || isFreelance) {
        order.orderStatus = OrderStat.Cancle
        await this.orderRespotity.save(order)
        response.send("Accept")
      } else {
        return response.status(400).send("Bad Error")
      }
    } else {
      response.status(404).send("Order Not Found")
    }

  }



}

export default OrderController;