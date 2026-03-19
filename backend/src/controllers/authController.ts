import {userServices} from "../services/userService.js";
import type { Request, Response } from "express";
import {AppError} from "../utils/AppError.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js";
import {verifyEmailServices} from "../services/userService.js";
import {getUserIdOrError, generateAndSendCode} from "../services/userHelpers.js"
import {generateToken} from "../utils/genereteToken.js";
export async function registerUser(req: Request, res: Response){
    let {displayName, username, email, password} = req.body;
    const usernameInDb = await userServices.getUserByUsername(username);
    if(usernameInDb){
        throw new AppError( 400, "Username already exists")
    }

    const emailInDb = await userServices.getUserByEmail(email);
    if(emailInDb){
        throw new AppError(400, "Email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatar:string|null = null;
    if(req.file){
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "messenger-users"
            }
        );
        avatar = result.secure_url;
    }

    const user = await userServices.addUser(displayName, username, email, avatar, hashedPassword);
    const token = generateToken(user);
    await generateAndSendCode(user.id, user.email, user.displayName);
    res.status(201).json({token})
}

export async function loginUser(req:Request, res:Response){
    const {login, password} = req.body;
    const user = await userServices.getUserByLogin(login);

    if(!user){
        throw new AppError(404, "User with this login not found");
    }
    const match = await  bcrypt.compare(password, user.password);
    if(match){
        const token = generateToken(user);
        res.status(200).json({token})
    } else {
        throw new AppError(400, "Password is incorrect");
    }
}


export async function verifyEmail(req:Request, res:Response){
    const {code} = req.body;
    const userId = getUserIdOrError(req);

    const user = await userServices.getUserById(userId);
    if(user && user.isVerified === true){
        throw new AppError(500, "Your email already verify");
    }

    const codeFromDb= await verifyEmailServices.getUserCode(userId);
    if (!codeFromDb) {
        throw new AppError(400, "No verification code found. Request a new one.");
    }

    const now = new Date();
    const expiryDate = new Date(codeFromDb.createtAt.getTime() + codeFromDb.expiersAr * 60 * 1000);
    if(code !== codeFromDb.code){
        throw new AppError(400, "Code is wrong")
    }

    if(now > expiryDate){
        throw new AppError(400, "Code expires get new one")
    }

    await verifyEmailServices.usedCode(code, userId);
    await userServices.userVerifyEmail(userId);
    res.status(200).json({message: "Email verify successfully"})
}

export async function resendEmail(req: Request, res: Response){
    let userId = getUserIdOrError(req);
    let email = null;
    let displayName = null;
    if(req.user){
        email = req.user.email;
        displayName = req.user.displayName;
    }
    if(!email || !displayName){
        throw new AppError(500, "Something went wrong with registration")
    }

    const user = await userServices.getUserById(userId);
    if(user && user.isVerified === true){
        throw new AppError(400, "Your email already verify");
    }

    res.status(200).json({message: "Code resend successfully"})
}


export async function getEmailStatus(req:Request, res:Response){
    let userId = getUserIdOrError(req);
    const user = await userServices.getUserById(userId);
    if(user && user.isVerified === false){
        throw new AppError(401, "Your email is not verify");
    }

    res.status(200).json({message: "Your email is verify"})
}