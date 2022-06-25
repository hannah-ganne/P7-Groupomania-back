// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');

// import connection
const db = require('../config/database.js');

// define schema
const Post = db.define('Post', {
    // define attributes
    userId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false }, 
    topic: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false},
    likes: { type: DataTypes.INTEGER, allowNull: false },
    dislikes: { type: DataTypes.INTEGER, allowNull: false },
    usersLiked: { type: DataTypes.JSON, allowNull: false },
    usersDisliked: { type: DataTypes.JSON, allowNull: false }
}, {
    freezeTableName: true
});

module.exports = Post;