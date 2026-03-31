import {AppError} from "../utils/AppError.js";

export function parseIdOrError(rawId: string | string[] | undefined, text:string) {
    if (!rawId || Array.isArray(rawId)) throw new AppError(400, `${text} is invalid`);
    const id = Number(rawId);
    if(isNaN(id)) throw new AppError(400, `${text} is invalid`);
    return id;
}