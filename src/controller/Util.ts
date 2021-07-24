import { JobSkill } from "src/entity/JobSkill";
import { Skill } from "src/entity/Skill";

const isExpire = (dateNow : Date , expireDate : Date) => {
    let a = new Date(dateNow.getFullYear(),dateNow.getMonth()+1,dateNow.getDate());
    let ex = new Date(expireDate.getFullYear(),expireDate.getMonth()+1,expireDate.getDate());
    return a.getTime() >= ex.getTime() 
}

export const randomSkill = (n: number) => {
    let skillsets: string[] = [
      "Php",
      "Javascript",
      "Html",
      "CSS",
      "Nodejs",
      "Python",
      "Flutter",
      "MongoDb",
      "Xamarin",
      "Java",
      "C++"
    ]

    let rs: string[] = []
    for (let i = 0; i < n; i++) {
      let indexof = Math.floor(Math.random() * skillsets.length)
      rs.push(skillsets[indexof])
      skillsets.splice(indexof, 1)
    }
    return rs.join()
  }

  export const randomSkillSet = (n: number , p : number) => {
    let skills = randomSkill(n).split(",")
    let rs : Skill[] = []
    skills.forEach(s => {
        let add : any = {skillName : s , profile : p}
        rs.push(add)
    });
    return rs
  }

  export const randomJobSkillSet = (str : string , p : number) => {
    let jobskill = str.split(",")
    let rs : JobSkill[] = []
    jobskill.forEach(s => {
        let add : any = {skillName : s , jobPost : p}
        rs.push(add)
    });
    return rs
  }

