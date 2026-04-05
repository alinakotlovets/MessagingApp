import "./ErrorPage.css";

export function ErrorPage({ code = 500, message = "Щось пішло не так" }) {
    return (
        <div className="error-page">
            <span className="error-code">{code}</span>
            <h1 className="error-title">Something went wrong...</h1>
            <p className="error-message">{message}</p>
            <button className="error-btn" onClick={() => window.location.href = "/"}>
                Main page
            </button>
        </div>
    );
}