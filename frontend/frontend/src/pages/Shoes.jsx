import React, { useEffect } from 'react'
import {useState} from 'react'
import axios from 'axios'
import {Link} from "react-router-dom"


const Shoes =()=>{
    
    const [shoes, setShoes]=useState([])
    
    useEffect(()=>{
        const fetchAllShoes= async()=>{ // always returns a promise, running on background
            try{
                const res= await axios.get("http://localhost:8800/shoes") //returns a promise
                setShoes(res.data)
            }catch(err){
                console.log(err)
            }
        }
        fetchAllShoes()
    },[])
    
    const handleDelete =async(id)=>{
        try{
            await axios.delete("http://localhost:8800/shoes/" +id)
            window.location.reload()
        }catch(err){
            console.log(err)
        }
    }

    return (
        <div>
            <h1>MARKETPLACE</h1> 
            <div className='shoes'>
                {shoes.map((shoe)=>(
                    <div className='shoe' key={shoe.id}>
                    {shoe.image && <img src={shoe.img} alt=""/>}
                    <h2> {shoe.prod_name}</h2>
                    <p>{shoe.prod_description}</p>
                    <span>{shoe.price}</span>
                    <button className='delete' onClick={()=>handleDelete(shoe.id)}>Delete</button>
                    <button className='update'><Link to={`/update/${shoe.id}`}>Update</Link></button>
                    </div>
                
                ))}
            
            </div>

    <button>
    <Link to = "/add"> Add new Shoes</Link>  
    </button>
    </div>
        
    ) 
}

export default Shoes