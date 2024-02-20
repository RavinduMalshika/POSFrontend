import axios from "axios";
import logo from "../logo.svg";
import avatar from "../resources/avatar.png"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ManageInventory = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [categories, setCategories] = useState(null);
    const [items, setItems] = useState(null);
    const [stocks, setStocks] = useState(null);
    const [selection, setSelection] = useState(null);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderCategory = useRef(true);
    const isFirstRenderItem = useRef(true);
    const isFirstRenderStock = useRef(true);

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
        if (isFirstRenderCategory.current === true) {
            isFirstRenderCategory.current = false;
            return;
        }
        loadCategoryTable();
    }, [categories])

    useEffect(() => {
        if (isFirstRenderItem.current === true) {
            isFirstRenderItem.current = false;
            return;
        }
        loadItemTable();
    }, [items])

    useEffect(() => {
        if (isFirstRenderStock.current === true) {
            isFirstRenderStock.current = false;
            return;
        }
        loadStockTable();
    }, [stocks])

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

    const loadCategories = async () => {
        setSelection("category");
        document.getElementById("categoryButton").classList.add("active");
        document.getElementById("itemButton").classList.remove("active");
        document.getElementById("stockButton").classList.remove("active");
        const response = await axios.get(`http://localhost:8080/auth/category`);
        setCategories(response.data);
    }

    const loadCategoryTable = () => {
        let html = "";
        categories.forEach(category => {
            html +=
                `<tr>` +
                `<td>${category.id}</td>` +
                `<td>${category.name}</td>` +
                `</tr>`
        });

        document.getElementById("tableBody").innerHTML = html;
        cellClick();
        document.getElementById("updateButton").disabled = true;
        document.getElementById("deleteButton").disabled = true;
    }

    const loadItems = async () => {
        setSelection("item");
        document.getElementById("itemButton").classList.add("active");
        document.getElementById("categoryButton").classList.remove("active");
        document.getElementById("stockButton").classList.remove("active");
        const response = await axios.get(`http://localhost:8080/auth/item`);
        setItems(response.data);
    }

    const loadItemTable = async () => {
        let html = "";
        for (let i = 0; i < items.length; i++) {
            const response = await axios.get(`http://localhost:8080/category/${items[i].category}`);
            html +=
                `<tr>` +
                `<td>${items[i].id}</td>` +
                `<td>${items[i].name}</td>` +
                `<td>${items[i].category}</td>` +
                `<td>${response.data.name}</td>` +
                `</tr>`
        }
        document.getElementById("tableBody").innerHTML = html;
        cellClick();
        document.getElementById("updateButton").disabled = true;
        document.getElementById("deleteButton").disabled = true;
    }

    const loadStocks = async () => {
        setSelection("stock");
        document.getElementById("stockButton").classList.add("active");
        document.getElementById("categoryButton").classList.remove("active");
        document.getElementById("itemButton").classList.remove("active");
        const response = await axios.get(`http://localhost:8080/auth/stock`);
        setStocks(response.data);
    }

    const loadStockTable = async () => {
        let html = "";
        for (let i = 0; i < stocks.length; i++) {
            const response = await axios.get(`http://localhost:8080/item/${stocks[i].itemId}`);
            html +=
                `<tr>` +
                `<td>${stocks[i].id}</td>` +
                `<td>${stocks[i].itemId}</td>` +
                `<td>${response.data.name}</td>` +
                `<td>${stocks[i].batch}</td>` +
                `<td>${stocks[i].price}</td>` +
                `<td>${stocks[i].quantity}</td>` +
                `</tr>`
        }
        document.getElementById("tableBody").innerHTML = html;
        cellClick();
        document.getElementById("updateButton").disabled = true;
        document.getElementById("deleteButton").disabled = true;
    }

    const cellClick = () => {
        const cells = document.getElementsByTagName("td");
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener("click", function () {
                let activeRow = document.getElementsByClassName("table-active");
                if (activeRow.length > 0) {
                    activeRow[0].classList.remove("table-active");
                }
                cells[i].parentElement.classList.add("table-active");
                document.getElementById("updateButton").disabled = false;
                document.getElementById("deleteButton").disabled = false;
            })
        }
    }

    const createButtonClicked = async () => {
        switch (selection) {
            case ("category"):
                const generatedCategoryId = await axios.get(`http://localhost:8080/category/generateId`);
                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Create New Category</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${generatedCategoryId.data} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="name" placeholder="" required />` +
                    `<label class="form-label">Name</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;
                document.getElementById("formButton").innerHTML = "Create";
                document.getElementById("formButton").onclick = createCategory;
                break;

            case ("item"):
                const generatedItemId = await axios.get(`http://localhost:8080/item/generateId`);
                let response = await axios.get(`http://localhost:8080/auth/category`);
                let categoryOptions = `<option hidden selected>-Please Select-</option>`;
                response.data.forEach(category => {
                    categoryOptions += `<option value=${category.id}>${category.name}</option>`
                });

                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Create New Item</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${generatedItemId.data} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="name" placeholder="" required />` +
                    `<label class="form-label">Name</label>` +
                    `</div>` +
                    `<div class="form-floating col-md row-sm">` +
                    `<select class="form-select mb-3" id="category">${categoryOptions}</select>` +
                    `<label class="form-label">Title</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;
                document.getElementById("formButton").innerHTML = "Create";
                document.getElementById("formButton").onclick = createItem;
                break;

            case ("stock"):
                const generatedStockId = await axios.get(`http://localhost:8080/stock/generateId`);
                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Create New Stock</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${generatedStockId.data} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="itemId" placeholder="" required />` +
                    `<label class="form-label">Item ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="itemName" placeholder="" readonly required />` +
                    `<label class="form-label">Item Name</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="batch" placeholder="" required />` +
                    `<label class="form-label">Batch</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="price" placeholder="" required />` +
                    `<label class="form-label">Price</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="quantity" placeholder="" required />` +
                    `<label class="form-label">Quantity</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;
                document.getElementById("formButton").innerHTML = "Create";
                document.getElementById("formButton").onclick = createStock;
                document.getElementById("itemId").onchange = getItemName;
                break;

            default:
                break;
        }
    }

    const getItemName = async () => {
        const id = document.getElementById("itemId").value;
        const response = await axios.get(`http://localhost:8080/item/${id}`);
        document.getElementById("itemName").value = response.data.name;
    }

    const createCategory = async () => {
        const id = document.getElementById("id").value;
        const name = document.getElementById("name").value;

        const data = {
            "id": id,
            "name": name
        }
        const response = await axios.post(`http://localhost:8080/category`, data);
        if (response && response.status === 201) {
            console.log("category created");
            document.getElementById("closeButton").click();
            loadCategories();
        } else {
            console.log("create failed");
        }
    }

    const createItem = async () => {
        const id = document.getElementById("id").value;
        const name = document.getElementById("name").value;
        const category = document.getElementById("category").value;

        const data = {
            "id": id,
            "name": name,
            "category": category
        }
        const response = await axios.post(`http://localhost:8080/item`, data);
        if (response && response.status === 201) {
            console.log("item created");
            document.getElementById("closeButton").click();
            loadItems();
        } else {
            console.log("create failed");
        }
    }

    const createStock = async () => {
        const id = document.getElementById("id").value;
        const itemId = document.getElementById("itemId").value;
        const batch = document.getElementById("batch").value;
        const price = document.getElementById("price").value;
        const quantity = document.getElementById("quantity").value;

        const data = {
            "id": id,
            "itemId": itemId,
            "batch": batch,
            "price": price,
            "quantity": quantity
        }
        const response = await axios.post(`http://localhost:8080/stock`, data);
        if (response && response.status === 201) {
            console.log("stock created");
            document.getElementById("closeButton").click();
            loadStocks();
        } else {
            console.log("create failed");
        }
    }

    const updateButtonClicked = async () => {
        let row = null;
        switch (selection) {
            case ("category"):
                row = document.getElementsByClassName("table-active");
                console.log(row[0].childNodes);
                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Update Category</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${row[0].childNodes[0].innerHTML} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="name" placeholder="" value=${row[0].childNodes[1].innerHTML} required />` +
                    `<label class="form-label">Name</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;

                document.getElementById("formButton").innerHTML = "Update";
                document.getElementById("formButton").onclick = updateCategory;
                break;

            case ("item"):
                row = document.getElementsByClassName("table-active");
                let response = await axios.get(`http://localhost:8080/auth/category`);
                let categoryOptions = ``;
                response.data.forEach(category => {
                    if (category.id === row[0].childNodes[2].innerHTML) {
                        categoryOptions += `<option selected value=${category.id}>${category.name}</option>`;
                    } else {
                        categoryOptions += `<option value=${category.id}>${category.name}</option>`;
                    }
                });
                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Update Item</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${row[0].childNodes[0].innerHTML} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="name" placeholder="" value=${row[0].childNodes[1].innerHTML} required />` +
                    `<label class="form-label">Name</label>` +
                    `</div>` +
                    `<div class="form-floating col-md row-sm">` +
                    `<select class="form-select mb-3" id="category">${categoryOptions}</select>` +
                    `<label class="form-label">Title</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;

                document.getElementById("formButton").innerHTML = "Update";
                document.getElementById("formButton").onclick = updateItem;
                break;

            case ("stock"):
                row = document.getElementsByClassName("table-active");
                document.getElementById("form").innerHTML =
                    `<div class="offcanvas-header">` +
                    `<h5 class="offcanvas-title" id="staticBackdropLabel">Create New Stock</h5>` +
                    `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
                    `</div>` +
                    `<div class="offcanvas-body">` +
                    `<form>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="id" placeholder="" value=${row[0].childNodes[0].innerHTML} readonly required />` +
                    `<label class="form-label">ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="itemId" placeholder="" value=${row[0].childNodes[1].innerHTML} required />` +
                    `<label class="form-label">Item ID</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="itemName" placeholder="" value=${row[0].childNodes[2].innerHTML} readonly required />` +
                    `<label class="form-label">Item Name</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="batch" placeholder="" value=${row[0].childNodes[3].innerHTML} required />` +
                    `<label class="form-label">Batch</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="price" placeholder="" value=${row[0].childNodes[4].innerHTML} required />` +
                    `<label class="form-label">Price</label>` +
                    `</div>` +
                    `<div class="form-floating mb-3">` +
                    `<input type="text" class="form-control" id="quantity" placeholder="" value=${row[0].childNodes[5].innerHTML} required />` +
                    `<label class="form-label">Quantity</label>` +
                    `</div>` +
                    `</form>` +
                    `</div>`;

                document.getElementById("formButton").innerHTML = "Update";
                document.getElementById("formButton").onclick = updateStock;
                document.getElementById("itemId").onchange = getItemName;
                break;

            default:
                break;
        }
    }

    const updateCategory = async () => {
        const id = document.getElementById("id").value;
        const name = document.getElementById("name").value;

        const data = {
            "id": id,
            "name": name
        }
        const response = await axios.put(`http://localhost:8080/category/${id}`, data);
        if (response && response.status === 200) {
            console.log("category update");
            document.getElementById("closeButton").click();
            loadCategories();
        } else {
            console.log("update failed");
        }
    }

    const updateItem = async () => {
        const id = document.getElementById("id").value;
        const name = document.getElementById("name").value;
        const category = document.getElementById("category").value;

        const data = {
            "id": id,
            "name": name,
            "category": category
        }
        const response = await axios.put(`http://localhost:8080/item/${id}`, data);
        if (response && response.status === 200) {
            console.log("item updated");
            document.getElementById("closeButton").click();
            loadItems();
        } else {
            console.log("update failed");
        }
    }

    const updateStock = async () => {
        const id = document.getElementById("id").value;
        const itemId = document.getElementById("itemId").value;
        const batch = document.getElementById("batch").value;
        const price = document.getElementById("price").value;
        const quantity = document.getElementById("quantity").value;

        const data = {
            "id": id,
            "itemId": itemId,
            "batch": batch,
            "price": price,
            "quantity": quantity
        }
        const response = await axios.put(`http://localhost:8080/stock/${id}`, data);
        if (response && response.status === 200) {
            console.log("stock updated");
            document.getElementById("closeButton").click();
            loadStocks();
        } else {
            console.log("update failed");
        }
    }

    const deleteButtonClicked = () => {
        document.getElementById("form").innerHTML =
            `<div class="offcanvas-header">` +
            `<h5 class="offcanvas-title" id="staticBackdropLabel">Update Item</h5>` +
            `<button type="button" class="btn-close" id="closeButton" data-bs-dismiss="offcanvas" aria-label="Close"></button>` +
            `</div>` +
            `<div class="offcanvas-body">` +
            `<div>` +
            `Are you sure?` +
            `</div>` +
            `</div>`;

        document.getElementById("formButton").innerHTML = "Delete";
        switch (selection) {
            case ("category"):
                document.getElementById("formButton").onclick = deleteCategory;
                break;
            case ("item"):
                document.getElementById("formButton").onclick = deleteItem;
                break;
            case ("stock"):
                document.getElementById("formButton").onclick = deleteStock;
                break;
            default:
                break;
        }


    }

    const deleteCategory = async () => {
        let id = document.getElementsByClassName("table-active")[0].childNodes[0].innerHTML;

        const response = await axios.delete(`http://localhost:8080/category/${id}`);
        if (response && response.status === 200) {
            console.log("Deleted");
            document.getElementById("closeButton").click();
            loadCategories();
        } else {
            console.log("Delete failed");
        }
    }

    const deleteItem = async () => {
        let id = document.getElementsByClassName("table-active")[0].childNodes[0].innerHTML;

        const response = await axios.delete(`http://localhost:8080/item/${id}`);
        if (response && response.status === 200) {
            console.log("Deleted");
            document.getElementById("closeButton").click();
            loadItems();
        } else {
            console.log("Delete failed");
        }
    }

    const deleteStock = async () => {
        let id = document.getElementsByClassName("table-active")[0].childNodes[0].innerHTML;

        const response = await axios.delete(`http://localhost:8080/stock/${id}`);
        if (response && response.status === 200) {
            console.log("Deleted");
            document.getElementById("closeButton").click();
            loadStocks();
        } else {
            console.log("Delete failed");
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

            <div className="container-fluid">
                <div className="row">
                    <div className="col-3">
                        <div className="row m-2">
                            <button className="btn btn-primary" id="stockButton" onClick={loadStocks}>Stock</button>
                        </div>
                        <div className="row m-2">
                            <button className="btn btn-primary" id="itemButton" onClick={loadItems}>Items</button>
                        </div>
                        <div className="row m-2">
                            <button className="btn btn-primary" id="categoryButton" onClick={loadCategories}>Categories</button>
                        </div>
                    </div>
                    <div className="col m-2">
                        {selection === "category" &&
                            <table className="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBody"></tbody>
                            </table>
                        }
                        {selection === "item" &&
                            <table className="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Category ID</th>
                                        <th>Category Name</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBody"></tbody>
                            </table>
                        }
                        {selection === "stock" &&
                            <table className="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Batch</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBody"></tbody>
                            </table>
                        }
                        {selection !== null &&
                            <div className="row justify-content-end">
                                <button className="col-3 m-2 btn btn-success" id="createButton" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasForm" aria-controls="offcanvasForm" onClick={createButtonClicked} >Create</button>
                                <button className="col-3 m-2 btn btn-primary" id="updateButton" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasForm" aria-controls="offcanvasForm" onClick={updateButtonClicked} >Update</button>
                                <button className="col-3 m-2 btn btn-danger" id="deleteButton" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasForm" aria-controls="offcanvasForm" onClick={deleteButtonClicked} >Delete</button>
                            </div>
                        }
                    </div>

                    <div class="offcanvas offcanvas-end" data-bs-backdrop="static" tabIndex="-1" id="offcanvasForm" aria-labelledby="staticBackdropLabel">
                        <div id="form">
                        </div>
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-primary" id="formButton"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageInventory;