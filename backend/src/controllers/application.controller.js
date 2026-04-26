const Application = require('../models/application.model');
const Job = require('../models/job.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadToCloudinary } = require('../utils/cloudinary');

// ✅ APPLY FOR A JOB
const applyJob = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { jobId, coverLetter } = req.body;

        // 🔍 Check job exists
        const job = await Job.findById(jobId);
        if(!job) {
            throw new ApiError(404, "Job not found");
        }

        // ❌ Prevent duplicate apply
        const alreadyApplied = await Application.findOne({
            applicant: employeeId,
            job: jobId
        });
        if(alreadyApplied) {
            throw new ApiError(400, "You have already applied for this job");
        }

        const resumePath = req.files?.resume?.[0]?.path;
        if(!resumePath) {
            throw new ApiError(400, "Resume is required");
        }

        // ☁️ Upload resume to cloudinary
        const upload = await uploadToCloudinary(resumePath, "resumes");

        const application = await Application.create({
            applicant: employeeId,
            job: jobId,
            company: job.company,
            resume: upload.secure_url,
            coverLetter
        });

        return res.status(201).json(new ApiResponse(201, application, "Applied successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

// ✅ GET MY APPLICATIONS (Employee)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user.id
        })
        .populate('job', 'title company')
        .populate('company', 'name logo');

        return res.status(200).json(new ApiResponse(200, applications, "My applications retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

// ✅ GET JOB APPLICATIONS (Employer)
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const employerId = req.user._id;

        // ✅ Check job belongs to this employer
        const job = await Job.findOne({
            _id: jobId,
            createdBy: employerId
        });

        if (!job) {
            throw new ApiError(403, "Not authorized to view applications");
        }

        const applications = await Application.find({
            job: jobId,
            company: employerId
        })
        .populate('applicant', 'name email skills experience')
        .populate('job', 'title company');

        return res.status(200).json(new ApiResponse(200, applications, "Job applications retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

// ✅ UPDATE APPLICATION STATUS (Employer)
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        );

        return res.status(200).json( new ApiResponse(200, application, "Application status updated successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const getEmployerApplications = async (req, res) => {
    try {
        const employerId = req.user._id;

        const jobs = await Job.find({ createdBy: employerId }).select("_id");

        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({
            job: { $in: jobIds }
        })
        .populate("applicant", "name email skills")
        .populate("job", "title");

        return res.status(200).json(
            new ApiResponse(200, applications, "All applications fetched")
        );

    } catch (error) {
        throw error;
    }
};

module.exports = {
    applyJob,
    getMyApplications,
    getJobApplications,
    getEmployerApplications,
    updateApplicationStatus
}