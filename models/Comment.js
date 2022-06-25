// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');

// import connection
const db = require('../config/database.js');

// define schema
const Comment = db.define('Comment', {
    // define attributes
    userId: { type: DataTypes.STRING, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
}, {
    freezeTableName: true
});

module.exports = Comment;