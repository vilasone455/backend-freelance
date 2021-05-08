import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository, In } from 'typeorm';

import { JobPost } from '../entity/JobPost';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import PostNotFoundException from '../exceptions/PostNotFoundException';
import { Skill } from '../entity/Skill';
import { GeneralProfile } from '../entity/GeneralProfile';

class JobPostController implements Controller {
  public path = '/jobpost';
  public router = Router();

  private jobPostRespotity = getRepository(JobPost);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id` ,  this.getJobById);
    this.router.get(`${this.path}` ,  this.getAllJob);
    this.router.post(`${this.path}` , authMiddleware ,  this.postJob);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updatePost);
  }

  private postJob = async (request: RequestWithUser, response: Response, next: NextFunction) => {

    const post : JobPost = request.body
    const user = request.user

    post.user = user

    await this.jobPostRespotity.save(post)
    response.send(post)
  }

  private getAllJob = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.jobPostRespotity.find({ relations: ["user","category","subCategory"] })
      response.send(rs)
  }

  private updatePost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    const updatePost : JobPost = request.body
    const post = await this.jobPostRespotity.findOne({user : user})
    if(post){
        await this.jobPostRespotity.save(updatePost)
        response.send(updatePost)
    }else{
        next(new PostNotFoundException(id));
    }
   
}


  private getJobById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    const findId = Number(id)
    const jobQuery = this.jobPostRespotity.findOne({id : findId});

    const job = await jobQuery;
    if (job) {
      response.send(job);
    } else {
      next(new UserNotFoundException(id));
    }
  }


}

export default JobPostController;