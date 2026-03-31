import {prisma} from "../../lib/prisma.js";
import type {Code, User} from "../../generated/prisma/client.js"
import type {PublicUser} from "../types/PublicUser.js";
import {publicUserSelect} from "../utils/publicUserSelect.js";
export const userServices = {
    addUser: async (displayName: string, username: string, email: string, avatar: string | null, password: string) :Promise<User> =>
        prisma.user.create({data: {displayName, username, email, avatar, password}}),
    getUserByUsername: async (username: string) :Promise<User | null> =>
        prisma.user.findUnique({where: {username}}),
    getUserByEmail: async(email: string) :Promise<User | null> =>
        prisma.user.findUnique({where:{email}}),
    getUserByLogin: async (login: string): Promise<User | null> =>
        prisma.user.findFirst({
            where: {
                OR: [
                    { username: login },
                    { email: login }
                ]
            }
        }),
    userVerifyEmail: async(userId: number) :Promise<User | null> =>
        prisma.user.update({where:{id: userId}, data:{isVerified: true}}),
    getUserById: async(userId: number) :Promise<User | null> =>
        prisma.user.findUnique({where:{id: userId}}),
    findUsersByUsername: async(username: string):Promise <PublicUser[]> =>
        prisma.user.findMany(
            {where: {
                username: {
                    contains: username,
                    mode: 'insensitive'
                }
            }, select: publicUserSelect,
                orderBy: {
                    username: "asc"
                },
                take: 10
            }
        ),
    updateUser: async(userId:number ,displayName:string,avatar:string|null):Promise<PublicUser> =>
        prisma.user.update({where:{id:userId}, data:{displayName, avatar}, select:publicUserSelect}),
    getUserInfo: async (userId :number):Promise<PublicUser | null> =>
        prisma.user.findUnique({where:{id:userId}, select:publicUserSelect})
}

export const verifyEmailServices = {
    addCode: async(code:string, userId:number): Promise<Code> =>
    {return prisma.$transaction(async (tx)=>{
        await tx.code.updateMany({where:{userId: userId, used: false}, data:{used: true}});
        return tx.code.create({data: {code: code, userId: userId}});
    })},
    usedCode: async(code: string, userId: number) => {
        await prisma.code.updateMany({where: { userId, code, used: false }, data: { used: true }})
    },
    getUserCode: async(userId:number): Promise<Code | null> =>
        await prisma.code.findFirst({where:{userId: userId, used:false}})
}