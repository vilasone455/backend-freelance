import Controller from '../interfaces/controller.interface';
import AuthenticationService from './authentication.service';
declare class AuthenticationController implements Controller {
    path: string;
    router: import("express-serve-static-core").Router;
    authenticationService: AuthenticationService;
    private userResposity;
    constructor();
    private initializeRoutes;
    private registration;
    private loggingIn;
    private loggingOut;
    private createCookie;
    private createToken;
}
export default AuthenticationController;
