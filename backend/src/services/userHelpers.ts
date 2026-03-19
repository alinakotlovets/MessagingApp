import type {Request} from "express";
import {AppError} from "../utils/AppError.js";
import {userServices, verifyEmailServices} from "./userService.js";
import generateCode from "../utils/generateCode.js";
import {sendMessage} from "./sendEmail.js";

export function getUserIdOrError(req:Request) {
    if(!req.user) throw new AppError(401, "You are unauthorized");
    return req.user.id;
}

export async function generateAndSendCode(userId: number, email: string, displayName: string) {
    const code = `${generateCode()}`;
    const codeInDb = await verifyEmailServices.addCode(code, userId);
    await sendMessage(codeInDb.code, email, displayName);
}