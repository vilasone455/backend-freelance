import Controller from '../interfaces/controller.interface';
declare class UserController implements Controller {
    path: string;
    router: import("express-serve-static-core").Router;
    private userRespotity;
    constructor();
    private initializeRoutes;
    private getAllJob;
    private getAllUser;
    private getUserById;
}
export default UserController;
