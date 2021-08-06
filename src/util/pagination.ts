import { Request } from 'express';


interface Pagination{
    skip : number
    take : number
    page : number
}

export function paginateArray(array, page_size : number, page_number : number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
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