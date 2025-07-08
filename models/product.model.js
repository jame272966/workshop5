const mongoose = require('mongoose');
const { Schema } = mongoose ;

const productSchema = new Schema({
    menu: { type: String , required: true},
    price: {type: Number , required: true},
}, {
    timestamps: true
}
)


module.exports =mongoose.model('product', productSchema) ;