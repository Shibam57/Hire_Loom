const mongoose = require('mongoose');
const { create } = require('./employer.model');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    salary: {
        type: String,
    },
    location: {
        type: String,
        required: true
     },
     jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'work from home']
    }, 
    experienceRequired: {
        type: String,
        enum: ["fresher", "junior", "mid", "senior"]
    },
    skillsRequired: {
        type: [String],
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer'
    }
}, {timestamps: true});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;