import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import {User} from '../entity/User'
import {Profile} from '../entity/Profile'
import RequestWithUser from '../interfaces/requestWithUser.interface';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { getRepository } from 'typeorm';
import { Proposal } from '../entity/Proposal';
import authMiddleware from '../middleware/auth.middleware';
import { JobPost } from '../entity/JobPost';

class ProposalController implements Controller {
  public path = '/proposal';
  public router = Router();
  private proposalRes = getRepository(Proposal);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/generate` ,  this.getAllOrder);
    this.router.post(`${this.path}` ,  authMiddleware , this.addProposal);
  }

  private replyProposal() {
      
  }

  private addProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const proposal : Proposal = request.body
    if(user.userType !== 2) next(new BadPermissionExpections())

    proposal.user = user
    const rs = await this.proposalRes.save(proposal)
    
    response.send(rs)
    } 

  private getAllOrder = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.proposalRes.find({ relations: ["user"] })
    response.send(rs)
    }

}

export default ProposalController;