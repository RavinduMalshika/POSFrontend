import logo from '../logo.svg';
import avatar from '../resources/avatar.png';
import editIcon from "../resources/edit.svg";
import axios from "axios";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CustomerProfile = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [cart, setCart] = useState([]);
    const [mode, setMode] = useState("view");
    const [changePassword, setChangePassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderCart = useRef(true);
    const isFirstRenderMode = useRef(true);

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
        if (isFirstRenderMode.current === true) {
            isFirstRenderMode.current = false;
            return;
        }
        let titles = ["Mr", "Ms", "Mrs"];
        let provinces = ["Central", "Eastern", "North Central", "North Western", "Northern", "Sabaragamuwa", "Southern", "Uva", "Western"];
        let htmlTitle = "";
        let htmlProvince = "";

        titles.forEach(title => {
            if (title === user.title) {
                htmlTitle += `<option selected>${title}</option>`;
            } else {
                htmlTitle += `<option>${title}</option>`;
            }
        });
        document.getElementById("title").innerHTML = htmlTitle;

        provinces.forEach(province => {
            if (province === user.province) {
                htmlProvince += `<option selected>${province}</option>`;
            } else {
                htmlProvince += `<option>${province}</option>`;
            }
        });
        document.getElementById("province").innerHTML = htmlProvince;
    }, [mode])

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
        console.log("updateCart called");
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

    const editDetailsClicked = () => {
        setMode("edit");
        document.getElementById("firstName").disabled = false;
        document.getElementById("lastName").disabled = false;
        document.getElementById("nic").disabled = false;
        document.getElementById("address").disabled = false;
        document.getElementById("city").disabled = false;
        document.getElementById("phone1").disabled = false;
        document.getElementById("phone2").disabled = false;
    }

    const updateCustomer = async () => {
        let data = {
            "id": user.id,
            "title": document.getElementById("title").value,
            "firstName": document.getElementById("firstName").value,
            "lastName": document.getElementById("lastName").value,
            "nic": document.getElementById("nic").value,
            "address": document.getElementById("address").value,
            "city": document.getElementById("city").value,
            "province": document.getElementById("province").value,
            "phone": [
                document.getElementById("phone1").value,
                document.getElementById("phone2").value,
            ]
        };

        const response = await axios.put(`http://localhost:8080/customer/${user.id}`, data);
        if (response && response.status === 200) {
            console.log("Updated Successfully");
            setMode("view");
            document.getElementById("firstName").disabled = true;
            document.getElementById("lastName").disabled = true;
            document.getElementById("nic").disabled = true;
            document.getElementById("address").disabled = true;
            document.getElementById("city").disabled = true;
            document.getElementById("phone1").disabled = true;
            document.getElementById("phone2").disabled = true;
        } else {
            console.log("update failed");
        }
    }

    const cancelUpdate = () => {
        setMode("view");
        document.getElementById("firstName").disabled = true;
        document.getElementById("lastName").disabled = true;
        document.getElementById("nic").disabled = true;
        document.getElementById("address").disabled = true;
        document.getElementById("city").disabled = true;
        document.getElementById("phone1").disabled = true;
        document.getElementById("phone2").disabled = true;
        getUserFromToken();
    }

    const loadChangePasswordForm = () => {
        setChangePassword(true);
    }

    const updatePassword = async () => {
        let currentPassword = document.getElementById("currentPassword").value;
        let newPassword = document.getElementById("newPassword").value;
        let confirmNewPassword = document.getElementById("confirmNewPassword").value;

        let pwd_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s])(?!.*[\s]).{8,}$/gm;

        const response = await axios.post(`http://localhost:8080/customer/verify/${user.id}`, currentPassword,
            {
                headers: {
                    'Content-Type': 'application/text'
                }
            });
        if (response.data === true) {
            if (pwd_regex.test(newPassword)) {
                if (newPassword !== "" && newPassword === confirmNewPassword) {
                    const data = {
                        "password": newPassword
                    };
                    const response = await axios.put(`http://localhost:8080/customer/password/${user.id}`, data);
                    if (response && response.status === 200) {
                        console.log("Password Changed");
                        setChangePassword(false);
                        setErrorMessage("");
                    }
                } else {
                    setErrorMessage("Password Confirmation Incorrect");
                }
            } else {
                setErrorMessage("Password must have at leasts 8 characters, and contain uppercase, lowercase, numeric and special characters")
            }
        } else {
            setErrorMessage("Current password entered is Incorrect");
        }
    }

    const cancelChangePassword = () => {
        setChangePassword(false);
    }

    return (
        <div>
            <nav className="flex-row navbar navbar-expand-sm bg-body-tertiary w100" id="topNavBar">
                <div className="container-fluid">
                    <div className="navbar-header mx-auto">
                        <img className="navbar-brand m-0 p-0 pe-3" src={logo} height={40} alt="SuperStore" />
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
                                <Link className="nav-link active" to="/contact-us">Contact Us</Link>
                            </li>
                            {user === null &&
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Login</Link>
                                </li>
                            }
                            {user !== null &&
                                <li className="nav-item d-sm-none">
                                    <Link className="nav-link pb-0" to="/employee-profile">Profile</Link>
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
                                    <button className="nav-link py-0" id="cartIcon" type="button" data-bs-toggle="offcanvas" data-bs-target="#cart" aria-controls="cart">
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
                                        <li><Link className="dropdown-item" to="/employee-profile">Profile</Link></li>
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

            {user !== null &&
                <div className="row justify-content-center m-auto">
                    <div className="border border-white rounded m-3 p-3 col-lg-8 col-md-10 col-11">
                        <div className="d-flex mb-3">
                            <h1 className="col">Personal Information</h1>
                            {mode === "view" &&
                                <div>
                                    <img className="float-end" src={editIcon} height={30} onClick={editDetailsClicked} style={{ cursor: "pointer" }} />
                                </div>
                            }
                        </div>
                        <div className="row">
                            {mode === "edit" &&
                                <div className="col-md-2 col-12 form-floating">
                                    <select className="form-select mb-3" id="title" ></select>
                                    <label className="ms-2 form-label">Title</label>
                                </div>
                            }
                            {mode === "view" &&
                                <div class="col-md-2 col-12 form-floating mb-3">
                                    <input type="text" class="form-control" id="title" placeholder="" defaultValue={user !== null && user.title} disabled required />
                                    <label class="form-label ms-2">Title</label>
                                </div>
                            }

                            <div class="col-md-5 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="firstName" placeholder="" defaultValue={user !== null && user.firstName} disabled required />
                                <label class="form-label ms-2">First Name</label>
                            </div>

                            <div class="col-md-5 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="lastName" placeholder="" defaultValue={user !== null && user.lastName} disabled required />
                                <label class="form-label ms-2">Last Name</label>
                            </div>

                            <div class="col-md-6 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="nic" placeholder="" defaultValue={user !== null && user.nic} disabled required />
                                <label class="form-label ms-2">NIC</label>
                            </div>

                            <div class="col-md-6 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="address" placeholder="" defaultValue={user !== null && user.address} disabled required />
                                <label class="form-label ms-2">Address</label>
                            </div>

                            <div class="col-md-6 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="city" placeholder="" defaultValue={user !== null && user.city} disabled required />
                                <label class="form-label ms-2">City</label>
                            </div>

                            {mode === "edit" &&
                                <div className="col-md-6 col-12 form-floating">
                                    <select className="form-select mb-3" id="province">
                                    </select>
                                    <label className="ms-2 form-label">Province</label>
                                </div>
                            }
                            {mode === "view" &&
                                <div class="col-md-6 col-12 form-floating mb-3">
                                    <input type="text" class="form-control" id="province" placeholder="" defaultValue={user !== null && user.province} disabled required />
                                    <label class="form-label ms-2">Province</label>
                                </div>
                            }

                            <div class="col-md-6 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="phone1" placeholder="" defaultValue={user.phone[0]} disabled required />
                                <label class="form-label ms-2">Phone 1</label>
                            </div>

                            <div class="col-md-6 col-12 form-floating mb-3">
                                <input type="text" class="form-control" id="phone2" placeholder="" defaultValue={user.phone[1]} disabled required />
                                <label class="form-label ms-2">Phone 2</label>
                            </div>
                        </div>
                        {mode === "edit" &&
                            <div className="row justify-content-end">
                                <button className="col-3 btn btn-success me-2" onClick={updateCustomer}>Update</button>
                                <button className="col-3 btn btn-danger me-2" onClick={cancelUpdate}>Cancel</button>
                            </div>
                        }
                    </div>
                </div>
            }

            <div className="row justify-content-center m-auto">
                <div className="border border-white rounded m-3 p-3 col-lg-8 col-md-10 col-11">
                    <h1 className="mb-3">Change Password</h1>
                    <div className="row justify-content-center">
                        {changePassword === false &&
                            <button className="btn btn-warning col-6" onClick={loadChangePasswordForm}>Change Password</button>
                        }
                        {changePassword === true &&
                            <div>
                                <div className="row">
                                    <div class="col-md-4 col-12 form-floating mb-3">
                                        <input type="password" class="form-control" id="currentPassword" placeholder="" required />
                                        <label class="form-label ms-2">Current Password</label>
                                    </div>
                                    <div class="col-md-4 col-12 form-floating mb-3">
                                        <input type="password" class="form-control" id="newPassword" placeholder="" required />
                                        <label class="form-label ms-2">New Password</label>
                                    </div>
                                    <div class="col-md-4 col-12 form-floating mb-3">
                                        <input type="password" class="form-control" id="confirmNewPassword" placeholder="" required />
                                        <label class="form-label ms-2">Confirm New Password</label>
                                    </div>
                                </div>
                                <div className="row justify-content-end">
                                    <button className="col-3 btn btn-success me-2" onClick={updatePassword}>Update</button>
                                    <button className="col-3 btn btn-danger me-2" onClick={cancelChangePassword}>Cancel</button>
                                </div>
                                <p>{errorMessage}</p>
                            </div>
                        }
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

export default CustomerProfile;