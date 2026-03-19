import {body} from "express-validator";
export const validateMessage = [
    body("text")
        .trim()
        .notEmpty().withMessage("message is required")
]
