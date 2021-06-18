import { Router, Request, Response, NextFunction } from 'express';

import Controller from '../interfaces/controller.interface';


import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';

import * as formmid from 'formidable'
import BadPermissionExpections from '../exceptions/BadPermissionExpection';

import BadRequestExpection from '../exceptions/BadRequestExpection';
import { v2 } from 'cloudinary'
import * as Formidable from 'formidable';
class CloundFileController implements Controller {
    public path = '/cfile';
    public router = Router();



    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post(`${this.path}/upload`, this.addFile);
        this.router.post(`${this.path}/test`, this.test);
    }

    private test = async (request: Request, response: Response, next: NextFunction) => {

        const form = new Formidable();
        form.parse(request, (err, fields, files) => {

            // Find Cloudinary documentation using the link below
            // https://cloudinary.com/documentation/upload_images
            console.log(files.file)
            console.log(fields)
            response.send(fields)
        });
    }



    private addFile = async (request: Request, response: Response, next: NextFunction) => {


        const form = new Formidable();
        form.parse(request, (err, fields, files) => {

            v2.uploader.upload(files.file.path,
                { resource_type: "auto" })
                .then((result) => {
                    response.status(200).send({
                        message: "success",
                        result,
                    });
                }).catch((error) => {
                    response.status(500).send({
                        message: "failure",
                        error,
                    });
                });
        });



    }



}

export default CloundFileController;