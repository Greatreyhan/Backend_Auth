import KTP from "../models/ktp_model.js";
import Users from "../models/user_model.js";
import {Op} from "sequelize";
import { Sequelize } from "sequelize";


export const getKTP = async (req,res)=>{
    try{
        let response;
        if(req.role === "admin"){
            response = await KTP.findAll({
                // attributes:['uuid','name','price'],
                include : [{
                    model: Users,
                    attributes:['name','email'],
                }]
            })
        }else{
            response = await KTP.findAll({
                // attributes:['uuid','name','price'],
                where:{
                    userId: req.userId
                },
                include:[{
                    model: Users,
                    attributes:['name','email'],
                }]
            })
        }
        res.status(200).json(response);
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const getKTPById = async (req,res)=>{
    try{
        let response;
        if(req.role === "admin"){
            response = await KTP.findOne({
                // attributes:['uuid','name','price'],
                where : {
                    uuid: req.params.id
                },
                include : [{
                    model: Users,
                    attributes:['name','email'],
                }]
            })
        }else{
            response = await KTP.findOne({
                // attributes:['uuid','name','price'],
                where:{
                    userId: req.userId,
                    uuid : req.params.id
                },
                include:[{
                    model: Users,
                    attributes:['name','email'],
                }]
            })
        }
        res.status(200).json(response);
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const createKTP = async (req,res)=>{
    const {nik,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,golongan_darah,alamat,rt_rw,kelurahan,kecamatan,agama,status_perkawinan,pekerjaan,kewarganegaraan,file_name} = req.body;
    try{
        await KTP.create({
            nik :nik,nama,
            tempat_lahir:tempat_lahir,
            tanggal_lahir:tanggal_lahir,
            jenis_kelamin:jenis_kelamin,
            golongan_darah:golongan_darah,
            alamat:alamat,
            rt_rw:rt_rw,
            kelurahan:kelurahan,
            kecamatan:kecamatan,
            agama:agama,
            status_perkawinan:status_perkawinan,
            pekerjaan:pekerjaan,
            kewarganegaraan:kewarganegaraan,
            file_name:file_name,
            userId: req.userId
        });
        res.status(201).json({msg:"Create KTP Record Success"})
    }
    catch(error){
        if (error instanceof Sequelize.UniqueConstraintError) {
            res.status(400).json({ msg: "NIK already exists" });
        } else {
            res.status(500).json({ msg: error.message });
        }
    }
}

export const updateKTP = async (req,res)=>{
    try{
        const product = await KTP.findOne({
            where: {
                uuid: req.params.id
            }
        })
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"})
        const {nik,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,golongan_darah,alamat,rt_rw,kelurahan,kecamatan,agama,status_perkawinan,pekerjaan,kewarganegaraan,file_name} = req.body
        if(req.role === "admin"){
            await KTP.update({
                nik,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,golongan_darah,alamat,rt_rw,kelurahan,kecamatan,agama,status_perkawinan,pekerjaan,kewarganegaraan,file_name
            },{
                where: {
                    id: product.id
                }
            })
        }
        else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"})
            await KTP.update({
                nik,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,golongan_darah,alamat,rt_rw,kelurahan,kecamatan,agama,status_perkawinan,pekerjaan,kewarganegaraan,file_name
            },{
                where:{
                    [Op.and]: [{id: product.id},{userId: req.userId}]
                }
            })
        }
        res.status(200).json({msg: "KTP Record updated successfuly"})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const deleteKTP = async (req,res)=>{
    try{
        const ktp = await KTP.findOne({
            where:{
                uuid: req.params.id
            }
        })
        if(!ktp) return res.status(404).json({msg: "Data tidak ditemukan"})
        if(req.role === "admin"){
            await KTP.destroy({
                where:{
                    id: ktp.id
                }
            })
        }
        else{
            if(req.userId !== ktp.userId) return res.status(403).json({msg: "Akses Terlarang"})
            await KTP.destroy({
                where:{
                    [Op.and]:[{id: ktp.id}, {userId: req.userId}]
                }
            })
        }
        res.status(200).json({msg: "KTP Record deleted successfully"})
    }
    catch(error){
        res.status(500).json({msg: error.message})
    }
}