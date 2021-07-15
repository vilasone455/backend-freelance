import { Profile } from "../entity/Profile"
import { IsNotEmpty , IsEmail, MinLength, MaxLength} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    public userName : string
    @IsEmail()
    public userEmail : string
    @MinLength(8)
    @MaxLength(25)
    public userPassword : string
    public userType : number
    public image: string;

    public toUser(){
        
    }

}

export class CreateFreelanceDto extends CreateUserDto{

    public profile : ProfileDto

    
}

export function UserDtoToProfile(u:CreateFreelanceDto) : Profile{
    console.log("profile")
    const p = new Profile()
    p.birthDate = u.profile.birthDate
    p.firstName = u.profile.firstName
    p.lastName = u.profile.lastName
    p.aboutMe = u.profile.aboutMe
    p.birthDate = u.profile.birthDate
    p.jobType = u.profile.jobType
    p.gender = u.profile.gender
    p.skills = u.profile.skills
    //p.address = this.profile.address
    //p.address = this.profile.address
    return p 
}

export class ProfileDto{
    @IsNotEmpty()
    public firstName: string;
    @IsNotEmpty()
    public lastName: string;
    public birthDate: Date;
    @MinLength(8)
    public jobType: string;
    @MinLength(8)
    public aboutMe: string;
    public gender: number;
    public category : number
    public subCategory : number;
    public skills : string
    public address : AddressDto
}

export class AddressDto{
    location: string;
    village: string;
    city: string;
    capital: string;
    tel: string;
    gmail: string;
    facebookLink: string;
    linkedinLink : string;
}

