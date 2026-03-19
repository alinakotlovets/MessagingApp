import {body} from "express-validator";

export const validateRegister = [
    body("displayName")
        .trim()
        .notEmpty().withMessage("Display name is required")
        .isLength({min: 2, max: 50}).withMessage("Display name should at least 2 symbols and no more than 50 symbols"),
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({min: 2, max: 50}).withMessage("Username should at least 2 symbols and no more than 50 symbols"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is is required")
        .isEmail().withMessage("Email should be in valid format: example@emaiservice.com"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is is required")
        .isLength({min:8, max:30}).withMessage("Password should at least 2 symbols and no more than 30 symbols")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter of english alphabet")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter of english alphabet")
        .custom(value=>{
            if (/\\s/.test(value)) {
                throw new Error('No spaces are allowed in the password');
            }
            return true;
        }),
    body("confirmPassword")
        .trim()
        .notEmpty().withMessage("Confirm password is is required")
        .custom((value, {req}) =>{
            if(value !== req.body.password){
                throw new Error("Passwords do not match");
            }
            return true;
        })
]


export const validateLogin = [
    body("login")
        .trim()
        .notEmpty().withMessage("Login is required")
        .isLength({min: 2, max: 50}).withMessage("Login should at least 2 symbols and no more than 50 symbols"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is is required")
        .isLength({min:8, max:30}).withMessage("Password should at least 2 symbols and no more than 30 symbols")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter of english alphabet")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter of english alphabet")
        .custom(value=>{
            if (/\\s/.test(value)) {
                throw new Error('No spaces are allowed in the password');
            }
            return true;
        })
]


export const validateEmailVerifyCode = [
    body("code")
        .trim()
        .notEmpty().withMessage("Code is required")
        .isLength({min:6, max:6}).withMessage("Code must be 6 symbols")
        .matches(/[0-9]/).withMessage("Code must contain numbers")
        .not().isAlpha().withMessage('Code must not contain any letters.')
]