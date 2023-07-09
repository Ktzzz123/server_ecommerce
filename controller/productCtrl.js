const Products = require('../models/productModel')

//CRUD

const productCtr = {
    getProducts: async(req, res)=>{
        try{
            console.log(req.query)
            const features = new APIfeatures(Products.find(), req.query).filtering().sorting().paginating()
           const products = await features.query
           res.json({
               status: 'success',
               result: products.length,
               product: products
           })
        }catch(err){
            return res.status(500).json({smg: err.message})
        }
    },
    createProduct: async(req, res)=>{
        try{
            const {product_id, title, price, description, content, images, category} = req.body;
            if(!images) return res.status(500).json({smg: 'no image'})

            const product = await Products.findOne({product_id})
            if(product)return res.status(500).json({smg: "no product"})
            const newProduct = new Products({product_id, title: title.toLowerCase(), price, description, content, images, category})
            await newProduct.save()
            res.json({msg: 'create successfully'})
        }catch(err){
            return res.status(500).json({smg: err.message})
        }
    }, 
    deleteProduct: async(req, res)=>{
        try{
            await Products.findByIdAndDelete(req.params.id)
            return res.json({msg: "delete successfully"})
        }catch(err){
            return res.status(500).json({smg: err.message})
        }
    },
    updateProduct: async(req, res)=>{
        try{
        const { title, price, description, content, images, category} = req.body;
        if(!images) return res.status(500).json({smg: 'no image'})
        await Products.findOneAndUpdate({_id: req.params.id},{
            title: title.toLowerCase(), price, description, content, images, category
        })
        res.json({msg: 'updated'})
        }catch(err){
            return res.status(500).json({smg: err.message})
        }
    },

}
// Filter, Sort and Paginating  

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString=queryString;
    }
    filtering(){
        const queryObject = {...this.queryString}
        const excludeFields = ['page','sort','limit']
        excludeFields.forEach(el=>delete(queryObject[el])) //delete query after close page
        let queryStr= JSON.stringify(queryObject)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' +match) // identify special character
        // gte : >=
        // lte : <=
        // gt  : >
        // lt  : <
        this.query.find(JSON.parse(queryStr)) // find product by queryStr
        return this;

    }
    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ') //
            console.log(sortBy);
        }else{
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }
    paginating(){
        const page = this.queryString.page * 1 || 1 // set page
        const limit = this.queryString.limit * 1 || 99 //limit product of 1 page
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)

        return this;
    }
}
module.exports = productCtr