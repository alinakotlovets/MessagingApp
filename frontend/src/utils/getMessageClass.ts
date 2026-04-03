import type {Message} from "../types/Message.ts";
import type {User} from "../types/User.ts";

export function getMessageClass(message: Message, currentUser: User) {
    const classes = ["message-item"];
    if (message.senderId === currentUser?.id) {
        classes.push("own");
    } else {
        classes.push("other");
    }

    if (message.type === "IMAGE") {
        classes.push("image");
    } else {
        classes.push("text");
    }
    return classes.join(" ");
}