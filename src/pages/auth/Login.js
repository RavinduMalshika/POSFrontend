import { Link, resolvePath, useNavigate } from 'react-router-dom';
import logo from '../../resources/logo.png';
import axios from 'axios';
import { useEffect, useLayoutEffect } from 'react';

const Login = () => {
    const navigate = useNavigate();

    useLayoutEffect(() => {
        document.body.style.backgroundColor = "lightgreen"
    });

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = () => {
        const token = localStorage.getItem("token");
        if (token !== null) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            getUserFromToken();
        } else {
            localStorage.removeItem("cart");
        }
    }

    const loginButtonClick = async (event) => {
        event.preventDefault();

        var email = document.getElementById("emailField").value;
        var password = document.getElementById("passwordField").value;

        const data = {
            "email": email,
            "password": password
        }

        const response = await axios
            .post("http://localhost:8080/auth/login", data)
            .catch(error => { console.log(error) });

        if (response && response.status === 200) {
            localStorage.setItem("token", response.data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data}`;
            console.log("Valid");

            getUserFromToken();
        } else {
            console.log("Invalid");
        }
    }

    const registerButtonClick = (event) => {
        event.preventDefault();

        navigate("/register");
    }

    const getUserFromToken = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/customer/token`).catch((error) => {
                console.log(error);
                localStorage.removeItem("token");
                return;
            });
            if (response.data === "") {
                navigate("/manage-inventory");
            } else {
                navigate("/home")
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="d-flex flex-column align-content-stretch" style={{ height: "100%" }}>
            <nav className="flex-row navbar navbar-expand-sm bg-body-tertiary">
                <div className="container-fluid">
                    <div className="navbar-header mx-auto">
                        <img className="navbar-brand m-0 p-0 pe-3" src={logo} height={40} alt="CarHire" />
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/home">Browse</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/about-us">About Us</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/contact-us">Contact Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="d-flex flex-column flex-md-row">
                <div className="m-5 p-5 flex-fill order-last order-md-first" >
                    <h1>Super Store</h1>
                    <h2>Best Store for all your needs</h2>
                    <button className="btn btn-success" onClick={function () {navigate("/home")}}>Browse Store</button>
                </div>

                <div className="login-box bg-light m-5 p-5 flex-fill order-first order-md-last rounded align-items-center">
                    <form>
                        <div className="form-group mb-3">
                            <input type="text" className="form-control" placeholder="Email" id="emailField"></input>
                        </div>
                        <div className="form-group mb-3">
                            <input type="password" className="form-control" placeholder="Password" id="passwordField"></input>
                        </div>
                        <div className="d-grid gap-2 col-md-6 col-8 mx-auto">
                            <button className="btn btn-primary" id="loginBtn" onClick={loginButtonClick}>Login</button>
                        </div>
                        <div className="text-center">
                            <Link to="/signup">Forgotten password?</Link>
                        </div>
                        <hr />
                        <div>
                            <button className="btn btn-success d-grid gap-2 col-md-6 col-8 mx-auto" onClick={registerButtonClick}>Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;