import express from "express"
import mysql from "mysql"


const app = express()

app.use(express.json())
const db = mysql.createConnection({
    host:"localhost", 
    user: "root",
    password: "mico",
    database: "marketplace"
})


app.get("/shoes", (req, res)=>{
    const q = "SELECT * FROM shoes"
    db.query(q, (err, data)=>{
        if (err) return res.json(err)
        return res.json(data)
    })
})
app.post("/shoes", (req, res)=>{
    const q="INSERT INTO shoes (`id`, `prod_name`, `prod_description`, `image`) VALUES(?)";
    const values = [
       req.body.id,
       req.body.prod_name,
       req.body.prod_description,
       req.body.image,

    ];
    db.query(q, [values], (err, data)=>{
        if (err) return res.json(err)
        return res.json("Successfully executed")
    })
})

app.listen(8800, ()=>{
    console.log("connected to backend")
})

app.get("/", (req, res)=>{
    res.json("this is the backend")
})
