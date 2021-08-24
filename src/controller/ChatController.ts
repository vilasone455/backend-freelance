import { NextFunction, Router , Request , Response } from "express";
import authMiddleware from "../middleware/auth.middleware";
import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { getRepository } from "typeorm";
import { ChatLog } from "../entity/ChatLog";
import { getPagination } from "../util/pagination";


class ChatController implements Controller {

    public path = '/users';
    public router = Router();
    private chatRes = getRepository(ChatLog)

    constructor() {
        this.initializeRoutes();
    }
 
    private initializeRoutes() {
        this.router.get(`/chats`, this.allChat);
        this.router.get(`/messages/:orderid`, authMiddleware ,this.getChatLog);
        this.router.post(`/messages`, this.addMessage);
    }

    private getChatLog = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        let pag = getPagination(request , 15)
        let user = request.user
        //console.log(request.params.orderid)
        //console.log(user)
        const rs = await this.chatRes.createQueryBuilder("c")
        .innerJoinAndSelect("c.sender" , "sender")
        .where("(c.senderId = :uId OR c.recipientId = :uId) AND c.orderId = :oId" , {uId : user.id , oId : Number(request.params.orderid)})
        .orderBy("c.id", "DESC")
        .skip(pag.skip)
        .take(pag.take)
        .getMany()
        response.send(rs)
    }

    private addMessage = async (request: Request, response: Response, next: NextFunction) => {
        const add : ChatLog = request.body
        const chats = await this.chatRes.save(add)
        response.send(chats)
    }

    private allChat = async (request: Request, response: Response, next: NextFunction) => {
        const chats = await this.chatRes.find();
        response.send(chats)
    }

}

export default ChatController