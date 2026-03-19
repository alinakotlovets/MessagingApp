import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import VerifiedRoute from "./components/VerifiedRoute.tsx";

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
    }
]

export default routes;