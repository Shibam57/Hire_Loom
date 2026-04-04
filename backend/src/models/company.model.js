const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    domain: {
        type: String, // example: tcs.com
        lowercase: true,
        trim: true
    },
    logo: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    industry: {
        type: String
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    foundedYear: {
        type: Number
    },
    employeesCount: {
        type: Number
    },

    //  Who created this company
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer'
    },

    //  All employers in this company
    employers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employer"
        }
    ],

    // 🔗 Jobs posted by this company
    jobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job"
        }
    ],

    //  Optional: Approval system
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;