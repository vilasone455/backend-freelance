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
    this.router.post(`/subcategory` , authMiddleware , this.addSubCategory);
    this.router.put(`${this.path}/:id` , authMiddleware ,  this.updateCategory);
    this.router.put(`/subcategory/:id` , authMiddleware ,  this.editSubCategory);
    this.router.delete(`${this.path}/:id` , authMiddleware ,  this.deleteCategory);
    this.router.delete(`/subcategory/:id` , authMiddleware ,  this.deleteSubCategory);
  }

  private addSubCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const subcategory : SubCategory = request.body
    const subcats = await this.subCatRespotiy.save(subcategory)
    response.send(subcats)
  }

  private deleteSubCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const rs = await this.subCatRespotiy.delete(request.params.id)
    response.send(rs)
  }

  private editSubCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const category : SubCategory = request.body
    const id = request.params.id
    const cat = await this.subCatRespotiy.findOne(id)
    try {
      if(cat){
        cat.category = category.category
        cat.subCategoryName = category.subCategoryName
        const rs = await this.subCatRespotiy.save(cat)
        response.send(rs)
      }else{
        response.status(404).send("Not found")
      }
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
    
    
  }

  private addCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const category : Category = request.body
    const rs = await this.categoryRespotity.save(category)
    response.send(rs)
  }

  private getAllCategory = async (request: Request, response: Response, next: NextFunction) => {
      const rs = await this.categoryRespotity.find({ relations: ["subCategorys"] , order:{id:"ASC"} } )
      response.send(rs)
  }

  private updateCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const category : Category = request.body
    await this.categoryRespotity.save(category)
    response.send(category)
   
  }

  private deleteCategory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    if(request.user.userType !== 3 && request.user.userType !== 4) next(new BadPermissionExpections())
    const id = request.params.id
    console.log(id)
    const rs = await this.categoryRespotity.delete(id)
    response.send(rs)
  }




}

export default CategoryController;