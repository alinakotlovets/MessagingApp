import type {Request, Response} from "express";
import {userServices} from "../services/userService.js";
import {AppError} from "../utils/AppError.js";
import {getUserIdOrError} from "../services/userHelpers.js";
import {uploadImage} from "../utils/uploadImage.js";

export async function searchUsers(req: Request, res:Response){
    const username = req.query.username;
    if(!username) throw new AppError(400, "Username is required");
    const users = await userServices.findUsersByUsername(username.toString());
    res.status(200).json({users});
}

export async function updateUser(req:Request, res:Response){
    const {displayName} = req.body;
    const rawUserId = req.params.userId;
    const userId = Number(rawUserId);
    if(isNaN(userId)) throw new AppError(400, "User id is invalid");

    const userInDb = await userServices.getUserById(userId);
    if(!userInDb) throw new AppError(404, "User with this id not found");

    const currentUserId = getUserIdOrError(req);
    if(currentUserId!== userId) throw new AppError(403, "You cant edit other users");


    let avatar= await uploadImage(req.file, "messenger-users");
    if( avatar === null && userInDb.avatar !== null) avatar = userInDb.avatar;

    const user = await userServices.updateUser(userId, displayName, avatar);
    res.status(200).json({user});
}


export async function getUser(req:Request, res:Response){
    const userId = getUserIdOrError(req);
    const user = await userServices.getUserInfo(userId);
    if(!user) throw new AppError(404, "User not found");
    res.status(200).json({user});
}