import logo from '../resources/logo.png';
import avatar from '../resources/avatar.png';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ContactUs = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderCart = useRef(true);

    useEffect(() => {
        if (localStorage.getItem("token") !== null) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
            getUserFromToken();
            if (localStorage.getItem("cart") !== null) {
                let storedCart = localStorage.getItem("cart");
                setCart(JSON.parse(storedCart));
            }
        } else {
            localStorage.removeItem("cart");
        }
    }, []);

    useEffect(() => {
        if (isFirstRenderUser.current === true) {
            isFirstRenderUser.current = false;
            return;
        }
        if (user !== null) {
            setUserName(user.firstName);
        }
    }, [user]);

    useEffect(() => {
        if (isFirstRenderCart.current === true) {
            isFirstRenderCart.current = false;
            return;
        }
        updateCart();
    }, [cart]);

    const getUserFromToken = async () => {
        const response = await axios.get(`http://localhost:8080/customer/token`);

        if (response.data !== "") {
            setUser(response.data);
        }
    }

    const logoutClicked = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    const updateCart = async () => {
        let html = "";
        let total = 0;
        if (cart !== null) {
            for (let i = 0; i < cart.length; i++) {
                const response = await axios.get(`http://localhost:8080/item/${cart[i][0]}`);
                html +=
                    `<hr />` +
                    `<div class="row">` +
                    `<div class="col-10">` +
                    `<p class="fw-bold fs-5">${response.data.name}</p>` +
                    `<p>Price: Rs.${response.data.price}</p>` +
                    `<p>Quantity: ${cart[i][1]}</p>` +
                    `</div>` +
                    `<div class="col-2">` +
                    `<i type="button" class="bi bi-trash text-danger fs-5"></i>` +
                    `</div>` +
                    `</div>`;
                total += (response.data.price * cart[i][1]);
            }
        }

        if (cart.length > 0) {
            html +=
                `<hr />` +
                `<p class="fw-bold">Total: Rs.${total}</p>` +
                `<div class="row justify-content-end">` +
                `<button class="col-6 btn btn-success" id="buyButton">Buy</ button>` +
                `</ div>`;
        }
        document.getElementById("cartBody").innerHTML = html;

        const deleteButtons = document.getElementsByClassName("bi-trash");
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener("click", function () {
                cart.splice(i, 1);
                updateCart();
            });
        }

        if (cart.length > 0) {
            document.getElementById("buyButton").addEventListener("click", purchaseOrder);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        if (cart.length === 0) {
            if (document.getElementById("cartIcon") !== null) {
                document.getElementById("cartIcon").innerHTML = `<i class="bi bi-cart fs-4 text-success"></i>`;
            }
        } else {
            if (document.getElementById("cartIcon") !== null) {
                document.getElementById("cartIcon").innerHTML = `<i class="bi bi-cart-fill fs-4 text-success"></i>`;
            }
        }
    }

    const purchaseOrder = async () => {
        const orderId = await axios.get(`http://localhost:8080/order/generateId`);



        const data = {
            "id": orderId.data,
            "date": new Date(),
            "customerId": user.id
        }
        console.log(data);

        const response = await axios.post(`http://localhost:8080/order`, data);
        if (response && response.status === 201) {
            console.log("order created");

            for (let i = 0; i < cart.length; i++) {
                const data = {
                    "orderId": orderId.data,
                    "itemId": cart[i][0],
                    "quantity": cart[i][1],
                    "discount": 0
                }

                const response = await axios.post(`http://localhost:8080/order-detail`, data);
                if (response && response.status === 201) {
                    console.log("order detail created");
                } else {
                    console.log("order detail creation failed");
                }
            }
        } else {
            console.log("order creation failed");
        }

        console.log(data);

        cart.forEach(item => {
            const data = {
                "orderId": response.data,
                "itemId": item[0],
                "quantity": item[1],
                "discount": 0
            }
            console.log(data);
        })
    }

    return (
        <div>
            <nav className="flex-row navbar navbar-expand-sm bg-body-tertiary" id="topNavBar">
                <div className="container-fluid">
                    <div className="navbar-header mx-auto">
                        <img className="navbar-brand m-0 p-0 pe-3" src={logo} height={40} alt="SuperStore" />
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>
                    {user !== null &&
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button className="nav-link py-0 d-sm-none d-block" id="cartIcon" type="button" data-bs-toggle="offcanvas" data-bs-target="#cart" aria-controls="cart">
                                    <i class="bi bi-cart fs-4 text-success"></i>
                                </button>
                            </li>
                        </ul>
                    }
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/home">Browse</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/about-us">About Us</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" to="/contact-us">Contact Us</Link>
                            </li>
                            {user === null &&
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Login</Link>
                                </li>
                            }
                            {user !== null &&
                                <li className="nav-item d-sm-none">
                                    <Link className="nav-link pb-0" to="/customer-profile">Profile</Link>
                                </li>
                            }
                            {user !== null &&
                                <li className="nav-item d-sm-none">
                                    <Link className="nav-link pb-0" to="/orders">Orders</Link>
                                </li>
                            }
                            {user !== null &&
                                <hr />
                            }
                            {user !== null &&
                                <li className="nav-item d-sm-none">
                                    <span className="nav-link text-danger pt-0" style={{ cursor: "pointer" }} onClick={logoutClicked}>Logout</span>
                                </li>
                            }
                            {user !== null &&
                                <div className="vr d-none d-sm-block"></div>
                            }
                            {user !== null &&
                                <li className="nav-item">
                                    <button className="nav-link py-0 d-none d-sm-block" id="cartIcon" type="button" data-bs-toggle="offcanvas" data-bs-target="#cart" aria-controls="cart">
                                        <i class="bi bi-cart fs-4 text-success"></i>
                                    </button>
                                </li>
                            }
                            {user !== null &&
                                <li className="nav-item">
                                    <span className="nav-link d-none d-md-block">Welcome {userName}</span>
                                </li>
                            }
                            {user !== null &&
                                <li className="nav-item dropdown d-none d-sm-block">
                                    <a className="nav-link dropdown-toggle p-0" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src={avatar} height={40} />
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><Link className="dropdown-item" to="/customer-profile">Profile</Link></li>
                                        <li><Link className="dropdown-item" to="/orders">Orders</Link></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><span className="dropdown-item text-danger" style={{ cursor: "pointer" }} onClick={logoutClicked}>Logout</span></li>
                                    </ul>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </nav>

            <div class="offcanvas offcanvas-end" tabindex="-1" id="cart" aria-labelledby="cart">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title">Cart</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body pt-0" id="cartBody">
                </div>
            </div>
        </div>
    )
}

export default ContactUs;