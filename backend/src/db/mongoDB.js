const express = require('express');
const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        // console.log(`/n MongoDB connect !! DB host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;