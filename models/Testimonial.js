const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const testimonialSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    published: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true })

const Testimonial = mongoose.model("Testimonial", testimonialSchema);
module.exports = Testimonial;