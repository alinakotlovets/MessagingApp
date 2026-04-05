import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import VerifiedRoute from "./components/VerifiedRoute.tsx";
import {ErrorPage} from "./pages/ErrorPage.tsx";

const routes = [
    {
        path: "/",
        element: (
            <VerifiedRoute>
                <HomePage/>
            </VerifiedRoute>)

    },
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        path: "/register",
        element: <RegisterPage/>
    },
    {
        path: "/verify-email",
        element: <VerifyEmail/>
    },
    {
        path: "*",
        element: <ErrorPage code={404} message="Сторінку не знайдено" />
    }
]

export default routes;