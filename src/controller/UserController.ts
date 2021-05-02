import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import {User} from '../entity/User';
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
    this.router.get(`${this.path}/:id` ,  this.getUserById);
    this.router.get(`${this.path}` ,  this.getAllUser);
    this.router.get(`${this.path}/tests` ,  this.testUser);
  }

  private testUser  = async (request: Request, response: Response, next: NextFunction) => {

    response.status(200).send("test")
}

  private getAllUser = async (request: Request, response: Response, next: NextFunction) => {
      const users = await this.userRespotity.find({ relations: ["profile" , "profile.address" , "profile.generalProfile" , "profile.workExs" , "profile.portfilios"] });
      console.log(users.length)
      response.send(users)
  }

  private getProfile = async (request: Request, response: Response, next: NextFunction) => {
    var userId = request.params.id
    //const profileResposity = getRepository()
    //var profile = 
    //response.send(users)
}

  private getUserById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    const findId = Number(id)
    const userQuery = this.userRespotity.findOne({id : findId});
 
    const user = await userQuery;
    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(id));
    }
  }


}

export default UserController;