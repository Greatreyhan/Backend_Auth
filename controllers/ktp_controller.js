import KTP from "../models/ktp_model.js";
import Users from "../models/user_model.js";
import {Op} from "sequelize";
import { Sequelize } from "sequelize";
import Tesseract from 'tesseract.js';
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import {cleanText, extractKTPData} from "../utils/extractKTP.js"

export const getKTP = async (req,res)=>{
    try{
        let response;
        if(req.role === "admin"){
            response = await KTP.findAll({
                include : [{
                    model: Users,
                    attributes:['name','email'],
                }]
            })
        }else{
            response = await KTP.findAll({
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
    console.log(req.body, req.userId)
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

export const extractKTPPhoto = async (req, res) => {
    console.log('extract data')
    const imagePath = req.file.path;
    const processedImagePath = `./public/images/processed_${req.file.filename}`;

    // Resize dan konversi gambar ke grayscale menggunakan sharp
    sharp(imagePath)
        .resize({ width: 800 })
        .greyscale()
        .toFile(processedImagePath)
        .then(() => {
            // Jalankan OCR menggunakan Tesseract
            Tesseract.recognize(processedImagePath, 'ind', {
                logger: info => {
                    // console.log(info)
                } // Info proses OCR
            })
                .then(result => {
                    // Hapus gambar yang sudah diproses
                    // fs.unlinkSync(imagePath);
                    fs.unlinkSync(processedImagePath);

                    // Ekstrak data dari teks hasil OCR
                    const { data, cleanedText } = extractKTPData(result.data.text);
                    const fix_path = '/assets/'+(imagePath.slice(7));
                    res.json({ message: 'Extract data Success',data, imagePath: fix_path });
                })
                .catch(error => {
                    // Tangani kesalahan OCR
                    res.status(500).json({ message: 'Error during OCR process.', error: error.message });
                });
        })
        .catch(error => {
            // Tangani kesalahan saat memproses gambar
            res.status(500).json({ message: 'Error processing image.', error: error.message });
        });
}

// Dashboard
export const getTotalKTP = async (req,res)=>{
    try {
        let response, totalRecords;
    
        // If user is admin
        if (req.role === "admin") {
          totalRecords = await KTP.count(); // Get the total number of records

        } else {
          // If user is not admin
          totalRecords = await KTP.count({ where: { userId: req.userId } }); // Count records for the specific user
        }
    
        // Return both the total count and the records
        res.status(200).json({
            message: 'Count data Success',
            data: totalRecords, // Number of records
        });
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
}