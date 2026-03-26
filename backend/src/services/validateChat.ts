import {body, type ValidationChain} from "express-validator";
import type {IsEmptyOptions} from "express-validator/lib/options.js";
import {AppError} from "../utils/AppError.js";

export const validateChat = [
    body("userId")
        .notEmpty().withMessage("User is is required")
   ]


export const validateGroupChat = [
    body("name")
        .trim()
        .notEmpty().withMessage("Chat name is required")
        .isLength({ min: 1, max: 50 }).withMessage("Chat name must be 1-50 symbols"),
    body("usersId")
        .custom((value) => {
            if (!Array.isArray(value)) throw new Error("Users must be an array");
            if (value.length < 1) throw new Error("Need at least one user to create chat");
            const isArrayOfNum = value.every((item: any) => typeof item === "number");
            if (!isArrayOfNum) throw new Error( "All user IDs must be numbers");
            return true;
        })
];