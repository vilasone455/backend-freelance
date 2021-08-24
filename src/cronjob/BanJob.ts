import * as schedule from "node-schedule";
import { DailyLog } from "../entity/DailyLog";
import { getRepository, MoreThan } from "typeorm";
import { BanUser } from "../entity/BanUser";

class Banjob {

    constructor() {

    }
    // code refresh at 12:00 AM
    public checkBanUser() {
        let dailyRes = getRepository(DailyLog)
        let banRes = getRepository(BanUser)
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(0, 6)];
        rule.hour = 18;
        rule.minute = 0;
        schedule.scheduleJob(rule, async function () {
            let addLog = new DailyLog()
            addLog.msg = "Hello " + new Date().toDateString()
            await dailyRes.save(addLog)
            console.log("hello hey")
            let today = new Date()
            const rs = await banRes.find()
            rs.forEach(b=>{
                let expireDate = b.createDate
                expireDate.setDate(expireDate.getDate()+b.banDay)
                if(expireDate >= today ){
                    console.log("you got unban : " + b.id)
                }
            })

        });
    }
}

export default new Banjob();