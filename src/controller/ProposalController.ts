import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import { getRepository } from 'typeorm';
import { Proposal } from '../entity/Proposal';
import roleMiddleWare from '../middleware/role.middleware';
import { UserType } from '../interfaces/UserType';
import BadRequestExpection from '../exceptions/BadRequestExpection';
import { OfferStat } from '../interfaces/OfferStat';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';
import { Order } from '../entity/Order';
import { CreateOrder } from '../interfaces/CreateOrder.dto';
import authMiddleware from '../middleware/auth.middleware';
import { EditProposal } from '../dto/EditProposal.dto';


class ProposalController implements Controller {
  public path = '/proposal';
  public router = Router();
  private proposalRes = getRepository(Proposal);


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, authMiddleware ,this.getProposalById);
    this.router.get(`${this.path}`, authMiddleware ,this.getProposalByUser);
    this.router.get(`${this.path}/accept/:id`, authMiddleware ,this.acceptOffer);
    this.router.get(`${this.path}/decline`, authMiddleware ,this.declineOffer);
    this.router.get(`${this.path}s`, this.getAllProposal);
    this.router.post(`${this.path}`, roleMiddleWare([UserType.User]) , this.addProposal);
    this.router.put(`${this.path}/:id`, authMiddleware , this.editProposal);
  }

  private addProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: EditProposal = request.body
    try {
      proposal.user = request.user
      if(proposal.user.id === proposal.freelance){
        return new BadRequestExpection()
      }
      console.log(proposal as any)
      const rs = await this.proposalRes.save(proposal as any)
      response.send(rs)
    } catch (error) {
      next(new BadRequestExpection())
    }
  }

  private editProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: Proposal = request.body
    const user = request.user
    try {
      const isUser = proposal.user.id === user.id
      const isFreelance = proposal.freelance.id === user.id
      proposal.userAccept = false
      proposal.freelanceAccept = false
      if(isUser|| isFreelance){
        if(isUser) proposal.userAccept = true
        if(isFreelance) proposal.freelanceAccept = true
        const rs = await this.proposalRes.save(proposal)
        response.send(rs)
      }else{ next(new BadPermissionExpections())}
      
    } catch (error) {
      next(new BadRequestExpection())
    }
   
  }

  private acceptOffer = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const proposal = await this.proposalRes.findOne({where:{id:request.params.id} , relations:["user" , "freelance"]})
    try {
      console.log(proposal)
      const isUser = proposal.user.id === user.id
      const isFreelance = proposal.freelance.id === user.id
      if(isUser || isFreelance){
        if(isUser && !proposal.freelanceAccept){ // when will accept  must accepted
          return response.status(400).send("Bad Permission")
        }else if(isFreelance && !proposal.userAccept){ // when freelance will accept user must accepted
          return response.status(400).send("Bad Permission")
        }
        proposal.status = OfferStat.Accept
        proposal.freelanceAccept = true
        proposal.userAccept = true
        await this.proposalRes.save(proposal)
        const order : CreateOrder = {orderStatus : 1, proposal}
        const orderRes = getRepository(Order)
        await orderRes.save(order)
        response.send(order)
      }else{
        next(new BadPermissionExpections())
      }
    } catch (error) {
      console.log(error)
      response.status(400).send("Bad Error")
    }
  }

  private declineOffer = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const proposal = await this.proposalRes.findOne(request.params.id)
    if(proposal.status === OfferStat.Accept) next(new BadRequestExpection())
    if(proposal.user.id === user.id || proposal.freelance.id === user.id){
      proposal.status = OfferStat.Cancle
      proposal.freelanceAccept = false
      proposal.userAccept = false
      await this.proposalRes.save(proposal)
      response.send("Order Success")
    }else{
      next(new BadPermissionExpections())
    }
  }

  private getAllProposal = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.proposalRes.find({ relations: ["user" , "freelance"] })
    response.send(rs)
  }

  private getProposalByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const rs = await this.proposalRes.find({where : [
      {"user" : {"id" : id} },
      {"freelance" : {"id" : id} }
    ] , 
    relations : ["user" , "freelance"] })
    response.send(rs)
  }

  private getProposalById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    const rs = await this.proposalRes.findOne({where : {id:id}, 
    relations : ["user" , "freelance"] })
    if(rs.user.id === user.id || rs.freelance.id === user.id){
      response.send(rs)
    }else{
      next(new BadPermissionExpections())
    }
    
  }



}

export default ProposalController;