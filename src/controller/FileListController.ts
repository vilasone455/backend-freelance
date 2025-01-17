import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';


import BadPermissionExpections from '../exceptions/BadPermissionExpection';

import { UserType } from '../interfaces/UserType';

import { WorkFile } from '../entity/WorkFile';
import { Order } from '../entity/Order';
import { User } from '../entity/User';
import BadRequestExpection from '../exceptions/BadRequestExpection';
import { v2 } from 'cloudinary'
import * as Formidable from 'formidable';

class FileListController implements Controller {
  public path = '/file';
  public router = Router();

  private fileRespotity = getRepository(WorkFile);
  private orderRespotity = getRepository(Order);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllFile);
    this.router.post(`${this.path}` , authMiddleware , this.addFile);

    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteFile);
  }

  private async isHavePermission(orderId : number , user : User)  {
    const order = this.orderRespotity.createQueryBuilder("o")
    .innerJoinAndSelect("o.proposal" , "proposal")
    .where("o.id = :id AND (proposal.userId = :uId OR proposal.freelanceId = :uId)" , {id : orderId ,uId:user.id})
    .getMany()

    if(!order) return new BadPermissionExpections()

    return null
  }

  private addFile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user

    const form = new Formidable();

      form.parse(request, async (err, fields, files) => {
  
        try {
          const f : File = files.file

          const err = await this.isHavePermission(fields.order , user)
          if(err !== null) return next(err)

          let fileAdd = new WorkFile()

          const fileRs = await v2.uploader.upload(files.file.path, { resource_type: "auto" })
          fileAdd.order = fields.order
          fileAdd.fileName = f.name.split(".")[0]
          fileAdd.fileUrl = fileRs.secure_url
          fileAdd.fileSize = fileRs.bytes
          fileAdd.refId = fileRs.public_id
          fileAdd.fileFormat = fileRs.format
          fileAdd.owner = user
          console.log(fileRs)
          //https://www.flaticon.com/packs/files-8?k=1624036805795
          const rs = await this.fileRespotity.save(fileAdd)
          response.send(rs)
        } catch (error) {
          response.send(error)
        }
           
    
    });
        
    
    
  }

  private getAllFile = async (request: Request, response: Response, next: NextFunction) => {
      
    const rs = await this.fileRespotity.find({relations:[]})
    response.send(rs)
  }


  private deleteFile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const user = request.user
    
    const deleteItem = await this.fileRespotity.findOne({where : {id : id} , relations : ['order' , 'order.proposal' , 'order.proposal.freelance']})
    console.log(user)
    if(user.userType !== UserType.Freelance) {
        console.log("user role dont wokr")
        return next(new BadPermissionExpections())
    }

    if(!deleteItem) {
        console.log("item not found")
        return next(new BadPermissionExpections())
    }

    if(deleteItem.order.proposal.freelance.id != user.id){
        console.log("user not equal")
        return next(new BadPermissionExpections())
    }

    try {
        await v2.uploader.destroy(deleteItem.refId);
        const rs = await this.fileRespotity.delete(id)
        response.send(rs)
    } catch (error) {
      response.status(400).send("Bad Request")
    }
  }


}

export default FileListController;