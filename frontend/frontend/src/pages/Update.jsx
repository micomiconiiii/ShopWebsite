import React from 'react'
import {useState} from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'

const Update =()=>{
    const [shoe, setShoe] = useState({
        prod_name:"",
        prod_description:"",
        price: null,
        image:"",
    });

    const navigate = useNavigate();
    const location = useLocation(); //returns the current location of the object
    const shoeId = location.pathname.split("/")[2]

    const handleChange=(e)=>{
        setShoe((prev)=>({...prev, [e.target.name]: e.target.value}))
    };
    
    const handleClick= async e=>{
        e.preventDefault()
        try{
            await axios.put(`http://localhost:8800/shoes/${shoeId}`, shoe) // axios allows to communicate with API in react, makes http request
            navigate("/")
        }catch(err){
            console.log(err)    
        }
    }
    
    console.log(shoe)
    return(
        <div className ='form'>
            <h1>Update Item</h1>
            <input type="text" placeholder='Name' onChange={handleChange} name="prod_name" />
            <input type="text" placeholder='Description' onChange={handleChange} name="prod_description" />
            <input type="text" placeholder='Image' onChange={handleChange} name="image" />
            <input type="number" placeholder='Price' onChange={handleChange} name="price"/>
            
            <button onClick={handleClick}>Update</button>
        </div>
    ) 
}

export default Update