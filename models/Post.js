// import sequelize, init DataTypes
const { Sequelize, DataTypes } = require('sequelize');
const User = require ('./User');

// import connection
const db = require('../config/database.js');

// define schema
const Post = db.define('Post', {
    // define attributes
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

User.hasMany(Post, {
    foreignKey: 'userId'
});
Post.belongsTo(User);
Post.sync();

module.exports = Post;  