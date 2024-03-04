import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import avatar from "../resources/avatar.png"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";

const ManageEmployees = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [searchedEmployee, setSearchedEmployee] = useState(null);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderEmployee = useRef(true);

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
        if (isFirstRenderEmployee.current === true) {
            isFirstRenderEmployee.current = false;
            return;
        }
        if(user.id === searchedEmployee.id) {
            document.getElementById("updateButton").disabled = true;
            document.getElementById("deleteButton").disabled = true;
        } else if( searchedEmployee.accessLevel >= user.accessLevel || user.accessLevel !== 5) {
            document.getElementById("updateButton").disabled = true;
            document.getElementById("deleteButton").disabled = true;
        } else {
            document.getElementById("updateButton").disabled = false;
            document.getElementById("deleteButton").disabled = false;
        }
    }, [searchedEmployee])

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

    const searchEmployee = async (event) => {
        event.preventDefault();
        const response = await axios.get(`http://localhost:8080/employee/${document.getElementById("searchField").value}`);
        setSearchedEmployee(response.data);

        
    }

    const updateButtonClicked = () => {
        document.getElementById("form").innerHTML =
            `<div class="offcanvas-header">` +
            `<h5 class="offcanvas-title" id="staticBackdropLabel">Update Employee</h5>` +
            `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
            `</div>` +
            `<div class="offcanvas-body">` +
            `<form>` +
            `<div class="form-floating mb-3">` +
            `<input type="text" class="form-control" id="accessLevel" placeholder="" value=${searchedEmployee.accessLevel} required />` +
            `<label class="form-label">Access Level</label>` +
            `</div>` +
            `<div class="form-floating mb-3">` +
            `<input type="text" class="form-control" id="jobTitle" placeholder="" value=${searchedEmployee.jobTitle} required />` +
            `<label class="form-label">Job Title</label>` +
            `</div>` +
            `</form>` +
            `</div>`;

        document.getElementById("formButton").innerHTML = "Update";
        document.getElementById("formButton").onclick = updateEmployee;
    }

    const updateEmployee = async () => {
        let accessLevel = document.getElementById("accessLevel").value;
        let jobTitle = document.getElementById("jobTitle").value;

        let data = {
            "id": searchedEmployee.id,
            "title": searchedEmployee.title,
            "firstName": searchedEmployee.firstName,
            "lastName": searchedEmployee.lastName,
            "nic": searchedEmployee.nic,
            "address": searchedEmployee.address,
            "city": searchedEmployee.city,
            "province": searchedEmployee.province,
            "accessLevel": accessLevel,
            "jobTitle": jobTitle,
            "phone": [
                searchedEmployee.phone[0],
                searchedEmployee.phone[1],
            ]
        };

        const response = await axios.put(`http://localhost:8080/employee/${searchedEmployee.id}`, data);
        if (response && response.status === 200) {
            console.log("Updated Successfully");
            const response = await axios.get(`http://localhost:8080/employee/${searchedEmployee.id}`);
            setSearchedEmployee(response.data);
            document.getElementById("closeButton").click();
        } else {
            console.log("update failed");
        }
    }

    const deleteButtonClicked = () => {
        document.getElementById("form").innerHTML =
            `<div class="offcanvas-header">` +
            `<h5 class="offcanvas-title" id="staticBackdropLabel">Update Employee</h5>` +
            `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
            `</div>` +
            `<div class="offcanvas-body">` +
            `<p>Are you sure?</p>` +
            `</div>`;

        document.getElementById("formButton").innerHTML = "Delete";
        document.getElementById("formButton").onclick = deleteEmployee;
    }

    const deleteEmployee = async () => {
        const response = await axios.delete(`http://localhost:8080/employee/${searchedEmployee.id}`);
        if (response && response.status === 200) {
            console.log("Deleted Successfully");
            setSearchedEmployee(null);
            document.getElementById("closeButton").click();
        } else {
            console.log("Delete failed");
        }
    }

    const createEmployeeClicked = () => {
        navigate("/create-employee");
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
                                <Link className="nav-link active" to="/manage-employees">Manage Employees</Link>
                            </li>
                            <li className="nav-item d-sm-none">
                                <Link className="nav-link pb-0" to="/employee-profile">Profile</Link>
                            </li>
                            <hr />
                            <li className="nav-item d-sm-none">
                                <span className="nav-link text-danger pt-0" style={{ cursor: "pointer" }} onClick={logoutClicked} >Logout</span>
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

            <div className="row m-3">
                <form class="d-flex justify-content-center w-100" role="search" onSubmit={searchEmployee}>
                    <input class="me-2 col-md-3 col-4" id="searchField" type="search" placeholder="Search" aria-label="Search" />
                    <button class="btn btn-outline-success col-md-3 me-2 col-4" type="submit">Search</button>
                    <button className="btn btn-primary col-md-3 col-4" onClick={createEmployeeClicked}>Create</button>
                </form>

                {searchedEmployee === "" &&
                    <p className="row justify-content-center my-5">Employee Not Found</p>
                }
                {searchedEmployee !== null && searchedEmployee !== "" &&
                    <div>
                        <div className="border border-white rounded mt-3 p-3">
                            <div className="row">
                                <p className="col-6 col-md-3 m-0">Employee ID:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.id}</p>
                                <hr className="d-md-none mt-3" />
                                <p className="col-6 col-md-3 m-0">Access Level:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.accessLevel}</p>
                            </div>
                            <hr />
                            <div className="row">
                                <p className="col-3 m-0">Name:</p>
                                <p className="col-9 m-0">{searchedEmployee.title}. {searchedEmployee.firstName} {searchedEmployee.lastName}</p>
                            </div>
                            <hr />
                            <div className="row">
                                <p className="col-6 col-md-3 m-0">Job Title:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.jobTitle}</p>
                                <hr className="d-md-none mt-3" />
                                <p className="col-6 col-md-3 m-0">NIC:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.nic}</p>
                            </div>
                            <hr />
                            <div className="row">
                                <p className="col-3 m-0">Address:</p>
                                <p className="col-9 m-0">{searchedEmployee.address}, {searchedEmployee.city}, {searchedEmployee.province}</p>
                            </div>
                            <hr />
                            <div className="row">
                                <p className="col-3 m-0">Email:</p>
                                <p className="col-9 m-0">{searchedEmployee.email}</p>
                            </div>
                            <hr />
                            <div className="row">
                                <p className="col-6 col-md-3 m-0">Phone 1:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.phone[0]}</p>
                                <hr className="d-md-none mt-3" />
                                <p className="col-6 col-md-3 m-0">Phone 2:</p>
                                <p className="col-6 col-md-3 m-0">{searchedEmployee.phone[1]}</p>
                            </div>
                        </div>
                        <div className="row justify-content-end">
                            <button className="col-3 btn btn-success m-3" id="updateButton" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasForm" aria-controls="offcanvasForm" onClick={updateButtonClicked}>Update</button>
                            <button className="col-3 btn btn-danger m-3" id="deleteButton" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasForm" aria-controls="offcanvasForm" onClick={deleteButtonClicked}>Delete</button>
                        </div>
                        <div class="offcanvas offcanvas-end" data-bs-backdrop="static" tabIndex="-1" id="offcanvasForm" aria-labelledby="staticBackdropLabel">
                            <div id="form">
                            </div>
                            <div class="d-flex justify-content-end me-3">
                                <button class="btn btn-primary" id="formButton"></button>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}

export default ManageEmployees;