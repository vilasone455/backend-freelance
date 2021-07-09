import { Request } from 'express';


interface Pagination{
    skip : number
    take : number
    page : number
}

export const getPagination = (request : Request , defaultTake = 5) => {
    const take = Number(request.query["take"]) || defaultTake
    let page = Number(request.query["page"]) || 0
    if(page > 0) page -= 1
    let skip = page * take
    let rs : Pagination = {
        skip,
        take,
        page
    }
    return rs 
}