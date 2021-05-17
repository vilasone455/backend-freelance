import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository } from 'typeorm';

import { JobPost } from '../entity/JobPost';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import PostNotFoundException from '../exceptions/PostNotFoundException';

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
    try {
      await this.jobPostRespotity.save(post)
      response.send(post)
    } catch (error) {
      response.status(400).send("Bad Status")
    }
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
    const jobQuery = await this.jobPostRespotity.findOne({where : {id : findId} , relations : ["user"]})
    if (jobQuery) {
      response.send(jobQuery);
    } else {
      response.status(404).send("Job not found")
    }
  }


}

export default JobPostController;