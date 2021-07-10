import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../interfaces/controller.interface';
import { getRepository } from 'typeorm';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { Order } from '../entity/Order';
import { OrderStat } from '../interfaces/OrderStat';
import authMiddleware from '../middleware/auth.middleware';
import { User } from '../entity/User';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { getPagination } from '../util/pagination';

class OrderController implements Controller {
  public path = '/order';
  public router = Router();

  private orderRespotity = getRepository(Order);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}s`, this.getAllOrder);
    this.router.get(`${this.path}/user/all`, authMiddleware, this.getFreelanceByOrderV1);
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
    console.log("user id : " + id)
    const [val , count] = await this.orderRespotity.createQueryBuilder("o")
      .innerJoinAndSelect("o.proposal", "proposal")
      .leftJoinAndSelect("proposal.jobPost", "jobPost")
      .innerJoinAndSelect("proposal.user", "user")
      .innerJoinAndSelect("proposal.freelance", "freelance")
      .leftJoinAndSelect("o.payments", "payments")
      .where("proposal.userId = :id or proposal.freelanceId=:id", { id })
      .take(pag.take)
      .skip(pag.skip)
      .getManyAndCount()

    response.send({val , count})
  }

  private getOrderById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = Number(request.params.id)
    const userId = request.user.id

    const rs = await this.orderRespotity.createQueryBuilder("o")
      .innerJoinAndSelect("o.proposal", "proposal")
      .leftJoinAndSelect("o.payments", "payments")
      .leftJoinAndSelect("o.workFiles", "workFiles")
      .leftJoinAndSelect("workFiles.owner", "owner")
      .leftJoinAndSelect("o.review", "r")
      .where("o.id = :id AND (proposal.userId = :uId OR proposal.freelanceId = :uId)", { id: id, uId: userId })
      .getOne()

    if(rs){
      response.send(rs)
    }else{
      next(new BadPermissionExpections())
    }

    
  }

  private getAllOrder = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.orderRespotity.find({ relations: ["proposal", "proposal.user", "proposal.freelance"] })
    response.send(rs)
  }

  private getFreelanceByOrderV1 = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const rs = await this.orderRespotity.createQueryBuilder("o")
      .innerJoinAndSelect("o.proposal", "proposal")
      .leftJoinAndSelect("proposal.jobPost", "jobPost")
      .innerJoinAndSelect("proposal.freelance", "freelance")
      .innerJoinAndSelect("freelance.profile", "profile")
      .where("proposal.userId = :id", { id })
      .getMany();
    const users: User[] = []
    rs.forEach(r => {
      if (users.findIndex(u => u.id === r.proposal.freelance.id) === -1) {
        users.push(r.proposal.freelance)
      }
    })
    response.send(users)
  }



  private acceptFinishOrder = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const orderId = request.params.orderid
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.user"] })
    if (order) {
      const isUser = order.proposal.user.id === user.id
      if (isUser) {
        order.orderStatus = OrderStat.Finish
        order.finishAt = new Date()
        await this.orderRespotity.save(order)
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
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.freelance"] })
    if (order) {
      const isFreelance = order.proposal.freelance.id === user.id
      if (isFreelance) {
        order.orderStatus = OrderStat.WaitForFinish
        await this.orderRespotity.save(order)
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
    const order = await this.orderRespotity.findOne({ where: { id: orderId }, relations: ["proposal", "proposal.user"] })
    if (order) {
      const isUser = order.proposal.user.id === user.id
      if (isUser && order.orderStatus === OrderStat.WaitForFinish) {
        order.orderStatus = OrderStat.Start
        await this.orderRespotity.save(order)
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