const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Employer = require('../models/employer.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ✅ POST JOB
const postJob = async (req, res) =>{
    try {
        const employerId = req.user._id;

        const employer = await Employer.findById(employerId);

        if(!employer) {
            throw new ApiError(404, "Employer not found");
        }

        if(!employer.company) {
            throw new ApiError(400, "Employer does not belong to any company");
        }

        const { title, description, salary, location, jobType, experienceRequired, skillsRequired } = req.body;

        if(!title || !description || !location) {
            throw new ApiError(400, "Title and description are required");
        }

        const job = await Job.create({
            title,
            description,
            location,
            salary,
            jobType,
            experienceRequired,
            skillsRequired,
            company: employer.company,
            createdBy: employerId
        })

        await Company.findByIdAndUpdate(
            employer.company,
            {
                $push: { jobs: job._id }
            }
        );

        return res.status(201).json(new ApiResponse(201, job, "Job created successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
        
    }
}

// ✅ GET ALL JOBS
const getAllJobs = async (req, res) => {
    try {
        const {
            keyword, 
            location, 
            jobType, 
            experienceRequired,
            skills,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // 🔍 Search by title
        if(keyword) {
            query.title = { $regex: keyword, $options: "i" };
        }

        // 📍 Filter by location
        if(location) {
            query.location = { $regex: location, $options: "i" };
        }

        // 💼 Filter by job type
        if(jobType) {
            query.jobType = jobType;
        }

        // 📊 Experience
        if (experienceRequired) {
            query.experienceRequired = experienceRequired;
        }

        // 🧠 SKILL FILTER (IMPORTANT 🔥)
        if (skills) {
            const skillArray = skills.split(","); 
            // example: "react,node,mongodb"

            query.skillsRequired = {
                $in: skillArray.map(skill => new RegExp(skill, "i"))
            };
        }

        const jobs = await Job.find(query)
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Job.countDocuments(query);

        return res.status(201).json(new ApiResponse(201, { jobs, total }, "Jobs fetched successfully"));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("company", "name logo location")
            .populate("createdBy", "name email");

        if(!job) {
            throw new ApiError(404, "Job not found");
        }

        return res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const getJobsByCompany = async (req, res) => {
    try {
        const jobs = await Job.find({ company: req.params.companyId  })
            .populate("company", "name logo")

        return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

module.exports = {
    postJob,
    getAllJobs,
    getJobById,
    getJobsByCompany
}