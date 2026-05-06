const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
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
        minlength: 8
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        // default: 0,
        trim: true
    },
    education: {
        degree: {
            type: String, // B.Tech, B.Sc, Diploma
            default: null
        },
        branch: {
            type: String, // CSE, Civil, Electrical
            default: null
        },
        college: {
            type: String
        },
        graduationYear: {
            type: Number
        }
    },
    skills: [
        {
            name: String,
            level: {
                type: String,
                enum: ["Beginner", "Intermediate", "Advanced"],
                default: "Beginner"
            }
        }
    ],
    experience: {
        type: Number,
        default: 0
    },
    resume: {
        type: String
    },
    github: {
        type: String
    },  
    linkedin: {
        type: String
    },
    avatar: {
        type: String
    },
    location: {
        type: String,
    },
    bio: {
        type: String
    },
    savedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job"
        }
    ],
    appliedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application"
        }
    ]
}, {timestamps: true});

employeeSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return ;
    }
    this.password = await bcrypt.hash(this.password, 10);
    // next();
})

employeeSchema.methods.isPasswordMatch = async function(password) {
    return await bcrypt.compare(password, this.password);
}

employeeSchema.methods.generateAccessToken = async function() {
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

employeeSchema.methods.generateRefreshToken = async function() {
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

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;