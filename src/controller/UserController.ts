import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { User } from '../entity/User';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import { getRepository } from 'typeorm';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRespotity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.get(`${this.path}`, this.getAllUser);
    this.router.get(`${this.path}/jobs`, this.getAllJob);
  }

  private getAllJob = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find({ relations: ["jobPosts"] });
    response.send(users)
  }


  private getAllUser = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRespotity.find({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"] });
    response.send(users)
  }

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {

    const id = request.params.id;
    const user = await this.userRespotity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"] , where : {
      id : Number(id)
    } });

    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(id));
    }
    
  }


}

export default UserController;