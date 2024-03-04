import axios from "axios";
import logo from "../logo.svg";
import avatar from "../resources/avatar.png"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CreateEmployee = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [id, setId] = useState(null);
    const [jobTitle, setJobTitle] = useState(null);
    const [accessLevel, setAccessLevel] = useState(null);
    const [email, setEmail] = useState(null);
    const [title, setTitle] = useState(null);
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [nic, setNic] = useState(null);
    const [address, setAddress] = useState(null);
    const [city, setCity] = useState(null);
    const [province, setProvince] = useState(null);
    const [phone1, setPhone1] = useState(null);
    const [phone2, setPhone2] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);

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

        let html = `<option hidden selected>-Please Select-</option>`;
        for (let i = 1; i <= user.accessLevel; i++) {
            html += `<option>${i}</option>`;
        }
        document.getElementById("accessLevel").innerHTML = html;
    }, [user])

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

    const handleJobTitle = (event) => {
        setJobTitle(event.target.value);
    }

    const handleAccessLevel = (event) => {
        setAccessLevel(event.target.value);
    }

    const handleEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleTitle = (event) => {
        setTitle(event.target.value);
        console.log(event.target.value);
    }

    const handleFirstName = (event) => {
        setFirstName(event.target.value);
    }

    const handleLastName = (event) => {
        setLastName(event.target.value);
    }

    const handleNic = (event) => {
        setNic(event.target.value);
    }

    const handleAddress = (event) => {
        setAddress(event.target.value);
    }

    const handleCity = (event) => {
        setCity(event.target.value);
    }

    const handleProvince = (event) => {
        setProvince(event.target.value);
    }

    const handlePhone1 = (event) => {
        setPhone1(event.target.value);
    }

    const handlePhone2 = (event) => {
        setPhone2(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (verifyInputs()) {
            const generateId = await axios.get("http://localhost:8080/employee/generateId");
            setId(generateId.data);

            const data = {
                "id": generateId.data,
                "title": title,
                "firstName": firstName,
                "lastName": lastName,
                "nic": nic,
                "address": address,
                "city": city,
                "province": province,
                "phone": [phone1, phone2],
                "email": email,
                "password": generateId.data,
                "jobTitle": jobTitle,
                "accessLevel": accessLevel
            }

            const response = await axios.post("http://localhost:8080/employee", data)
                .catch((error) => {
                    console.log(error);
                });

            console.log(response.data);

            if (!!response && response.status === 201) {
                console.log(`Employee ${generateId.data} created`);
                //document.getElementById("liveToast").classList.add("show");
            } else {
                console.log("Invalid");
            }
        }
    }

    let tel_regex = /^(\+[0-9]{1,3}|0)[0-9]{2}( ){0,1}[0-9]{7,7}\b/gm;
    let email_regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    const verifyInputs = () => {
        if (!email_regex.test(email)) {
            setErrorMsg("Please enter a valid email address");
            return (false);
        } else if (phone1 !== "" && !tel_regex.test(phone1)) {
            setErrorMsg("Please check the phone 1 number entered");
            return (false);
        } else if (phone2 !== "" && !tel_regex.test(phone2)) {
            setErrorMsg("Please check the phone 2 number entered");
            return (false);
        } else {
            setErrorMsg(null);
            return (true);
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

            <div className="login-box container-fluid">
                <div className="text-center mb-5">
                    <h1 className="mt-3">Create New Employee</h1>
                </div>
                <div className="d-flex justify-content-center" >
                    <form className="col-xl-6 col-lg-8 col-12" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="form-floating col-md row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handleJobTitle} />
                                <label className="ms-2 form-label ">Job Title</label>
                            </div>
                            <div className="form-floating col-md row-sm">
                                <select className="form-select mb-3" id="accessLevel" onChange={handleAccessLevel}>
                                </select>
                                <label className="ms-2 form-label">Access Level</label>
                            </div>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" placeholder="" required onChange={handleEmail} />
                            <label className="form-label">Email</label>
                        </div>
                        <div className="row">
                            <div className="form-floating col-md row-sm">
                                <select className="form-select mb-3" onChange={handleTitle}>
                                    <option hidden selected>-Please Select-</option>
                                    <option>Mr</option>
                                    <option>Ms</option>
                                    <option>Mrs</option>
                                </select>
                                <label className="ms-2 form-label">Title</label>
                            </div>
                            <div className="form-floating col-md row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handleFirstName} />
                                <label className="ms-2 form-label">First Name</label>
                            </div>
                            <div className="form-floating col-md row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handleLastName} />
                                <label className="ms-2 form-label">Last Name</label>
                            </div>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" placeholder="" required onChange={handleNic} />
                            <label className="form-label">NIC</label>
                        </div>
                        <div className="row">
                            <div className="form-floating col-md-6 row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handleAddress} />
                                <label className="ms-2 form-label">Address</label>
                            </div>
                            <div className="form-floating col-md-3 col-sm-6 row-xs">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handleCity} />
                                <label className="ms-2 form-label">City</label>
                            </div>
                            <div className="form-floating col-md-3 col-sm-6 row-xs">
                                <select className="form-select mb-3" onChange={handleProvince}>
                                    <option hidden selected>-Please Select-</option>
                                    <option>Central</option>
                                    <option>Eastern</option>
                                    <option>North Central</option>
                                    <option>North Western</option>
                                    <option>Northern</option>
                                    <option>Sabaragamuwa</option>
                                    <option>Southern</option>
                                    <option>Uva</option>
                                    <option>Western</option>
                                </select>
                                <label className="ms-2 form-label">Province</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-floating col-md row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" required onChange={handlePhone1} />
                                <label className="ms-2 form-label ">Phone 1</label>
                            </div>
                            <div className="form-floating col-md row-sm">
                                <input type="text" className="form-control mb-3" placeholder="" onChange={handlePhone2} />
                                <label className="ms-2 form-label">Phone 2</label>
                            </div>
                        </div>
                        <p>{errorMsg}</p>
                        <div className="row justify-content-end">
                            <button type="submit" className="btn btn-primary col-3 col-sm-2 me-2">Register</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <img src={logo} className="rounded me-2" alt="Super Store" height={25}/>
                            <strong className="me-auto">Bootstrap</strong>
                            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div className="toast-body">
                        {id !== null && 
                        <span>Emplyee {id} created</span>
                        }
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default CreateEmployee;