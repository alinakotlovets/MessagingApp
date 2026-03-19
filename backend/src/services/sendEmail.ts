import sgMail from "@sendgrid/mail";
import {AppError} from "../utils/AppError.js";

export  async function sendMessage(code: string, email: string, displayName: string) {
    if(!process.env.SENDGRID_API_KEY){
        throw new AppError(501,"Sendgrid does not have the required settings")
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const data = await sgMail.send({
            to: email,
            from: "alinakotlovec@gmail.com",
            templateId: process.env.SENDGRID_TEMPLATE_ID!,
            dynamic_template_data: {
                displayName,
                code
            }
        } as any);

        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
