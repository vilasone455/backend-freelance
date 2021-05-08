import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import TokenData from '../interfaces/tokenData.interface';

import {CreateUserDto} from '../dto/CreateUser.dto';

import {User} from "../entity/User";
import { getRepository } from 'typeorm';

class AuthenticationService {
  public userRepository = getRepository(User);

  public async register(userData: CreateUserDto , isAdmin : boolean = false) {

    if (
      await this.userRepository.findOne({ userEmail: userData.userEmail })
    ) {
      throw new UserWithThatEmailAlreadyExistsException(userData.userEmail);
    }
    if(isAdmin == false){
      if(userData.userType === 3) userData.userType = 1
    }

    const hashedPassword = await bcrypt.hash(userData.userPassword, 10);
    const user = await this.userRepository.save({
      ...userData,
      userPassword: hashedPassword,
    })

    const tokenData = this.createToken(user);
    const cookie = this.createCookie(tokenData);
    return {
      cookie,
      user,
    };
  }
  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
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

export default AuthenticationService;
