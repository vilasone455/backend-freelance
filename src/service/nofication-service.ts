
import {User} from "../entity/User";
import { getRepository } from 'typeorm';

import { NoficationTb } from "../entity/NoficationTb";
import { onesignal } from "../util/onesignal";

enum NoficationType{
    FreelanceSendProposalToYou = 1, // UserX is send proposal to your post checkout : /postui/postid
    UserInterestHireYou = 2, // UserX is interest hire you check out it : /freelance/proposal 
    UserAcceptYourProposal = 3, // UserX is Accept your proposal check order : /order/orderid
    UserRejectYou = 4, // UserX is Reject your proposal
    YourAccountIsWarn = 5, // Your Account is Warning from admin because {reason}
    FreelanceFinishRequest = 6, // UserX is Send Final Finish Request check out 
    UserAcceptFinishRequest = 7, // UserX is Accept your finish request 
    UserRejectFinishRequest = 8 // UserX is Reject your finish request
}

export const NoficationTypeList = {
  FreelanceSendProposalToYou: { value: 'UserX is send proposal to your post checkout', key: 0, size: 25 },
  UserInterestHireYou: { value: 'medium', key: 1, size: 35 },
  UserAcceptYourProposal: { value: 'large', key: 2, size: 50 },
} as const

export type NoficationList = keyof typeof NoficationTypeList

interface AddNofication{
    subject : string
    typeNofication : number
    objectId : number
    url : string
    sender : number
    receiver : number
  }

class NoficationService {
  public nofiRepository = getRepository(NoficationTb);

  public async addNofication(typeNofication : NoficationType , objectId : number , sender : number , receiver : number) {
    /*
    let message = { 
      app_id: process.env.REST_ONE,
      contents: {"en": `${sender.userEmail} is will hire you , are you interest?`},
      channel_for_external_user_ids: "push",
      include_external_user_ids: [receiver.id.toString()]
    };
    
    onesignal.post("" , message)
    */

    let add : AddNofication = {
      subject : "",
      typeNofication,
      objectId ,
      sender : sender,
      receiver : receiver,
      url : ""
    }
    this.nofiRepository.save(add as any)

    return typeNofication
  }

  public async broadCast(typeNofication : NoficationType , objectId : number , sender : number , receiver : number[]) {
    let nofis : AddNofication[] = []
    receiver.forEach(r=>{
      nofis.push({
        subject : "",
        typeNofication,
        objectId ,
        url : "",
        sender : sender,
        receiver : r,
      })
    })
    this.nofiRepository
    .createQueryBuilder()
    .insert()
    .into(NoficationTb)
    .values(nofis as any[])
    .execute();
  }


}

export default NoficationService;