import { Request } from 'express';
import {User} from "../entity/User";
import { ViewStat } from './ViewStat';

interface RequestWithUser extends Request {
  user: User;
  viewStat ?: ViewStat
}

export default RequestWithUser;
