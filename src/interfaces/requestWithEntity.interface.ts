import { Request } from 'express';

interface RequestWithEntity<T> extends Request {
  data: T;
}

export default RequestWithEntity;
