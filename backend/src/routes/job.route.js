const express = require("express");
const router = express.Router();

const {
    postJob,
    getAllJobs,
    getJobById,
    getJobsByCompany
} = require("../controllers/job.controller");

const employerAuth = require("../middlewares/employer.middleware");

// PUBLIC
router.get("/", getAllJobs);
router.get("/company/:companyId", getJobsByCompany);
router.get("/:id", getJobById);

// PROTECTED
router.post("/post", employerAuth.verifyEmployerJWT, postJob);

module.exports = router;