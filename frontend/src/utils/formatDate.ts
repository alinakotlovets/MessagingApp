export function formatDate(messageDate: string): string {
    const date = new Date(messageDate);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const isCurrentYear = date.getFullYear() === now.getFullYear();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    if (isCurrentYear) {
        return `${day}.${month}`;
    } else {
        return `${day}.${month}.${date.getFullYear()}`;
    }
}