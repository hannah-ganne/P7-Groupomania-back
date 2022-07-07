const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database.js');

// define schema
const Department = db.define('department', {
    // define attributes
    name: { type: DataTypes.STRING, allowNull: false },
}, {
    freezeTableName: true
});

module.exports = Department; 