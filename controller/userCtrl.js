const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt =require('jsonwebtoken')

const Payments = require('../models/paymentModel')

const createAccessToken = (user) => {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SEC, {expiresIn: '3d'} )
}

const createRefreshToken = (user) => {
    return jwt.sign(user,process.env.REFRESH_TOKEN_SEC, {expiresIn: '7d'} )
}


const userCtrl = {
    register: async (req, res) =>{
        try {
            const {name, email, password} = req.body;

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "The email already exists."})

            if(password.length < 6) 
                return res.status(400).json({msg: "Password is at least 6 characters long."})

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                name, email, password: passwordHash
            })

            // Save mongodb
            await newUser.save()

            // create jsonwebtoken to authentication
            const accesstoken = createAccessToken({id: newUser._id})
            const refreshToken = createRefreshToken({id: newUser._id})

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7d
            })
            // console.log(refreshToken)
            // console.log(accesstoken)
            res.json({accesstoken})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
   refreshToken: (req, res) =>{
    try {
        const rf_token = req.cookies.refreshToken;
        // console.log(req.cookies);
        if(!rf_token) return res.status(400).json({msg: "Please Login or Register first"})

        jwt.verify(rf_token, process.env.REFRESH_TOKEN_SEC, (err, user) =>{
            if(err) return res.status(400).json({msg: "Please Login or Register"})

            const accesstoken = createAccessToken({id: user.id})

            res.json({accesstoken})
        })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        
    },
    login: async (req, res) =>{
        try{
            const {email, password}=req.body;
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "User does not exist"})
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({msg: "Password incorrect"})
            
            //cretae a token and refresh token
            const accesstoken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7d
            })

            res.json({accesstoken})

            res.json({msg: "Login Success"})

        }catch(err){
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res)=>{
        try{
            res.clearCookie('refreshToken',{path: '/user/refresh_token'})
            return res.json({msg: "Logged out"})
        }catch(err){
            return res.status(500).json({msg: err.message})
        }

    },
    getUser: async (req, res)=>{
        try{
            const user = await Users.findById(req.user.id).select("-password")
            if( !user) return res.status(400).json({msg: "user doesn't exits"})
            res.json(user)
        }catch(err){
            return res.status(500).json({msg: err.message})

        }
    },
    addcart: async( req, res)=>{
        try{
            const user =  await Users.findById(req.user.id)
            if(!user) return res.status(400).json({msg: 'user does not exist.'})
            await Users.findOneAndUpdate({_id: req.user.id},{
                cart: req.body.cart
            })
            return res.status(200).json({msg: 'Add success'})
        }catch{
            return res.status(500).json({msg: err.message})

        }
    },
    history:async(req, res) =>{
        try {
            const history = await Payments.find({user_id: req.user.id})

            res.json(history)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }


}
module.exports = userCtrl