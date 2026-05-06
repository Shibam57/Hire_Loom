const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    resume: {
        type: {
            url: String,
            public_id: String
        },
        required: true
    },
    coverLetter: {
        type: String,
    },   
    status: {
        type: String,
        enum: ["pending", "shortlisted", "interview", "rejected", "hired"],
        default: "pending"
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true});

// ❌ Prevent duplicate apply
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

// 🚀 Performance indexes
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });

applicationSchema.pre("save", function () {
  if (this.isModified("status")) {
    this.statusUpdatedAt = Date.now();
  }
//   next();
});


const Application = mongoose.model("Application", applicationSchema)

module.exports = Application;