import axios from "axios";
import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
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

    useLayoutEffect(() => {
        document.body.style.backgroundColor = "lightgreen"
    });

    const handleEmail = (event) => {
        setEmail(event.target.value);
    }

    const handlePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleConfirmPassword = (event) => {
        setConfirmPassword(event.target.value);
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
            const generateId = await axios.get("http://localhost:8080/auth/customer/generateId");

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
                "password": password
            }

            const response = await axios.post("http://localhost:8080/auth/signup", data)
                .catch((error) => {
                    console.log(error);
                });

                console.log(response.data);

            if (!!response && response.status === 200) {
                localStorage.setItem("token", response.data);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data}`;
                console.log("Valid");

                navigate("/home");
            } else {
                console.log("Invalid");
            }
        }
    }


    let pwd_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s])(?!.*[\s]).{8,}$/gm;
    let tel_regex = /^(\+[0-9]{1,3}|0)[0-9]{2}( ){0,1}[0-9]{7,7}\b/gm;
    let email_regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    const verifyInputs = () => {
        if (!email_regex.test(email)) {
            setErrorMsg("Please enter a valid email address");
            return (false);
        } else if (!pwd_regex.test(password)) {
            setErrorMsg("Password must have at leasts 8 characters, and contain uppercase, lowercase, numeric and special characters");
            return (false);
        } else if (confirmPassword !== password) {
            setErrorMsg("Password confimation failed");
            return (false);
        } else if (phone1 != "" && !tel_regex.test(phone1)) {
            setErrorMsg("Please check the phone 1 number entered");
            return (false);
        } else if (phone2 != "" && !tel_regex.test(phone2)) {
            setErrorMsg("Please check the phone 2 number entered");
            return (false);
        } else {
            setErrorMsg(null);
            return (true);
        }
    }

    return (
        <div className="login-box container-fluid">
            <div className="text-center mb-5">
                <h1>User Sign Up</h1>
            </div>
            <div className="d-flex justify-content-center" >
                <form className="col-6-md" onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" placeholder="" required onChange={handleEmail} />
                        <label className="form-label">Email</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" placeholder="" aria-describedby="passwordHelpBlock" required onChange={handlePassword} />
                        <label className="form-label">Password</label>
                        <div id="passwordHelpBlock" className="form-text">
                            Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji.
                        </div>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" placeholder="" required onChange={handleConfirmPassword} />
                        <label className="form-label">Confirm Password</label>
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
    );
}

export default Register;