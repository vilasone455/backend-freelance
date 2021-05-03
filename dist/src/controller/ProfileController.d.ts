import Controller from '../interfaces/controller.interface';
declare class ProfileController implements Controller {
    path: string;
    router: import("express-serve-static-core").Router;
    private profileRespotity;
    private userRespotity;
    constructor();
    private initializeRoutes;
    private updateProfile;
    private newProfile;
    private getAllProject;
    private getProfile;
    private getUserById;
}
export default ProfileController;
