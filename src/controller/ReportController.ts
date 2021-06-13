import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In , getConnection } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import { Report } from '../entity/Report';
import { User } from '../entity/User';
import { JobPost } from '../entity/JobPost';

interface UserReport{
  id:number
  userEmail:string
}

interface JobReport{
  id:number
  title:string
  user : UserReport
}

interface ReportResponse{
    id: number;
    section: string;
    description : string;
    createDate : Date;
    sender: UserReport;
    jobPost ?: JobReport
    user ?: UserReport
}

class ReportController implements Controller {
  public path = '/report';
  public router = Router();

  private reportRespotity = getRepository(Report);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/post` ,  this.getAllReportByPost);
    this.router.get(`${this.path}/user` ,  this.getAllReportByUser);
    this.router.post(`${this.path}` , authMiddleware , this.addReport);

  }

  private addReport = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const report : Report = request.body
    report.sender = user
    try {
        const rs = await this.reportRespotity.save(report)
        response.send(rs)
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }

  private getAllReportByUser = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await getConnection().createQueryBuilder(Report , "r")
      .innerJoinAndSelect(User, 's', 'r.senderId = s.id')
      .innerJoinAndSelect(User, 'u', 'r.objectId = u.id')
      .select([
        'r.id',
        'r.section',
        'r.description',
        'r.createDate',
        's.id',
        's.userEmail',
        'u.id',
        'u.userEmail'
      ])
      .where("r.tableName='user'")
      .getRawMany()

      const reportRs : ReportResponse[] = []

      rs.forEach(r=>{
        const add : ReportResponse = {
          id : r.r_id,
          section : r.r_section,
          description : r.r_description,
          sender : {
            id : r.s_id,
            userEmail : r.s_userEmail
          },
          user : {
            id : r.u_id,
            userEmail : r.u_userEmail,
          },
          createDate : r.r_createDate
        }
        reportRs.push(add)
      })

      response.send(reportRs)
  }

  private getAllReportByPost = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await getConnection().createQueryBuilder(Report , "r")
    .innerJoinAndSelect(User, 's', 'r.senderId = s.id')
    .innerJoinAndSelect(JobPost, 'j', 'r.objectId = j.id')
    .innerJoinAndSelect(User, 'u', 'j.userId = u.id')
    .select([
      'r.id',
      'r.section',
      'r.description',
      'r.createDate',
      's.id',
      's.userEmail',
      'j.id',
      'j.title',
      'u.id',
      'u.userEmail'
    ])
    .where("r.tableName='post'")
    .getRawMany()

    const reportRs : ReportResponse[] = []

    rs.forEach(r=>{
      const add : ReportResponse = {
        id : r.r_id,
        section : r.r_section,
        description : r.r_description,
        sender : {
          id : r.s_id,
          userEmail : r.s_userEmail
        },
        jobPost : {
          id : r.j_id,
          title : r.j_title,
          user : {
            id : r.u_id,
            userEmail : r.u_userEmail
          }
        },
        createDate : r.r_createDate
      }
      reportRs.push(add)
    })

    response.send(reportRs)
}


}

export default ReportController;