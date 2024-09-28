import Users from "../models/user_model.js";
import argon2 from "argon2";

export const getUser = async (req,res)=>{
    try{
        const response = await Users.findAll({
            attributes: ['uuid', 'name', 'email', 'role']
        })
        res.status(200).json(response)
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const getUserTotal = async (req,res)=>{
    try{
        const response = await Users.count({where:{
            role: "user"
        }})
        res.status(200).json({msg:'Count user Success',data:response})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const getAdminTotal = async (req,res)=>{
    try{
        const response = await Users.count({where:{
            role: "admin"
        }})
        res.status(200).json({msg:'Count admin Success',data:response})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const getUserById = async (req,res)=>{
    try{
        const response = await Users.findOne({
            where : {
                uuid: req.params.id
            },
            attributes: ['uuid', 'name', 'email', 'role']
        })
        res.status(200).json(response)
    }
    catch(error){
        res.status(500).json({msg: error.message})
    } 
}

export const createUser = async (req,res)=>{
    const {name, email, password, confpassword, role} = req.body;
    if(password != confpassword) return res.status(400).json({msg: "Password dan Confirm tidak cocok"})
    const hashPassword = await argon2.hash(password);
    try{
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role
        })
        res.status(201).json({msg: "Register Success"})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const updateUser = async (req,res)=>{
    // Find the User
    const user = await Users.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"})
    
    // Configuring Password
    const {name, email, password, confpassword, role} = req.body;
    if(password != confpassword) return res.status(400).json({msg: "Password dan Confirm tidak cocok"})
    let hashPassword =""
    if(password === null || password === ""){
        hashPassword = user.password
    }else{
        hashPassword = await argon2.hash(password)
    }

    // Update Users
    try{
        await Users.update({
            name: name,
            email: email,
            password: hashPassword,
            role: role
        },{
            where:{
                id: user.id
            }
        })
        res.status(200).json({msg: "User Update Success"})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const deleteUser = async (req,res)=>{
    const user = await Users.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"})

    // Delete User
    try{
        await Users.destroy({
            where:{
                id: user.id
            }
        })
        res.status(200).json({msg: "User Deleted"})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}