const router = require('express').Router()
const authAdmin = require('../middleware/authAdmin')
const auth = require('../middleware/auth')
const productCtr = require('../controller/productCtrl')


router.route('/products')
    .get(productCtr.getProducts)
    .post( auth, authAdmin, productCtr.createProduct)

router.route('/products/:id')
    .delete(auth, authAdmin,productCtr.deleteProduct)
    .put(auth, authAdmin,productCtr.updateProduct)


module.exports = router