import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../utils/store';

function GoogleSignInButton() {
    const navigate = useNavigate();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
    const setUserId = useAuthStore((state) => state.setUserId);
    const setIsAuthorized = useAuthStore((state) => state.setIsAuthorized);
    const triggerAuth = useAuthStore((state) => state.triggerAuth);
    const handleSuccess = async (credentialResponse) => {
        console.log("Credential Response:", credentialResponse.credential);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/google-login/`, {
                id_token: credentialResponse.credential
            }, { withCredentials: true });

            console.log("Login Success", res.data.access);
            setAccessToken(res.data.access);
            setRefreshToken(res.data.refresh);
            setUserId(res.data.user_id); // Store user ID in the store
            setIsAuthorized(true);
            triggerAuth(); // Trigger auth to update state
            navigate("/");
        } catch (err) {
            console.error("Login Failed", err.response?.data);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Login Failed")}
        />
    );
}
export default GoogleSignInButton;