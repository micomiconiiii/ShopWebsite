import {
  BrowserRouter,
  Routes,
  Route,
  
} from "react-router-dom";
import Shoes from "./pages/Shoes";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import "./style.css";

function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shoes/>}></Route>
          <Route path="/add" element={<Add/>}></Route>          
          <Route path="/update/:id" element={<Update/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>        
          <Route path="/home" element={<Home/>}></Route>        
        
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
