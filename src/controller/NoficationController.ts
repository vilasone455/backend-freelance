import { Router, Request, Response, NextFunction } from 'express';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import Controller from '../interfaces/controller.interface';
import { getRepository } from 'typeorm';
import { NoficationTb } from '../entity/NoficationTb';

class NoficationController implements Controller {
    public path = '/nofications';
    public router = Router();
    private noficationRes = getRepository(NoficationTb);

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/all`, this.allNofi);
        this.router.get(`${this.path}`, authMiddleware ,this.getNofication);
    }

    private allNofi = async (request: Request, response: Response, next: NextFunction) => {
       console.log("all nofi")
       const rs = await this.noficationRes.find({relations : ["sender"] })
       response.send(rs) 
    }

    private getNofication = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        console.log("get nofi")
        let user = request.user
        const rs = await this.noficationRes.find({relations : ["sender"] , where : {receiver : {id : user.id}}})
        response.send(rs) 
    }



}

export default NoficationController;