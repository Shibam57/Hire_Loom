const Job = require("../models/job.model");
const Application = require("../models/application.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ==============================
// 📊 EMPLOYER DASHBOARD
// ==============================
const getEmployerDashboard = async (req, res) => {
    try {
        const employerId = req.user._id;

        // ✅ Get all jobs of this employer
        const jobs = await Job.find({ createdBy: employerId });

        // ✅ Count total jobs
        const totalJobs = jobs.length;

        // ✅ Get job IDs
        const jobIds = jobs.map(job => job._id);

        // ✅ Count total applicants
        const totalApplicants = await Application.countDocuments({
            job: { $in: jobIds }
        });

        // ✅ Add applicant count to each job
        const jobsWithApplicants = await Promise.all(
            jobs.map(async (job) => {
                const count = await Application.countDocuments({ job: job._id });

                return {
                    ...job.toObject(),
                    applicants: count
                };
            })
        );

        return res.status(200).json(
            new ApiResponse(200, {
                jobs: jobsWithApplicants,
                totalJobs,
                totalApplicants
            }, "Dashboard data fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

module.exports = {
    getEmployerDashboard
};