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

class JobPostController implements Controller {
  public path = '/jobpost';
  public router = Router();

  private jobPostRespotity = getRepository(JobPost);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.getJobById);
    this.router.get(`${this.path}/user/all`, authMiddleware , this.getJobByUser);
    this.router.get(`${this.path}`, this.getAllJob);
    this.router.post(`${this.path}`, roleMiddleWare([UserType.User]), this.postJob);
    this.router.put(`${this.path}/:id`, permission(JobPost), this.updatePost);
    this.router.delete(`${this.path}/:id`, permission(JobPost), this.deletePost);
  }

  private postJob = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const post: JobPost = request.body
    const user = request.user
    post.user = user
    try {
      await this.jobPostRespotity.save(post)
      response.send(post)
    } catch (error) {
      response.status(400).send("Bad Status")
    }
  }

  private getAllJob = async (request: Request, response: Response, next: NextFunction) => {
    let category = request.query["category"]
    
      let pag = getPagination(request)
      const chainQuery = this.jobPostRespotity
        .createQueryBuilder('j')
        .orderBy('j.id', "DESC")
        .innerJoinAndSelect("j.user" , "user")
        .where("user.userType=1 AND user.isBan=false")
  
        if(category) chainQuery.andWhere("j.categoryId= :catId" , {catId : category})
  
        const [data , count] = await chainQuery
        .skip(pag.skip)
        .take(pag.take)
        .getManyAndCount()
        response.send({count : count,val : data})
  }

  private updatePost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    console.log("update")
    const updatePost : JobPost = request.body
    try {
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
    try {
      const rs = await this.jobPostRespotity.find({where:{user:{id:id}} , relations : ["proposals"]})
      response.send(rs)
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Request")
    }
  }


  private getJobById = async (request: Request, response: Response, next: NextFunction) => {
    const auth = request.headers["authorization"]
    const id = request.params.id;
    const findId = Number(id)
    
    const jobQuery = await this.jobPostRespotity.findOne({ where: { id: findId }, relations: ["user" , "proposals" , "proposals.user"] })
    try {
      if (jobQuery) {

        const {user,viewStat} = await AuthTokenViewStat(auth, jobQuery.user)
        if(viewStat === ViewStat.ViewOther || viewStat === ViewStat.ViewUser) jobQuery.proposals = []
        if(viewStat === ViewStat.ViewFreelance){
          const proposal = jobQuery.proposals.find(p=>p.user.id === user.id)
          if(proposal !== undefined){
            jobQuery.proposals = [proposal]
          }else jobQuery.proposals = []
  
        }
        response.send({ ...jobQuery, viewStat });
      } else {
        response.status(404).send("Job not found")
      }
    } catch (error) {
      response.status(400).send("Invaid Token")
    }

  }


}

export default JobPostController;