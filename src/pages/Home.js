import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.svg';
import avatar from '../resources/avatar.png';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [categoryList, setCategoryList] = useState(null);
    const [items, setItems] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [cart, setCart] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const navigate = useNavigate();

    const isFirstRenderUser = useRef(true);
    const isFirstRenderCategory = useRef(true);
    const isFirstRenderItem = useRef(true);
    const isFirstRenderItemList = useRef(true);
    const isFirstRenderCart = useRef(true);
    const isFirstRenderItemsPerPage = useRef(true);

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
        loadCategories();

        window.addEventListener('resize', function (event) {
            if (document.getElementById("topNavBar") !== null) {
                let height = document.body.offsetHeight - document.getElementById("topNavBar").offsetHeight;
                if (document.getElementById("content") !== null) {
                    document.getElementById("content").style.height = height + "px";
                }
            }

            if (document.body.offsetWidth >= 1920 && itemsPerPage !== 15) {
                setItemsPerPage(15);
            } else if (document.body.offsetWidth >= 992 && itemsPerPage !== 9) {
                setItemsPerPage(9);
            } else if (document.body.offsetWidth >= 768 && itemsPerPage !== 6) {
                setItemsPerPage(6);
            } else {
                setItemsPerPage(6);
            }
        }, true);

        let height = document.body.offsetHeight - document.getElementById("topNavBar").offsetHeight;
        document.getElementById("content").style.height = height + "px";
    }, [])

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
        if (isFirstRenderCategory.current === true) {
            isFirstRenderCategory.current = false;
            return;
        }
        if (document.body.offsetWidth >= 992 && itemsPerPage !== 9) {
            setItemsPerPage(15);
        } else if (document.body.offsetWidth >= 768 && itemsPerPage !== 6) {
            setItemsPerPage(6);
        } else {
            setItemsPerPage(6);
        }
    }, [categoryList]);

    useEffect(() => {
        if (isFirstRenderItem.current === true) {
            isFirstRenderItem.current = false;
            return;
        }
        loadItems();
    }, [items]);

    useEffect(() => {
        if (isFirstRenderItemList.current === true) {
            isFirstRenderItemList.current = false;
            return;
        }
        loadItems();
    }, [page]);

    useEffect(() => {
        if (isFirstRenderCart.current === true) {
            isFirstRenderCart.current = false;
            return;
        }
        updateCart();
    }, [cart]);

    useEffect(() => {
        if (isFirstRenderItemsPerPage.current === true) {
            isFirstRenderItemsPerPage.current = false;
            return;
        }
        loadCategoryList();
        let selectedCategoryEntry = document.getElementById("categoryList").childNodes[selectedCategory];
        selectedCategoryEntry.click();
    }, [itemsPerPage]);

    const getUserFromToken = async () => {
        const response = await axios.get(`http://localhost:8080/customer/token`).catch((error) => {
            console.log(error);
            localStorage.removeItem("token");
            return;
        });

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
        const response = await axios.get(`http://localhost:8080/auth/category`);
        setCategoryList(response.data);
    }

    const loadCategoryList = async () => {
        let html = `<li class="list-group-item list-group-item-action list-group-item-success active">All Categories</li>`;
        categoryList.forEach(category => {
            html += `<li class="list-group-item list-group-item-action list-group-item-success">${category.name}</li>`;
        });

        document.getElementById("categoryList").innerHTML = html;

        let categories = document.getElementById("categoryList").childNodes;

        for (let i = 0; i < categories.length; i++) {
            categories[i].addEventListener("click", function () {
                categories[i].classList.add("active");
                for (let j = 0; j < categories.length; j++) {
                    if (i !== j) {
                        categories[j].classList.remove("active");
                    }
                }
                categorySelected(categories[i].innerHTML);
                setSelectedCategory(i);
            });
        }
    }

    const categorySelected = async (filter) => {
        if (filter === "All Categories") {
            const response = await axios.get(`http://localhost:8080/auth/item`);
            console.log(response.data.length);
            setItems(response.data);

            let pages = parseInt(response.data.length / itemsPerPage);
            if (response.data.length % itemsPerPage > 0) {
                pages += 1;
            }
            setTotalPages(pages);
            console.log(pages);
        }
        else {
            let category = null;
            categoryList.forEach(element => {
                if (element.name === filter) {
                    category = element.id;
                }
            })
            const response = await axios.get(`http://localhost:8080/auth/item/category/${category}`);
            setItems(response.data);

            let pages = parseInt(response.data.length / itemsPerPage);
            if (response.data.length % itemsPerPage > 0) {
                pages += 1;
            }
            setTotalPages(pages);
            console.log(pages);
        }
        setPage(0);
    }

    const loadItems = async () => {
        let html = "";

        console.log("total :" + totalPages);
        console.log("page: " + page);
        console.log(page === (totalPages - 1));

        if (items.length === 0) {
            console.log("no items in the category");
            html += `<p class="text-center mt-2">No items available in the selected category</p>`
        } else if (page === (totalPages - 1)) {
            console.log("items less than capacity");
            for (let i = page * itemsPerPage; i < items.length; i++) {
                if (items[i] !== null) {
                    console.log(items[i]);
                    const response = await axios.get(`http://localhost:8080/auth/stock/item/${items[i].id}`);
                    let stock = 0;
                    for (let j = 0; j < response.data.length; j++) {
                        stock += response.data[j].quantity;
                    }

                    let stockDisplay = "";
                    if (stock > 0) {
                        stockDisplay = "Available: " + stock;
                    } else {
                        stockDisplay = "Out of Stock";
                    }

                    html +=
                        `<div class="col-lg-2 col-sm-3 col-10 card m-3">` +
                        `<div class="card-body p-2">` +
                        `<h5 class="card-title">${items[i].name}</h5>` +
                        `<p class="card-text">Rs. ${items[i].price}</p>` +
                        `<p class="card-text">${stockDisplay}</p>`;
                    if (stock === 0) {
                        html +=

                            `</div>` +
                            `</div>`;
                    } else {
                        html +=
                            `<div class="btn-group btn-group-sm" role="group">` +
                            `<button type="button" class="btn btn-secondary decrement-button">-</button>` +
                            `<button type="button" class="btn btn-secondary increment-button" value=${stock}>+</button>` +
                            `<button type="button" class="btn btn-success add-to-cart" value=${items[i].id}>Add 1</button>` +
                            `</div>` +
                            `</div>` +
                            `</div>`;
                    }
                }
            }
        } else {
            console.log("items more than capacity");
            for (let i = page * itemsPerPage; i < (page * itemsPerPage + itemsPerPage); i++) {
                if (items[i] !== null) {
                    console.log(items[i]);
                    const response = await axios.get(`http://localhost:8080/auth/stock/item/${items[i].id}`);
                    let stock = 0;
                    for (let j = 0; j < response.data.length; j++) {
                        stock += response.data[j].quantity;
                    }

                    let stockDisplay = "";
                    if (stock > 0) {
                        stockDisplay = "Available: " + stock;
                    } else {
                        stockDisplay = "Out of Stock";
                    }

                    html +=
                        `<div class="col-lg-2 col-sm-3 col-10 card m-1">` +
                        `<div class="card-body p-1">` +
                        `<h5 class="card-title">${items[i].name}</h5>` +
                        `<p class="card-text">Rs. ${items[i].price}</p>` +
                        `<p class="card-text">Available: ${stockDisplay}</p>`;

                    if (stock === 0) {
                        html +=
                            `</div>` +
                            `</div>`;
                    } else {
                        html +=
                            `<div class="btn-group btn-group-sm" role="group">` +
                            `<button type="button" class="btn btn-secondary decrement-button">-</button>` +
                            `<button type="button" class="btn btn-secondary increment-button" value=${stock}>+</button>` +
                            `<button type="button" class="btn btn-success add-to-cart" value=${items[i].id}>Add 1</button>` +
                            `</div>` +
                            `</div>` +
                            `</div>`;
                    }
                }
            }
        }
        document.getElementById("itemList").innerHTML = html;

        for (let i = 0; i < document.getElementsByClassName("add-to-cart").length; i++) {
            document.getElementsByClassName("increment-button")[i].addEventListener("click", function () {
                let currentQuantity = parseInt(document.getElementsByClassName("add-to-cart")[i].innerHTML.substring(4));
                if (currentQuantity < document.getElementsByClassName("increment-button")[i].value)
                    document.getElementsByClassName("add-to-cart")[i].innerHTML = "Add " + (currentQuantity + 1);
            });
            document.getElementsByClassName("decrement-button")[i].addEventListener("click", function () {
                let currentQuantity = parseInt(document.getElementsByClassName("add-to-cart")[i].innerHTML.substring(4));
                if (currentQuantity > 1) {
                    document.getElementsByClassName("add-to-cart")[i].innerHTML = "Add " + (currentQuantity - 1);
                }
            });
            document.getElementsByClassName("add-to-cart")[i].addEventListener("click", function () {
                if (user !== null) {
                    let newCart = cart;
                    console.log(cart);
                    newCart.push([document.getElementsByClassName("add-to-cart")[i].value, document.getElementsByClassName("add-to-cart")[i].innerHTML.substring(4)]);
                    setCart(newCart);
                    updateCart(newCart);
                }
            });
        }

        if (items.length !== 0) {

            let pageNavHtml =
                `<li class="page-item">` +
                `<button class="page-link" id="previousPage" aria-label="Previous">` +
                `<span aria-hidden="true">&laquo;</span>` +
                `</button>` +
                `</li>`;

            for (let i = 0; i < totalPages; i++) {
                pageNavHtml +=
                    `<li class="page-item item-card"><button class="page-link">${i + 1}</button></li>`;
            }

            pageNavHtml +=
                `<li class="page-item">` +
                `<button class="page-link" id="nextPage" aria-label="Next">` +
                `<span aria-hidden="true">&raquo;</span>` +
                `</button>` +
                `</li>`;

            document.getElementById("pageNav").innerHTML = pageNavHtml;
            document.getElementById("previousPage").onclick = previousPage;
            document.getElementById("nextPage").onclick = nextPage;
            document.getElementsByClassName("item-card").item(page).classList.add("active");

            for (let i = 0; i < totalPages; i++) {
                document.getElementsByClassName("item-card")[i].addEventListener("click", function () {
                    setPage(i);
                });
            }

            if (page === totalPages - 1) {
                document.getElementById("nextPage").parentNode.classList.add("disabled");
            }

            if (page === 0) {
                document.getElementById("previousPage").parentNode.classList.add("disabled");
            }

        } else {
            document.getElementById("pageNav").innerHTML = "";
        }
    }

    const nextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    }

    const previousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
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
                const item = await axios.get(`http://localhost:8080/item/${cart[i][0]}`);
                const data = {
                    "orderId": orderId.data,
                    "itemId": cart[i][0],
                    "price": item.data.price,
                    "quantity": cart[i][1],
                    "discount": 0
                }

                const response = await axios.post(`http://localhost:8080/order-detail`, data);
                if (response && response.status === 201) {
                    console.log("order detail created");
                    setCart([]);
                    //document.getElementById("toastBody").classList.innerHTML = `<span>Order (${orderId.data}) placed.</span>`;
                    //document.getElementById("liveToast").classList.add("show");
                } else {
                    console.log("order detail creation failed");
                }
            }
        } else {
            console.log("order creation failed");
        }
    }

    const loadOffcanvasCategoryList = async () => {
        let html = `<li class="list-group-item list-group-item-action list-group-item-success ps-3">All Categories</li>`;
        categoryList.forEach(category => {
            html += `<li class="list-group-item list-group-item-action list-group-item-success ps-3">${category.name}</li>`;
        });

        console.log(document.getElementById("offcanvasCategoryListBody"));
        document.getElementById("offcanvasCategoryListBody").innerHTML = html;

        let categories = document.getElementById("offcanvasCategoryListBody").childNodes;

        for (let i = 0; i < categories.length; i++) {
            categories[i].addEventListener("click", function () {
                categories[i].classList.add("active");
                for (let j = 0; j < categories.length; j++) {
                    if (i !== j) {
                        categories[j].classList.remove("active");
                    }
                }
                document.getElementById("offcanvasCategoryListClose").click();
                categorySelected(categories[i].innerHTML);
            });
        }
    }

    return (
        <div className="h-100">
            <nav className="flex-row navbar navbar-expand-sm bg-body-tertiary" id="topNavBar">
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
                                <Link className="nav-link active" to="/home">Browse</Link>
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

            <div className="container-fluid p-0 m-0" id="content">
                <div className="row w-100 h-100">
                    <div className="d-none d-md-block col-3 bg-light h-100 pt-3 px-2">
                        <ul className="list-group" id="categoryList"></ul>
                    </div>
                    <div className='col p-4'>
                        <p class="d-md-none bi bi-funnel fw-6 m-1" style={{ cursor: "pointer" }} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCategoryList" aria-controls="offcanvasCategoryList" onClick={loadOffcanvasCategoryList}> Filter by Category</p>
                        <div className="row border border-white rounded justify-content-evenly m-0" id="itemList">
                        </div>
                        <div className="row m-2">
                            <nav>
                                <ul class="pagination justify-content-center" id="pageNav">
                                </ul>
                            </nav>
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

            <div class="offcanvas offcanvas-start w-50" tabindex="-1" id="offcanvasCategoryList" aria-labelledby="offcanvasCategoryList">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title">Filter by Category</h5>
                    <button type="button" id="offcanvasCategoryListClose" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <ul className="list-group" id="offcanvasCategoryListBody"></ul>
                </div>
            </div>

            {/* <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <img src={logo} className="rounded me-2" alt="Super Store" height={25}/>
                            <strong className="me-auto">Bootstrap</strong>
                            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div className="toast-body" id="toastBody">
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default Home;