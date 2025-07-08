const mongoose = require('mongoose');
const { Schema } = mongoose ;

const userSchema = new Schema({
    name: { type: String },
    password: {type: String}
}, {
    timestamps: true
}
)

module.exports = mongoose.model('uers', userSchema) ;
