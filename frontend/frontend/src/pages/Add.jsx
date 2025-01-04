import React from 'react'
import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Add =()=>{
    const [product, setShoe] = useState({
        prod_name:"",
        prod_description:"",
        price: null,
        image:"",
    });

    const navigate = useNavigate()

    const handleChange=(e)=>{
        setShoe((prev)=>({...prev, [e.target.name]: e.target.value}))
    };
    
    const handleAddProduct= async e=>{
        e.preventDefault()
        try{
            await axios.post("http://localhost:8800/products", product) // axios allows to communicate with API in react, makes http request
            navigate("/products")
        }catch(err){
            console.log(err)    
        }
    }
    
    
    return(
        <div className ='form'>
            <h1>Add</h1>
            <input type="text" placeholder='Name' onChange={handleChange} name="prod_name" />
            <input type="text" placeholder='Description' onChange={handleChange} name="prod_description" />
            <input type="number" placeholder='Price' onChange={handleChange} name="price"/>
            <input type="number" placeholder='Stock' onChange={handleChange} name="stock"/>
            <input type="text" placeholder='Image' onChange={handleChange} name="image" />
            <div>
            <select  placeholder='Select Category' onChange={handleChange} name="category">
                <option value=""> Select Category</option>
                <option value="Men"> Men</option>
                <option value="Women"> Women</option>
                <option value="Women"> Kids</option>
            </select>
            
            </div>
            <button onClick={handleAddProduct}>Add</button>
            
        </div>
    ) 
}

export default Add