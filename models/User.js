const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database.js');

// define schema
const User = db.define('user', {
    // define attributes
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false }, 
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING(64), allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false, defaultValue: '../images/user.png'},
    department: { type: DataTypes.STRING },
    expertIn: { type: DataTypes.STRING },
    interestedIn: { type: DataTypes.STRING },
    oneWord: { type: DataTypes.STRING },
    isUpFor: { type: DataTypes.JSON }
}, {
    freezeTableName: true
});

module.exports = User; 