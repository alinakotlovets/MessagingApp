
export default async function Client( link: string,
    method: "GET" | "POST" | "PUT" | "DELETE",  body?: string | FormData ): Promise<any> {
    try {
        const token = localStorage.getItem("token");

        const options: RequestInit = {method};
        const headers: Record<string, string> = {};
        if(token){
            headers["Authorization"] = `Bearer ${token}`;
        }

        if (body && !(body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        options.headers = headers;
        if(body && method !== "GET"){
         options.body = body;
        }

        const response = await fetch(`http://localhost:3000${link}`, options);

        return response.json();

    } catch (e){
        let error: string = "Something went wrong!";
        if(typeof e === "string"){
            error = e;
        } else if (e instanceof TypeError) {
            error = e.message;
        }
        return {messages: [error]};
    }
}
