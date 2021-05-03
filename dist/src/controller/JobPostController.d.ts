import Controller from '../interfaces/controller.interface';
declare class JobPostController implements Controller {
    path: string;
    router: import("express-serve-static-core").Router;
    private jobPostRespotity;
    constructor();
    private initializeRoutes;
    private postJob;
    private getAllJob;
    private updatePost;
    private getJobById;
}
export default JobPostController;
