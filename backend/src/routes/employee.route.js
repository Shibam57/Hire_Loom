const express = require('express');
const { registerEmployee, loginEmployee, getEmployeeProfile, employeeLogout, updateEmployeeProfile, addEmployeeSkills, refreshAccessToken } = require('../controllers/employee.controller');
const employeeAuth = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', registerEmployee);
router.post('/login', loginEmployee);

router.get("/profile", employeeAuth.verifyEmployeeJWT, getEmployeeProfile);
router.put("/profile/update", employeeAuth.verifyEmployeeJWT, updateEmployeeProfile);
router.post("/skills/add", employeeAuth.verifyEmployeeJWT, addEmployeeSkills);
router.post("/logout", employeeAuth.verifyEmployeeJWT, employeeLogout)

module.exports = router;