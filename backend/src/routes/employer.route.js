const express = require("express");
const router = express.Router();

const {
    registerEmployer,
    loginEmployer,
    logoutEmployer,
    refreshAccessToken,
    getEmployerProfile,
    updateEmployerProfile
} = require("../controllers/employer.controller");

const employerAuth = require("../middlewares/employer.middleware");

// PUBLIC
router.post("/register", registerEmployer);
router.post("/login", loginEmployer);
router.post("/refresh-token", refreshAccessToken);

// PROTECTED
router.post("/logout", employerAuth.verifyEmployerJWT, logoutEmployer);
router.get("/profile", employerAuth.verifyEmployerJWT, getEmployerProfile);
router.put("/profile", employerAuth.verifyEmployerJWT, updateEmployerProfile);

module.exports = router;