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
const upload = require("../middlewares/multer.middlewares");

// 👤 Employee
router.post("/apply/:jobId", employeeAuth.verifyEmployeeJWT, upload.fields([{ name: "resume", maxCount: 1 }]), applyJob);
router.get("/my", employeeAuth.verifyEmployeeJWT, getMyApplications);

// 🏢 Employer
router.get("/job/:jobId/applicants", employerAuth.verifyEmployerJWT, getJobApplications);
router.patch("/:applicationId/status", employerAuth.verifyEmployerJWT, updateApplicationStatus);
router.get("/employer", employerAuth.verifyEmployerJWT, getEmployerApplications);

module.exports = router;