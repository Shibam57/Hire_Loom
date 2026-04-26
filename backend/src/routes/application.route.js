const express = require("express");
const router = express.Router();

const {
    applyJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    getEmployerApplications
} = require("../controllers/application.controller");

const employeeAuth = require("../middlewares/auth.middleware");
const employerAuth = require("../middlewares/employer.middleware");

// 👤 Employee
router.post("/apply", employeeAuth.verifyEmployeeJWT, applyJob);
router.get("/my", employeeAuth.verifyEmployeeJWT, getMyApplications);

// 🏢 Employer
router.get("/job/:jobId", employerAuth.verifyEmployerJWT, getJobApplications);
router.put("/:applicationId/status", employerAuth.verifyEmployerJWT, updateApplicationStatus);
router.get("/employer", employerAuth.verifyEmployerJWT, getEmployerApplications);

module.exports = router;