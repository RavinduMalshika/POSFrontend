import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom"

const ProtectedRoutes = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    
    if(!token) {
        navigate("/");
    } 

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return <Outlet />
}

export default ProtectedRoutes;