// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database.js');

// define schema
const Like = db.define('likes', {
    // define attributes
    type: { type: DataTypes.INTEGER, allowNull: false },
}, {
    freezeTableName: true
});

module.exports = Like; 