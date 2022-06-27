// Database
const db = require('../config/database');
// DAO model
const User = require('./user');
const Post = require('./post');
const Comment = require('./Comment')
// Uility
const Populate = require('./populate');

let Init = async () => {
    // Post.hasMany(Comment);
    Post.belongsTo(User, {onDelete: "CASCADE"});

    await User.sync({alter: true});
    await Post.sync({alter: true});
    // await Comment.sync({alter: true})

    // await Populate();
}

module.exports = Init;