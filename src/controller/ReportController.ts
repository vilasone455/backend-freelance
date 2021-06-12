import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In , getConnection } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Message } from '../entity/Message';
import { UserType } from '../interfaces/UserType';
import { Report } from '../entity/Report';
import { User } from '../entity/User';

class ReportController implements Controller {
  public path = '/report';
  public router = Router();

  private reportRespotity = getRepository(Report);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/user` ,  this.getAllReportByUser);
    this.router.post(`${this.path}` , authMiddleware , this.addReport);

  }

  private addReport = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    let report : Report = request.body
    
    try {

        const rs = await this.reportRespotity.save(report)
        response.send(rs)
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllReportByUser = async (request: Request, response: Response, next: NextFunction) => {
      //const rs = await getConnection().createQueryBuilder(Report , "r")
      //.select("r.id" , "r_id")
      //.innerJoin(User, 'u', 'r.id = u.id')
      //.getRawMany()
      const rs = await this.reportRespotity.findOne(1)
      //const rs = await this.reportRespotity.find({ relations: ["subCategorys"] })
      response.send(rs)
  }


}

export default ReportController;