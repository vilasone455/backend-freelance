import * as bcrypt from 'bcrypt';
import { Request, Response, NextFunction, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import Controller from '../interfaces/controller.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import TokenData from '../interfaces/tokenData.interface';
import validationMiddleware from '../middleware/validation.middleware';

import { Profile } from '../entity/Profile';
import { User } from '../entity/User';
import { CreateUserDto } from '../dto/CreateUser.dto'

import AuthenticationService from './authentication.service';
import LogInDto from './logIn.dto';
import { getRepository } from 'typeorm';
import BadPermissionExpections from '../exceptions/BadPermissionExpection';


class AuthenticationController implements Controller {
  public path = '/auth';
  public router = Router();
  public authenticationService = new AuthenticationService();
  private userResposity = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/admin-register/:appkey`, validationMiddleware(CreateUserDto), this.registrationAdmin);
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/login`, this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registrationAdmin = async (request: Request, response: Response, next: NextFunction) => {
    const key = request.params.appkey
    if (key !== process.env.SECRET_KEY) next(new BadPermissionExpections())
    const userData: CreateUserDto = request.body;
    try {
      const {
        cookie,
        user,
      } = await this.authenticationService.register(userData, true);

      response.send(user);
    } catch (error) {
      next(error);
    }
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const {
        cookie,
        user,
      } = await this.authenticationService.register(userData);
      
      const tokenData = this.createToken(user)
      
      response.send({...user , tokenData});
    } catch (error) {
      next(error);
    }
  }

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    console.log(request.body)
    const logInData: LogInDto = request.body;
    console.log(logInData)
    const user = await this.userResposity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"], where: { userEmail: logInData.userEmail } })
    console.log("start login")
    console.log(user)
    if (user) {
      console.log("have user")
      const isPasswordMatching = await bcrypt.compare(logInData.userPassword, user.userPassword)
      console.log(isPasswordMatching)
      if (isPasswordMatching) {
        const tokenData = this.createToken(user);

        response.send({ ...user, tokenData });

      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private createToken(user: User): TokenData {
    const expiresIn = "7d"; // an hour
    const secret = process.env.SECRET_KEY;
    const dataStoredInToken: DataStoredInToken = {
      _id: user.id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

}

export default AuthenticationController;
