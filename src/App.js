import './App.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import ManageInventory from './pages/ManageInventory';
import ManageEmployees from './pages/ManageEmployees';
import CreateEmployee from './pages/CreateEmployee';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import ProtectedRoutes from './utils/ProtectedRoutes';
import EmployeeProfile from './pages/EmployeeProfile';
import Orders from './pages/Orders';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import CustomerProfile from './pages/CustomerProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/manage-inventory" element={<ManageInventory />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
          <Route path="/create-employee" element={<CreateEmployee />} />
          <Route path="/employee-profile" element={<EmployeeProfile />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
