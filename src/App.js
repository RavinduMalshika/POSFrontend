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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/manage-inventory" element={<ManageInventory />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
          <Route path="/create-employee" element={<CreateEmployee />} />
          <Route path="/employee-profile" element={<EmployeeProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
