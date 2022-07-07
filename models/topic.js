const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database.js');

// define schema
const Topic = db.define('topic', {
    // define attributes
    name: { type: DataTypes.STRING, allowNull: false },
}, {
    freezeTableName: true
});

module.exports = Topic; 