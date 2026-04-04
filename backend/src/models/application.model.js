const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    resume: String,
    coverLetter: {
        type: String,
    },   
    status: {
        type: String,
        enum: ["pending", "shortlisted", "rejected", "hired"],
        default: "pending"
    }
}, {timestamps: true});

// ❌ Prevent duplicate apply
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema)

module.exports = Application;