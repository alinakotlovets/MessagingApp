import {publicUserSelect} from "./publicUserSelect.js";

export const chatWithUsersInclude = {
    chatUsers: {
        include: {
            user: {
                select: publicUserSelect
            }
        }
    }
} as const;