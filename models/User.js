// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');

// import connection
const db = require('../config/database.js');

// define schema
const User = db.define('User', {
    // define attributes
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false }, 
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING(64), allowNull: false }
}, {
    freezeTableName: true
});

module.exports =  User; 