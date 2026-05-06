const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express();
const path = require("path")

app.use(cors({
    origin: process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()),
    credentials: true
}))

app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({extended: true, limit: '100mb'}))
app.use(express.static('public'))
app.use(cookieParser())

const employeeRoutes = require("./routes/employee.route");
const employerRoutes = require("./routes/employer.route");
const jobRoutes = require("./routes/job.route");
const companyRoutes = require("./routes/company.route");
const applicationRoutes = require("./routes/application.route");

app.use("/api/employees", employeeRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);

module.exports = app;