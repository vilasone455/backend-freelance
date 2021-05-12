import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import {User} from '../entity/User'
import {Profile} from '../entity/Profile'

class TestController implements Controller {
  public path = '/testctr';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/generate` ,  this.getSchema);

  }

  private convertTs = (model) => {
    console.log(JSON.stringify(model))
    const columns = model.options.columns || {}
    return columns
  }

  
  private getSchema = async (request: Request, response: Response, next: NextFunction) => {
    const rs = this.convertTs(User)

    response.send(rs)
    }

  private convert(model) {
    
  }






}

export default TestController;