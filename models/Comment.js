// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database.js');

// define schema
const Comment = db.define('comment', {
    // define attributes
    comment: { type: DataTypes.TEXT, allowNull: false },
}, {
    freezeTableName: true
});

module.exports = Comment; 