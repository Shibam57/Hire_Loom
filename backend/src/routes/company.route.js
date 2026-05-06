const express = require("express");
const router = express.Router();

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    joinCompany,
    updateCompany,
    getCompanyJobs,
    searchCompany
} = require("../controllers/company.controller");

const employerAuth = require("../middlewares/employer.middleware");
const upload = require("../middlewares/multer.middlewares");

// PUBLIC
router.get("/", getAllCompanies);
router.get("/search", searchCompany); 
router.get("/:id", getCompanyById);
router.get("/:id/jobs", getCompanyJobs);

// PROTECTED
router.post("/", employerAuth.verifyEmployerJWT, upload.single("logo"), createCompany);
router.post("/join/:id", employerAuth.verifyEmployerJWT, joinCompany);
router.put("/:id", employerAuth.verifyEmployerJWT, updateCompany);

module.exports = router;