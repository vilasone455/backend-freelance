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

class JobPostController implements Controller {
  public path = '/jobpost';
  public router = Router();

  private jobPostRespotity = getRepository(JobPost);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.getJobById);
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
    const rs = await this.jobPostRespotity.find({ relations: ["user", "category", "subCategory"] })
    response.send(rs)
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
          jobQuery.proposals = [proposal]
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