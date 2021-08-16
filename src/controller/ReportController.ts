import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In , getConnection, MoreThan, Between } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import { Report } from '../entity/Report';
import { User } from '../entity/User';
import { JobPost } from '../entity/JobPost';
import { UserType } from '../interfaces/UserType';
import { Payment } from '../entity/Payment';
import { Order } from '../entity/Order';
import { OrderStat } from '../interfaces/OrderStat';

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

//ລົບແລ້ວຍັງສະແດງຢູ່ ແຕ່ໃຫ້ບອກວ່າຄົນນັ້ນຖຶກແບນ
//ລົບແລ້ວຂໍ້ມູນບໍ່ຫາຍ ເພາະຍາກໃຫ້ຜູ້ໃຊ້ຄົນອື່ນຮູ້ວ່າຜູ້ໃຊ້ນັ້ນຖຶກແບນ 
//ແລະ ຖ້າລົບຂໍ້ມູນທີ່ກຽວຂ້ອງ ຜູ້ໃຊ້ຄົນອື່ນຈະສັບສົນວ່າຂໍ້ມູນນັ້ນໄປໃສ

class ReportController implements Controller {
  public path = '/report';
  public router = Router();

  private reportRespotity = getRepository(Report);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/user/traffic` ,  this.getTrifficUser);
    this.router.get(`${this.path}/freelance` , authMiddleware , this.getFreelanceReport);
    this.router.get(`${this.path}/homefreelance` , authMiddleware , this.getFreelanceOrderReport);
    this.router.get(`${this.path}/home` ,  this.getHomeReport);
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

  private getTrifficUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user

    const groupType = request.query["type"]
    const dateStart = request.query["start"].toString()
    const dateEnd = request.query["end"].toString()

    const startDate = new Date(dateStart)
    const endDate = new Date(dateEnd)
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    const curr = new Date; // get current date
    const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6

    //const firstday = new Date(curr.setDate(first))
    //const lastday = new Date(curr.setDate(last))
    //firstday.setHours(0,0,0,0);
    //lastday.setHours(0,0,0,0);

    try {
      
        const user = await getConnection().createQueryBuilder(User , "u")
        .select([
          `date_part('${groupType}', u.createdDate) as d`,
          "count(u.id) as total"
        ] )
        .groupBy("d")
        .where("u.createdDate >= :startDate AND u.createdDate <= :endDate" , {startDate : startDate , endDate : endDate} )
        .getRawMany()
     
        response.send(user)
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }

  private getFreelanceOrderReport = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user

    const dateStart = request.query["start"].toString()
    const dateEnd = request.query["end"].toString()

    const startDate = new Date(dateStart)
    const endDate = new Date(dateEnd)
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    try {
        const orderRes = getRepository(Order)
        const rs = await orderRes.createQueryBuilder("o")
        .innerJoin("o.proposal" , "proposal")
        .select([
          "o.id",
          "proposal.id",
          "o.orderStatus"
        ])
        .where("proposal.freelanceId = :fId" , {fId : user.id})
        .andWhere("o.createdAt >= :startDate AND o.createdAt <= :endDate" , {startDate : startDate , endDate : endDate} )
        
        .getRawMany()

        const total = rs.length
        const totalIncomplete = rs.filter(r=>r.o_orderStatus == OrderStat.Start).length
        const totalComplete = rs.filter(r=>r.o_orderStatus == OrderStat.Finish).length
      

        response.send({
          total ,
          totalIncomplete,
          totalComplete
        })
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }


  private getFreelanceReport = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const groupType = request.query["type"]
    const dateStart = request.query["start"].toString()
    const dateEnd = request.query["end"].toString()

    const startDate = new Date(dateStart)
    const endDate = new Date(dateEnd)
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    try {

        const paymentRes = getRepository(Payment)
        const rs = await paymentRes.createQueryBuilder("p")
        .leftJoin("p.order" , 'o')
        .leftJoin("o.proposal" , "proposal")
        .select([
          `date_part('${groupType}', o.createdAt) as d`,
          "SUM(p.amount) as amounts"
        ])
        .groupBy("d")
        .where("proposal.freelanceId = :fId" , {fId : user.id})
        .andWhere("o.createdAt >= :startDate AND o.createdAt <= :endDate" , {startDate : startDate , endDate : endDate} )
        .getRawMany()

        response.send(rs)
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }


  private getHomeReport = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const dateStart = request.query["date"].toString()
    const date = new Date(dateStart)
    date.setHours(0,0,0,0);

    try {
        const userRes = getRepository(User)
        const jobRes = getRepository(JobPost)

        const freelance = await userRes.find({where:{createdDate : MoreThan(date),userType : UserType.Freelance}})
        const user = await userRes.find({where:{createdDate : MoreThan(date),userType : UserType.User}})
        const job = await jobRes.find({where:{createdDate : MoreThan(date)}})
        //const reportCount = await this.reportRespotity.count({where:{createdDate : MoreThan(date)}})

        const rs : any = {
          freelance : freelance,
          user : user,
          job : job,
          report : 0
        }

        response.send(rs)
    } catch (error) {
      console.log(error)
        response.status(400).send("Bad Request")
    }
    
  }


  private getAllReportByUser = async (request: Request, response: Response, next: NextFunction) => {

      const skip = Number(request.query["skip"]) || 0
      const take = Number(request.query["take"]) || 5


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
      .skip(skip)
      .take(take)
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

    const skip = Number(request.query["skip"]) || 0
    const take = Number(request.query["take"]) || 5

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
    .skip(skip)
    .take(take)
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