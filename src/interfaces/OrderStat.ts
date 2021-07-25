export enum OrderStat{
    Start = 1, 
    WaitForFinish = 2,
    Finish = 3,  // 3 and have review = rehire , 3 and dont have review = review
    Cancle = 4
}

//Send Finish order (orderId) => orderStat = 2 ? only freelance
//Decline Finihs order => orderStat = 1 ? only user ,  status must is 2  
//Accept Finish => orderStat = 3 ? only user ,  status must is 2  
//Cancle Order => orderStat = 4 ? both