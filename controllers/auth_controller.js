import Users from "../models/user_model.js";
import argon2 from "argon2"

export const LogIn = async (req,res)=>{
    const user = await Users.findOne({
        where:{
            email: req.body.email
        }
    });

    // If user not found
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"})

    // If password wrong
    const match = await argon2.verify(user.password, req.body.password);
    if(!match) return  res.status(400).json({msg: "Wrong Password!"})
    
    // set session
    req.session.userId = user.uuid
    const uuid = user.uuid;
    const name = user.name;
    const email = user.email;
    const role = user.role;
    res.status(200).json({uuid,name,email,role})
}

export const Me = async (req,res) =>{
    if(!req.session.userId){
        return res.status(401).json({msg: "Mohon login ke akun anda!"})
    }
    const user = await Users.findOne({
        attributes:['uuid','name','email','role'],
        where:{
            uuid : req.session.userId
        }
    })
    // If user not found
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"})
    res.status(200).json(user)
}

export const LogOut = (req,res)=>{
    req.session.destroy((err)=>{
        if(err) return res.status(400).json({msg: "Tidak dapat logout"})
        res.status(200).json({msg: "Anda telah logout"})
    })
}