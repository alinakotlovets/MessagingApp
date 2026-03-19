import type {Request, Response, NextFunction} from "express";
import {AppError} from "../utils/AppError.js";

export async function validateAvatar(req :Request, res: Response, next:NextFunction){
    const {file} = req;
    const maxSize = 5 * 1024 * 1024;

    if(file){
        if(!file.mimetype.startsWith("image/")){
            throw new AppError(400, "Type of file is not supported. Only images are allowed")
        }
        if(file.size > maxSize){
            throw new AppError(400, "Size of file too big (max 5MB)")
        }
    }

    next();
}