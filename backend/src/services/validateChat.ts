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
        .customSanitizer((value) => {
            try {
                return JSON.parse(value);
            } catch {
                throw new Error("usersId must be a valid JSON array");
            }
        })
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error("Users must be an array");
            }

            if (value.length < 1) {
                throw new Error("Need at least one user");
            }

            if (!value.every(id => typeof id === "number")) {
                throw new Error("All user IDs must be numbers");
            }

            return true;
        })
];

export const validateAddUserToGroupChat = [
    body("chatId")
        .notEmpty().withMessage("Chat id is required")
        .isInt().withMessage("Chat id must be a number"),
    body("usersId")
        .customSanitizer((value) => {
            try {
                return JSON.parse(value);
            } catch {
                throw new Error("usersId must be a valid JSON array");
            }
        })
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error("Users must be an array");
            }
            if (value.length < 1) {
                throw new Error("Need at least one user");
            }
            if (!value.every(id => typeof id === "number")) {
                throw new Error("All user IDs must be numbers");
            }
            return true;
        })
]