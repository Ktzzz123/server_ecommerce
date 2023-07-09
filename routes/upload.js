const router = require('express').Router()
const cloudinary = require('cloudinary')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const fs = require('fs')

// image will be uploaded in cloudinary

cloudinary.config({
    cloud_name: process.env.ClOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SEC
})
//delete image from tmp
const removeTmp = (path)=>{
    fs.unlink(path, err=>{
        if(err) throw err;

    })
}
//up image to cloudinary 
router.post('/upload',auth, authAdmin, ( req ,res)=>{
    try{
        console.log(req.files)
        if(!req.files || Object.keys(req.files).length ===0)
            return res.status(400).json({msg: 'No files were uploaded'})
        
        const file = req.files.file;

        if(file.size> 1024*1024){
            removeTmp(file.tempFilePath);
            return res.status(400).json({msg: 'file too large'})

        }
        if (file.mimetype !== 'image/jpeg' && file.mimetype !='image/png'){
            removeTmp(file.tempFilePath);
            return res.status(400).json({msg: `File format isn't connect`})
        }
           

           cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(err, result)=>{
            if(err) throw err;
            removeTmp(file.tempFilePath);
            res.json({public_id: result.public_id,url:result.secure_url})
            
            
        })
       
    }catch(err){
        return res.status(500).json({smg: err.message}) 
    }
})

//Delete image in cloudinary

router.post('/destroy',auth, authAdmin, (req, res)=>{
    try{
        const {public_id}=req.body;
        if(!public_id) return res.status(400).json({mg: 'nothing to delete'})

        cloudinary.v2.uploader.destroy(public_id,async(err, result)=>{
            if(err) throw err;
            res.json({msg: 'image was deleted '})
        })
    }
    catch(err){
        return res.status(500).json({mg: err.message})
    }
    
})

module.exports = router