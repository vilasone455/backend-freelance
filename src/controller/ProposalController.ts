import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { getRepository } from 'typeorm';
import { Proposal } from '../entity/Proposal';
import roleMiddleWare from '../middleware/role.middleware';
import permission from '../middleware/permission.middleware'
import { UserType } from '../interfaces/UserType';
import BadRequestExpection from '../exceptions/BadRequestExpection';


class ProposalController implements Controller {
  public path = '/proposal';
  public router = Router();
  private proposalRes = getRepository(Proposal);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.getAllProposal);
    this.router.post(`${this.path}`, roleMiddleWare([UserType.Freelance]) , this.addProposal);
    this.router.put(`${this.path}/:id`, permission(Proposal), this.editProposal);
  }

  private addProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: Proposal = request.body
    try {
      proposal.user = request.user
      const rs = await this.proposalRes.save(proposal)
      response.send(rs)
    } catch (error) {
      next(new BadRequestExpection())
    }
  }

  private editProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: Proposal = request.body
    try {
      proposal.user = request.user
      const rs = await this.proposalRes.save(proposal)
      response.send(rs)
    } catch (error) {
      next(new BadRequestExpection())
    }
   
  }

  private getAllProposal = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.proposalRes.find({ relations: ["user"] })
    response.send(rs)
  }

}

export default ProposalController;