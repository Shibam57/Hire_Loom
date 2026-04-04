const express = require("express");
const router = express.Router();

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    joinCompany,
    updateCompany,
    getCompanyJobs
} = require("../controllers/company.controller");

const employerAuth = require("../middlewares/employer.middleware");

// PUBLIC
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.get("/:id/jobs", getCompanyJobs);

// PROTECTED
router.post("/create", employerAuth.verifyEmployerJWT, createCompany);
router.post("/join", employerAuth.verifyEmployerJWT, joinCompany);
router.put("/:id", employerAuth.verifyEmployerJWT, updateCompany);

module.exports = router;