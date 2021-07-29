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
import { ProposalStatus } from '../interfaces/ProposalStatus';
import { JobPost } from '../entity/JobPost';
import { JobStatus } from '../interfaces/JobStatus';
import { getPagination } from '../util/pagination';

class ProposalController implements Controller {
  public path = '/proposal';
  public router = Router();
  private proposalRes = getRepository(Proposal);
  private jobPostRes = getRepository(JobPost);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, authMiddleware ,this.getProposalById);
    this.router.get(`${this.path}`, authMiddleware ,this.getProposalByUser);
    this.router.get(`${this.path}/accept/:id`, authMiddleware ,this.acceptOfferV2);
    this.router.get(`${this.path}/decline/:id`, authMiddleware ,this.declineOffer);
    this.router.get(`${this.path}s`, this.getAllProposal);
    this.router.post(`${this.path}`, roleMiddleWare([UserType.User , UserType.Freelance]) , this.addProposal);
    this.router.put(`${this.path}/:id`, authMiddleware , this.editProposal);
   // this.router.put(`${this.path}/:id`, authMiddleware , this.editProposalV2);
  }

  private addProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    let proposal: EditProposal = request.body
    const user = request.user
    try {
      if(proposal.freelance === proposal.user) {
        console.log("Freelance is Equal User")
        return response.status(400).send("Freelance is Equal User")
      }
      if(proposal.jobPost){
        console.log("add proposal by jobpost")

        if(user.userType === UserType.Freelance){
          proposal.freelance = user
        }else {
          console.log("Only Freelance Can Send Job Proposal")
          return response.status(400).send("Only Freelance Can Send Job Proposal")
        }

        const jobRes = getRepository(JobPost)
        const job = await jobRes.findOne({where : {id : proposal.jobPost } , relations : ["user"]})
        if(job){     
            proposal.status = ProposalStatus.FreelanceSend
            proposal.user = job.user
        }else{
          console.log("Error Job Dont Found In Request")
          return response.status(400).send("Error Job Dont Found In Request")
        }
      }

      if(user.userType === UserType.Freelance){
        proposal.freelance = user
        proposal.status = ProposalStatus.FreelanceSend
      }else if (user.userType === UserType.User){
        proposal.user = user
        proposal.status = ProposalStatus.UserSend
      }

      console.log(proposal as any)
      const rs = await this.proposalRes.save(proposal as any)
      response.send(rs)
    } catch (error) {
      console.log("catch error : ")
      console.log(error)
      next(new BadRequestExpection())
    }
  }

  private editProposal = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: EditProposal = request.body
    const user = request.user
    try {
      const isUser = proposal.user = user.id
      const isFreelance = proposal.freelance === user.id

      if(proposal.jobPost){
        if(isFreelance || proposal.status === ProposalStatus.FreelanceSend) return next(new BadPermissionExpections())
      }
      //isUser && ProposalStatus.UserSend
      //isFreelance && ProposalStatus.FreelanceSend
      if((isUser || proposal.status === ProposalStatus.UserSend) || (isFreelance && proposal.status === ProposalStatus.FreelanceSend)){
 
        const rs = await this.proposalRes.save(proposal as any)
        response.send(rs)
      }else{ next(new BadPermissionExpections())}
      
    } catch (error) {
      next(new BadRequestExpection())
    }
   
  }



  private editProposalV2 = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const proposal: EditProposal = request.body
    const user = request.user
    try {
      const isUser = proposal.user = user.id
      const isFreelance = proposal.freelance === user.id

      if(proposal.jobPost){
        return next(new BadRequestExpection())
      }

      if(isUser|| isFreelance){
        if(isUser) proposal.status = ProposalStatus.UserSend
        if(isFreelance) proposal.status = ProposalStatus.FreelanceSend
        const rs = await this.proposalRes.save(proposal as any)
        response.send(rs)
      }else{ next(new BadPermissionExpections())}
      
    } catch (error) {
      next(new BadRequestExpection())
    }
   
  }

  private acceptOfferV2 = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user
    const proposal = await this.proposalRes.findOne({where:{id:request.params.id} , relations:["user" , "freelance" , "jobPost" , "jobPost.proposals"]})
    try {
      console.log(proposal)
      const isUser = proposal.user.id === user.id
      const isFreelance = proposal.freelance.id === user.id

      if(proposal.jobPost && isFreelance){ // if freelance aceept proposal in jobpost
        return next(new BadPermissionExpections())
      }

      if(isUser || isFreelance){
        //cant self accept
        if(isUser && proposal.status === ProposalStatus.UserSend){ // when will accept  must accepted
          return response.status(400).send("Bad Permission")
        }else if(isFreelance && proposal.status === ProposalStatus.FreelanceSend ){ // when freelance will accept user must accepted
          return response.status(400).send("Bad Permission")
        }

        if(proposal.status === ProposalStatus.Expire){
          return response.status(400).send("Expire Session")
        }

        proposal.status = OfferStat.Accept
        //let process : Promise<Proposal>[] = []
        if(proposal.jobPost){
          let job = proposal.jobPost
          job.status = JobStatus.Close
          if(job.proposals.length > 1){
            let rejectAll = job.proposals.filter(p=>p.id !== proposal.id)
            rejectAll.forEach(r=>{
              r.status = ProposalStatus.Cancle
            })
            this.proposalRes.save(rejectAll)
            console.log(rejectAll)
          }
          await this.jobPostRes.save(job)
        }

        await this.proposalRes.save(proposal)
        const order : CreateOrder = {orderStatus : 1, proposal}
        const orderRes = getRepository(Order)
        const o = await orderRes.save(order)
        response.send(o)
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
    if(proposal.status === ProposalStatus.Accept) next(new BadRequestExpection())
    if(proposal.user.id === user.id || proposal.freelance.id === user.id){
      proposal.status = ProposalStatus.Cancle
      await this.proposalRes.save(proposal)
      response.send("Order Success")
    }else{
      next(new BadPermissionExpections())
    }
  }

  private getAllProposal = async (request: Request, response: Response, next: NextFunction) => {
    const rs = await this.proposalRes.find({ relations: ["user" , "freelance" , "jobPost"] , order : {id : "DESC"} })
    response.send(rs)
  }

  private getProposalByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.user.id
    const status = request.query["status"]
    const pag = getPagination(request , 15)
    const chainQuery =  this.proposalRes.createQueryBuilder("p")
    .innerJoinAndSelect("p.user" , "user")
    .innerJoinAndSelect("p.freelance" , "freelance")
    .innerJoinAndSelect("p.jobPost" , "jobPost")
    .where("(p.userId = :uId OR p.freelanceId = :uId)", {uId : id})

    if(status) {
      if(status.toString() == "3") {
        chainQuery.innerJoinAndSelect("p.order" , "order")
      }
      chainQuery.andWhere("p.status = :status" , {status})
    }

    const [val , count] = await chainQuery
    .skip(pag.skip)
    .take(pag.take)
    .getManyAndCount()
    
    response.send({count , val})
  }

  private getProposalById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    const rs = await this.proposalRes.findOne({where : {id:id}, 
    relations : ["user" , "freelance" ] })
    if(rs.user.id === user.id || rs.freelance.id === user.id){
      response.send(rs)
    }else{
      next(new BadPermissionExpections())
    }
    
  }



}

export default ProposalController;