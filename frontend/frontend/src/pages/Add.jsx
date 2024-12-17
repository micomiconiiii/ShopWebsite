import React from 'react'
import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Add =()=>{
    const [shoe, setShoe] = useState({
        prod_name:"",
        prod_description:"",
        price: null,
        image:"",
    });

    const navigate = useNavigate()

    const handleChange=(e)=>{
        setShoe((prev)=>({...prev, [e.target.name]: e.target.value}))
    };
    
    const handleClick= async e=>{
        e.preventDefault()
        try{
            await axios.post("http://localhost:8800/shoes", shoe) // axios allows to communicate with API in react, makes http request
            navigate("/")
        }catch(err){
            console.log(err)    
        }
    }
    
    console.log(shoe)
    return(
        <div className ='form'>
            <h1>Add</h1>
            <input type="text" placeholder='Name' onChange={handleChange} name="prod_name" />
            <input type="text" placeholder='Description' onChange={handleChange} name="prod_description" />
            <input type="number" placeholder='Price' onChange={handleChange} name="price"/>
            <input type="text" placeholder='Image' onChange={handleChange} name="image" />
            
            <button onClick={handleClick}>Add</button>
        </div>
    ) 
}

export default Add