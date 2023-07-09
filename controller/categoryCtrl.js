const Category = require('../models/categoryModel')



const categoryCtrl ={
    getCategories: async(req, res)=>{
        try{
            const categories = await Category.find();
            res.json(categories)
        }catch(err){
            return res.status(500).json({smg: err.message})
        }
    },
    createCategory: async(req,res)=>{
         try{
             const {name} = req.body;
             const category = await Category.findOne({name})
             if (category) return res.status(400).json({msg: "Cannot find category"})
             const newCategory = new Category({name})
            await newCategory.save();
            res.json({msg: 'created successfully'})
            
         }catch(err){
            return res.status(500).json({smg: err.message})
         }
    },
    deleteCategory: async(req, res)=>{
        try{
            await Category.findByIdAndDelete(req.params.id)
            res.json({msg: "deleted successfully!"})
        }catch(err){
            return res.status(500).json({smg: err.message})

        }
    }, 
    updateCategory: async(req, res)=>{
        try{
           const {name}= req.body;
           await Category.findOneAndUpdate({_id: req.params.id},{name})
           res.json({msg: 'update successfully!!'})
        }catch(err){
            return res.status(500).json({smg: err.message})

        }
    }
}

module.exports = categoryCtrl