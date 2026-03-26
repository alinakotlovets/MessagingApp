import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";

export async function searchUsers(req: Request, res:Response){
    const username = req.query.username;
    if(!username) throw new AppError(400, "Username is required");
    const users = await userServices.findUsersByUsername(username.toString());
    res.status(200).json({users});
}
