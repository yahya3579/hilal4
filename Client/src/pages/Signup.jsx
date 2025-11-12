"use client"
import AuthForm from "../components/AuthForm"


const SignUp = () => {

    return (

        <AuthForm method={"signup"} route={"/api/user/register/"} />

    )
}

export default SignUp;
