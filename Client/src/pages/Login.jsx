"use client"
import AuthForm from "../components/AuthForm"

const Login = () => {
    return (

        <AuthForm method={"login"} route={"/api/token/"} />

    )
}

export default Login;
