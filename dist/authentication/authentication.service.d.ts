import TokenData from '../interfaces/tokenData.interface';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { User } from "../entity/User";
declare class AuthenticationService {
    userRepository: import("typeorm").Repository<User>;
    register(userData: CreateUserDto): Promise<{
        cookie: string;
        user: {
            userPassword: string;
            userName: string;
            userEmail: string;
        } & User;
    }>;
    createCookie(tokenData: TokenData): string;
    createToken(user: User): TokenData;
}
export default AuthenticationService;
