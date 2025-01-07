import {
  BrowserRouter,
  Routes,
  Route,
  
} from "react-router-dom";
import Products from "./pages/Products";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import User from "./pages/User";
import Orders from "./pages/Orders";
import AdminOrder from "./pages/AdminOrder";
import AdminUser from "./pages/AdminUser";
import AddRole from "./pages/AddRole";
import Otp from "./pages/Otp";
import LandingPage from "./pages/LandingPage";
import "./style.css";

function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home />} />
        
          <Route path="/products" element={<Products/>}></Route>
          <Route path="/add" element={<Add/>}></Route>          
          <Route path="/update/:id" element={<Update/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>        
          <Route path="/home" element={<Home/>}></Route> 
          <Route path="/cart" element={<Cart/>}></Route>        
          <Route path="/user" element={<User/>}></Route>
          <Route path="/orders" element={<Orders/>}></Route>
          <Route path="/orderdashboard" element={<AdminOrder/>}></Route> 
          <Route path="/showusers" element={<AdminUser/>}></Route>        
          <Route path="/otp" element={<Otp/>}></Route>        
          <Route path="/addrole" element={<AddRole/>}></Route>        
          <Route path="/landingpage" element={<LandingPage/>}></Route>        
        
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
