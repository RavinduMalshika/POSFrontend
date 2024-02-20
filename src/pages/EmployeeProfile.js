import axios from "axios";
import logo from "../logo.svg";
import avatar from "../resources/avatar.png";
import editIcon from "../resources/edit.svg";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [mode, setMode] = useState("view");
    const [changePassword, setChangePassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderMode = useRef(true);

    useLayoutEffect(() => {
        document.body.style.backgroundColor = "lightblue"
    });

    useEffect(() => {
        getUserFromToken();
    }, [])

    useEffect(() => {
        if (isFirstRenderUser.current === true) {
            isFirstRenderUser.current = false;
            return;
        }
        setUserName(user.firstName);
    }, [user])

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
        const response = await axios.get(`http://localhost:8080/employee/token`);

        if (response.data === "") {
            navigate("/");
        } else {
            setUser(response.data);
        }
    }

    const logoutClicked = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    const editDetailsClicked = () => {
        setMode("edit");
        document.getElementById("firstName").readonly = false;
        document.getElementById("lastName").readonly = false;
        document.getElementById("nic").readonly = false;
        document.getElementById("address").readonly = false;
        document.getElementById("city").readonly = false;
        document.getElementById("phone1").readonly = false;
        document.getElementById("phone2").readonly = false;
    }

    const updateEmployee = async () => {
        let data = {
            "id": user.id,
            "title": document.getElementById("title").value,
            "firstName": document.getElementById("firstName").value,
            "lastName": document.getElementById("lastName").value,
            "nic": document.getElementById("nic").value,
            "address": document.getElementById("address").value,
            "city": document.getElementById("city").value,
            "province": document.getElementById("province").value,
            "accessLevel": user.accessLevel,
            "jobTitle": user.jobTitle,
            "phone": [
                document.getElementById("phone1").value,
                document.getElementById("phone2").value,
            ]
        };

        const response = await axios.put(`http://localhost:8080/employee/${user.id}`, data);
        if (response && response.status === 200) {
            console.log("Updated Successfully");
            setMode("view");
            document.getElementById("firstName").readonly = true;
            document.getElementById("lastName").readonly = true;
            document.getElementById("nic").readonly = true;
            document.getElementById("address").readonly = true;
            document.getElementById("city").readonly = true;
            document.getElementById("phone1").readonly = true;
            document.getElementById("phone2").readonly = true;
            getUserFromToken();
        } else {
            console.log("update failed");
        }
    }

    const cancelUpdate = () => {
        setMode("view");
    }

    const loadChangePasswordForm = () => {
        setChangePassword(true);
    }

    const updatePassword = async () => {
        let currentPassword = document.getElementById("currentPassword").value;
        let newPassword = document.getElementById("newPassword").value;
        let confirmNewPassword = document.getElementById("confirmNewPassword").value;

        let pwd_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s])(?!.*[\s]).{8,}$/gm;

        const response = await axios.post(`http://localhost:8080/employee/verify/${user.id}`, currentPassword,
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
                    const response = await axios.put(`http://localhost:8080/employee/password/${user.id}`, data);
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
                                <Link className="nav-link" to="/manage-inventory">Manage Inventory</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/manage-employees">Manage Employees</Link>
                            </li>
                            <li className="nav-item d-sm-none">
                                <Link className="nav-link pb-0" to="/employee-profile">Profile</Link>
                            </li>
                            <hr />
                            <li className="nav-item d-sm-none">
                                <span className="nav-link text-danger pt-0" style={{ cursor: "pointer" }} onClick={logoutClicked}>Logout</span>
                            </li>
                            <div className="vr d-none d-sm-block"></div>
                            <li className="nav-item">
                                <span className="nav-link d-none d-md-block">Welcome {userName}</span>
                            </li>
                            <li className="nav-item dropdown d-none d-sm-block">
                                <a className="nav-link dropdown-toggle p-0" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={avatar} height={40} />
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/employee-profile">Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><span className="dropdown-item text-danger" style={{ cursor: "pointer" }} onClick={logoutClicked}>Logout</span></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="row justify-content-center">
                <div className="border border-white rounded m-3 p-3 col-lg-8 col-md-10 col-11">
                    <h1 className="mb-3">Official Information</h1>
                    <div className="row">
                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="id" placeholder="" value={user !== null && user.id} readonly required />
                            <label class="form-label ms-2">Employee ID</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="id" placeholder="" value={user !== null && user.accessLevel} readonly required />
                            <label class="form-label ms-2">Access Level</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="id" placeholder="" value={user !== null && user.jobTitle} readonly required />
                            <label class="form-label ms-2">Job Title</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="id" placeholder="" value={user !== null && user.email} readonly required />
                            <label class="form-label ms-2">Email</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
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
                                <input type="text" class="form-control" id="title" placeholder="" value={user !== null && user.title} readonly required />
                                <label class="form-label ms-2">Title</label>
                            </div>
                        }

                        <div class="col-md-5 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="firstName" placeholder="" value={user !== null && user.firstName} readonly required />
                            <label class="form-label ms-2">First Name</label>
                        </div>

                        <div class="col-md-5 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="lastName" placeholder="" value={user !== null && user.lastName} readonly required />
                            <label class="form-label ms-2">Last Name</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="nic" placeholder="" value={user !== null && user.nic} readonly required />
                            <label class="form-label ms-2">NIC</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="address" placeholder="" value={user !== null && user.address} readonly required />
                            <label class="form-label ms-2">Address</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="city" placeholder="" value={user !== null && user.city} readonly required />
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
                                <input type="text" class="form-control" id="province" placeholder="" value={user !== null && user.province} readonly required />
                                <label class="form-label ms-2">Phone 1</label>
                            </div>
                        }

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="phone1" placeholder="" value={user !== null && user.phone[0]} readonly required />
                            <label class="form-label ms-2">Phone 1</label>
                        </div>

                        <div class="col-md-6 col-12 form-floating mb-3">
                            <input type="text" class="form-control" id="phone2" placeholder="" value={user !== null && user.phone[1]} readonly required />
                            <label class="form-label ms-2">Phone 2</label>
                        </div>
                    </div>
                    {mode === "edit" &&
                        <div className="row justify-content-end">
                            <button className="col-3 btn btn-success me-2" onClick={updateEmployee}>Update</button>
                            <button className="col-3 btn btn-danger me-2" onClick={cancelUpdate}>Cancel</button>
                        </div>
                    }
                </div>
            </div>

            <div className="row justify-content-center">
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
        </div>
    )
}

export default EmployeeProfile;