export enum NoficationType{
    FreelanceSendProposalToYou = 1, // UserX is send proposal to your post checkout : /postui/postid
    UserInterestHireYou = 2, // UserX is interest hire you check out it : /freelance/proposal 
    UserAcceptYourProposal = 3, // UserX is Accept your proposal check order : /order/orderid
    UserRejectYou = 4, // UserX is Reject your proposal
    YourAccountIsWarn = 5, // Your Account is Warning from admin because {reason}
    FreelanceFinishRequest = 6, // UserX is Send Final Finish Request check out 
    UserAcceptFinishRequest = 7, // UserX is Accept your finish request 
    UserRejectFinishRequest = 8 ,
    UserSendPayment = 9
}