const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const employerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']

    },  
    phone: {
        type: Number
    }, 
    avatar: {
        type: String
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },

    //  Role inside company
    role: {
        type: String,
        enum: ["recruiter", "hr", "manager"],
        default: "recruiter"
    },

    // 🔐 Auth system
    refreshToken: {
        type: String
    },

    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

employerSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return ;

    this.password = await bcrypt.hash(this.password, 10);
    // next();
});

employerSchema.methods.isPasswordMatch = async function(password) {
    return await bcrypt.compare(password, this.password);
}

employerSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

employerSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer;