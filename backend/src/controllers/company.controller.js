const Company = require("../models/company.model");
const Employer = require("../models/employer.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


// ✅ CREATE COMPANY (only if not exists)
const createCompany = async (req, res) => {
    try {
        const { name, domain, location } = req.body;

        if (!name || !location) {
            throw new ApiError(400, "Name and location are required");
        }

        const existingCompany = await Company.findOne({ name });

        if (existingCompany) {
            throw new ApiError(400, "Company already exists. Please join.");
        }

        const company = await Company.create({
            name,
            domain,
            location,
            createdBy: req.user._id,
            employees: [req.user._id]
        });

        // link employer
        await Employer.findByIdAndUpdate(req.user._id, {
            company: company._id
        });

        return res.status(201).json(
            new ApiResponse(201, company, "Company created successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

// ✅ GET ALL COMPANIES
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().populate("createdBy", "name").populate("employers", "name");

        return res.status(200).json(
            new ApiResponse(200, companies, "All companies fetched")
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

// ✅ GET SINGLE COMPANY
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate("employers", "name email role")
            .populate("jobs");

        if (!company) {
            throw new ApiError(404, "Company not found");
        }

        return res.status(200).json(
            new ApiResponse(200, company, "Company details fetched")
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}


// ✅ JOIN COMPANY
const joinCompany = async (req, res) => {
    try {
        const { name } = req.body;

        const company = await Company.findOne({ name });

        if (!company) {
            throw new ApiError(404, "Company not found");
        }

        if (company.employers.includes(req.user._id)) {
            throw new ApiError(400, "Already joined this company");
        }

        company.employers.push(req.user._id);
        await company.save();

        await Employer.findByIdAndUpdate(req.user._id, {
            company: company._id
        });

        return res.status(200).json(
            new ApiResponse(200, company, "Joined company successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

// ✅ UPDATE COMPANY (Only creator or admin)
const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if(!company) {
            throw new ApiError(404, "Company not found");
        }

        if(company.createdBy.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized");
        }

        const updated = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updated, "Company updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

// ✅ GET COMPANY JOBS
const getCompanyJobs = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate("jobs");

        if(!company) {
            throw new ApiError(404, "Company not found");
        }

        return res.status(200).json(
            new ApiResponse(200, company.jobs, "Company jobs fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}



// ✅ SEARCH COMPANY (for dropdown/autocomplete)
const searchCompany = async (req, res) => {
    try {
        const { keyword } = req.query;

        const companies = await Company.find({
            name: { $regex: keyword, $options: "i" }
        }).limit(10);

        return res.status(200).json(
            new ApiResponse(200, companies, "Companies fetched")
        );

    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


module.exports = {
    createCompany,
    getAllCompanies,
    getCompanyById,
    joinCompany,
    updateCompany,
    getCompanyJobs,
    searchCompany
};