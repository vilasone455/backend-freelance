import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';

import { getRepository, In } from 'typeorm';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import { Category } from '../entity/Category';
import { SubCategory } from '../entity/SubCategory';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';

class CategoryController implements Controller {
  public path = '/category';
  public router = Router();

  private categoryRespotity = getRepository(Category);
  private subCatRespotiy = getRepository(SubCategory)

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}` ,  this.getAllCategory);
    this.router.post(`${this.path}` , authMiddleware , this.addCategory);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updateCategory);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteCategory);
  }

  private addCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3) next(new BadPermissionExpections())
    const category : Category = request.body
    const subcats = await this.subCatRespotiy.save(category.subCategorys)
    category.subCategorys = subcats
    await this.categoryRespotity.save(category)
    response.send(category)
  }

  private getAllCategory = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.categoryRespotity.find({ relations: ["subCategorys"] })
      response.send(rs)
  }

  private updateCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3) next(new BadPermissionExpections())
    const category : Category = request.body
    const subcats = await this.subCatRespotiy.save(category.subCategorys)
    category.subCategorys = subcats
    await this.categoryRespotity.save(category)
    response.send(category)
   
  }

  private deleteCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3) next(new BadPermissionExpections())
    const id = request.params.id
    const rs = await this.categoryRespotity.delete(id)
    response.send(rs)
  }




}

export default CategoryController;