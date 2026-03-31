import cloudinary from "./cloudinary.js";

export async function uploadImage(file: Express.Multer.File | undefined, folder: string){
    let image:string|null = null;
    if(file){
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
                folder: folder
            }
        );
        image = result.secure_url;
    }
    return image;
}