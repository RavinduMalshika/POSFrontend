import axios from "axios";
import logo from "../logo.svg";
import avatar from "../resources/avatar.png"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ManageInventory = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();

    const isFirstRender = useRef(true);

    useLayoutEffect(() => {
        document.body.style.backgroundColor = "lightblue"
    });

    useEffect(() => {
        getUserFromToken();
    }, [])

    useEffect(() => {
        if (isFirstRender.current === true) {
            isFirstRender.current = false;
            return;
        }
        setUserName(user.firstName);
    }, [user])

    const getUserFromToken = async () => {
        const response = await axios.get(`http://localhost:8080/employee/token`);

        if (response.data === "") {
            navigate("/");
        } else {
            setUser(response.data);
        }
    }

    return (
        <div>
            <nav className="flex-row navbar navbar-expand-sm bg-body-tertiary">
                <div className="container-fluid">
                    <div className="navbar-header mx-auto">
                        <img className="navbar-brand m-0 p-0 pe-3" src={logo} height={40} alt="SuperStore" />
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-1 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" to="/manage-inventory">Manage Inventory</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/manage-employees">Manage Employees</Link>
                            </li>
                            <li className="nav-item d-sm-none">
                                <Link class="nav-link pb-0" to="/employee-profile">Profile</Link>
                            </li>
                            <hr />
                            <li className="nav-item d-sm-none">
                                <span class="nav-link text-danger pt-0" style={{ cursor: "pointer"}}>Logout</span>
                            </li>
                            <div class="vr d-none d-sm-block"></div>
                            <li className="nav-item">
                                <span className="nav-link d-none d-md-block">Welcome {userName}</span>
                            </li>
                            <li class="nav-item dropdown d-none d-sm-block">
                                <a class="nav-link dropdown-toggle p-0" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={avatar} height={40} />
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><Link class="dropdown-item" to="/employee-profile">Profile</Link></li>
                                    <li><hr class="dropdown-divider" /></li>
                                    <li><span class="dropdown-item text-danger" style={{ cursor: "pointer"}}>Logout</span></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default ManageInventory;