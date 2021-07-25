import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository } from 'typeorm';

import { JobPost } from '../entity/JobPost';
import RequestWithUser from '../interfaces/requestWithUser.interface';

import roleMiddleWare from '../middleware/role.middleware';
import permission from '../middleware/permission.middleware'
import PostNotFoundException from '../exceptions/PostNotFoundException';
import { AuthTokenViewStat } from './AuthTokenToViewStat';
import { UserType } from '../interfaces/UserType';
import { ViewStat } from '../interfaces/ViewStat';
import authMiddleware from '../middleware/auth.middleware';
import { getPagination } from '../util/pagination';
import { JobStatus } from '../interfaces/JobStatus';
import { JobSkill } from '../entity/JobSkill';
import { randomJobSkillSet, randomSkillSet } from './Util';


class JobPostController implements Controller {
  public path = '/jobpost';
  public router = Router();

  private jobPostRespotity = getRepository(JobPost);
  private skillRes = getRepository(JobSkill);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/ajustjobskill`, this.ajustSkill);
    this.router.get(`/ajustjob`, this.ajustJob);
    this.router.get(`${this.path}/:id`, this.getJobById);
    this.router.get(`${this.path}/user/all`, authMiddleware, this.getJobByUser);
    this.router.get(`${this.path}`, this.getAllJob);
    this.router.get(`${this.path}/close/:id`, authMiddleware, this.closeJob);
    this.router.post(`${this.path}`, roleMiddleWare([UserType.User]), this.postJob);
    this.router.put(`${this.path}/:id`, permission(JobPost), this.updatePost);
    this.router.delete(`${this.path}/:id`, permission(JobPost), this.deletePost);
  }

  private randomSkill = (n: number) => {
    let skillsets: string[] = [
      "Php",
      "Javascript",
      "Html",
      "CSS",
      "Nodejs",
      "Python",
      "Flutter",
      "MongoDb",
      "Xamarin",
      "Java",
      "C++"
    ]

    let rs: string[] = []
    for (let i = 0; i < n; i++) {
      let indexof = Math.floor(Math.random() * skillsets.length)
      rs.push(skillsets[indexof])
      skillsets.splice(indexof, 1)
    }
    return rs.join()
  }

  private ajustSkill = async (request: Request, response: Response, next: NextFunction) => {
    const skillRes = getRepository(JobSkill)
    const jobs = await this.jobPostRespotity.find({where : {status : JobStatus.Open} , relations : ["skillSet"]})
    const process : Promise<JobSkill>[]  = []
    jobs.forEach(u => {

      if(u.skillSet.length === 0){
          if(u.skillRequires !== ""){
            let sk = randomJobSkillSet(u.skillRequires , u.id)
   
            sk.forEach(s=>{
              process.push(skillRes.save(s))
            })
          }

      }
      //this.userRespotity.save()
    });
    const rs = await Promise.all(process)
    response.send(rs)
  }

  private ajustJob = async (request: Request, response: Response, next: NextFunction) => {

    const jobs = await this.jobPostRespotity.find()
    const process: Promise<JobPost>[] = []
    jobs.forEach(u => {
      if (u.description === "" || u.description === "cccc" || u.skillRequires.length < 10) {
        u.skillRequires = this.randomSkill(5)
        u.description = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries"
        process.push(this.jobPostRespotity.save(u))
      }
      //this.userRespotity.save()
    });
    const rs = await Promise.all(process)
    response.send(rs)
  }


  private postJob = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const post: JobPost = request.body
    const user = request.user
    post.user = user
    try {
      const skills = await this.skillRes.save(post.skillSet)
      post.skillSet = skills
      await this.jobPostRespotity.save(post)
      response.send(post)
    } catch (error) {
      response.status(400).send("Bad Status")
    }
  }

  private getAllJob = async (request: Request, response: Response, next: NextFunction) => {
    let category = request.query["category"]
    let subCategory = request.query["subCategory"]
    let search = request.query["search"]

    let skill = request.query["skill"]
    let location = request.query["location"]
    let expReq = request.query["experienceRequire"]
    let price = request.query["price"]

    let pag = getPagination(request)
    const chainQuery = this.jobPostRespotity
      .createQueryBuilder('j')
      .orderBy('j.id', "DESC")
      .innerJoinAndSelect("j.user", "user")
      .leftJoinAndSelect("j.skillSet" , "skillSet")
      .where("user.userType=1 AND user.isBan=false AND j.status=1")


    if (search) chainQuery.andWhere("j.title like :name ", { name: '%' + search.toString() + '%' })
    if (subCategory) {
      chainQuery.andWhere("j.subCategoryId= :catId", { catId: subCategory })
    } else if (category) {
      chainQuery.andWhere("j.categoryId= :catId", { catId: category })
    }

    if(location){
      let locationLike = `'%${location.toString()}%'`
      chainQuery.andWhere("j.location like " + locationLike)
    }

    if(expReq){
      let rs = expReq.toString().split("-")
      if(rs.length === 1){
        chainQuery.andWhere("j.experienceRequire >= :start" , {start : rs[0] })
      }else if(rs.length === 2){
        chainQuery.andWhere("j.experienceRequire >= :start AND j.experienceRequire <= :end" , {start : rs[0] , end : rs[1] })
      }
    }

    if(price){
      let rs = price.toString().split("-")
      if(rs.length === 1){
        chainQuery.andWhere("j.budgetStart >= :start" , {start : rs[0] })
      }else if(rs.length === 2){
        chainQuery.andWhere("j.budgetStart >= :start AND j.budgetEnd <= :end" , {start : rs[0] , end : rs[1] })
      }
    }

    if(skill){
      let skillset = skill.toString().split(",")
      let skillrs = "("
      skillset.forEach(s => skillrs += "'" + s + "'," )
      skillrs = skillrs.substring(0 , skillrs.length - 1)
      skillrs += ")"
      chainQuery.andWhere("skillSet.skillName IN "+skillrs )
    }


    const [data, count] = await chainQuery
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()
    response.send({ count: count, val: data })
  }

  private updatePost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const updatePost: JobPost = request.body
    try {
      const skills = await this.skillRes.save(updatePost.skillSet)
      updatePost.skillSet = skills
      await this.jobPostRespotity.save(updatePost)
      response.send(updatePost)
    } catch (error) {
      response.status(400).send("Bad Request")
    }


  }

  private deletePost = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id
    try {
      console.log(id)
      const rs = await this.jobPostRespotity.delete(id)
      response.send(rs)
    } catch (error) {
      console.log(error)
      response.status(404).send("Wrong Id")
    }
  }

  private getJobByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const pag = getPagination(request)
    try {
      let status = request.query["status"]
      //const [val, count] = await this.jobPostRespotity.findAndCount({
      //  where: { user: { id: id } }, relations: ["proposals"]
      //  , take: pag.take, skip: pag.skip
      //})
      const chainQuery= await this.jobPostRespotity.createQueryBuilder("j")
      .innerJoinAndSelect("j.user" , "user")
      .where("j.userId = :uId" , {uId : id})
      
      if(status){
        chainQuery.andWhere("j.status = :status" , {status})
      }

      const [count , val] = await chainQuery
      .skip(pag.skip)
      .take(pag.take)
      .getManyAndCount()

      response.send({ count, val })
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Request")
    }
  }


  private getJobById = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]
    const id = request.params.id;
    const findId = Number(id)

    const jobQuery = await this.jobPostRespotity.findOne({
      where: { id: findId }, relations: ["user", "category",
        "subCategory", "proposals", "proposals.user" , "skillSet"]
    })
    try {
      if (jobQuery) {

        const { user, viewStat } = await AuthTokenViewStat(auth, jobQuery.user)
        if (viewStat === ViewStat.ViewOther || viewStat === ViewStat.ViewUser) jobQuery.proposals = []
        if (viewStat === ViewStat.ViewFreelance) {
          const proposal = jobQuery.proposals.find(p => p.freelance.id === user.id)
          if (proposal !== undefined) {
            jobQuery.proposals = [proposal]
          } else jobQuery.proposals = []

        }
        const similarJobs = await this.jobPostRespotity.find({
          where: {
            category: jobQuery.category
          }, take: 5
        })

        response.send({ ...jobQuery, similarJobs, viewStat });
      } else {
        response.status(404).send("Job not found")
      }
    } catch (error) {
      response.status(400).send("Invaid Token")
    }

  }

  private closeJob = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const jobId = request.params.id
    const vaildUserType = [UserType.Admin, UserType.MainAdmin]
    try {
      console.log(request.user)
      console.log("close job")
      const job = await this.jobPostRespotity.findOne({where : {id : jobId} , relations : ["user"]})
      console.log(job)

     
      let isNotOwn = job.user.id !== request.user.id && !vaildUserType.includes(request.user.userType)
      let isClose = job.status === JobStatus.Close

      console.log(isNotOwn || isNotOwn)
      if (isNotOwn || isClose) {
        return response.status(400).send("You cant close this job")
      }else{
        console.log("yesss")
      }
      console.log("work")
      job.status = JobStatus.Close

      const rs = await this.jobPostRespotity.save(job)
      response.send(rs)
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Request")
    }
  }



}

export default JobPostController;