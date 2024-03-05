import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import logo from '../resources/logo.png';
import avatar from '../resources/avatar.png';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Orders = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState(null);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderCart = useRef(true);
    const isFirstRenderOrders = useRef(true);

    useLayoutEffect(() => {
        document.body.style.backgroundColor = "lavender";
    });

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
            loadOrders();
        }
    }, [user]);

    useEffect(() => {
        if (isFirstRenderCart.current === true) {
            isFirstRenderCart.current = false;
            return;
        }
        updateCart();
    }, [cart]);

    useEffect(() => {
        if (isFirstRenderOrders.current === true) {
            isFirstRenderOrders.current = false;
            return;
        }
        loadTable();
    }, [orders]);

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

        cart.forEach(item => {
            const data = {
                "orderId": response.data,
                "itemId": item[0],
                "quantity": item[1],
                "discount": 0
            }
        })

    }

    const loadOrders = async () => {
        const response = await axios.get(`http://localhost:8080/order/${user.id}`);
        if (response && response.status === 200) {
            setOrders(response.data);
        }
    }

    const loadTable = async () => {
        let html = "";

        for (let i = 0; i < orders.length; i++) {
            const orderDetail = await axios.get(`http://localhost:8080/order-detail/order/${orders[i].id}`);
            let total = 0;

            for (let j = 0; j < orderDetail.data.length; j++) {
                const item = await axios.get(`http://localhost:8080/item/${orderDetail.data[j].itemId}`);
                total += (orderDetail.data[j].quantity * item.data.price);
            }

            html +=
                `<tr data-bs-toggle="modal" data-bs-target="#staticBackdrop">` +
                `<td>${orders[i].id}</td>` +
                `<td>${orders[i].date.split("T")[0]}</td>` +
                `<td>${total}</td>` +
                `</tr>`;
        }

        document.getElementById("tableBody").innerHTML = html;

        let rows = document.getElementsByTagName("tbody")[0].childNodes;
        rows.forEach((row) => {
            row.addEventListener("click", function () {
                loadOrderDetails(row);
            });
        })
    }

    const loadOrderDetails = async (row) => {
        let orderId = row.childNodes[0].innerHTML;
        const orderDetail = await axios.get(`http://localhost:8080/order-detail/order/${orderId}`);

        let html = "";
        for (let i = 0; i < orderDetail.data.length; i++) {
            const item = await axios.get(`http://localhost:8080/item/${orderDetail.data[i].itemId}`);

            html +=
                `<tr>` +
                `<td>${item.data.name}</td>` +
                `<td>${orderDetail.data[i].quantity}</td>` +
                `<td>${orderDetail.data[i].price}</td>` +
                `</tr>`;
        }

        document.getElementById("detailTableBody").innerHTML = html;

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
                                <Link className="nav-link" to="/contact-us">Contact Us</Link>
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
                                    <Link className="nav-link pb-0 active" to="/orders">Orders</Link>
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

            <div className="container justify-content-center my-3">
                <table className="col-10 table table-hover table-bordered">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>



            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">Order Details</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="modalBody">
                            <h1>Order ID: </h1>
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody id="detailTableBody"></tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary">Understood</button>
                        </div>
                    </div>
                </div>
            </div>

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

export default Orders;