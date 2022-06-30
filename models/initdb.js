// DAO model
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment')

let Init = async () => {
    // Post.hasMany(Comment);
    Post.belongsTo(User, { onDelete: "CASCADE" });
    Comment.belongsTo(User);
    Comment.belongsTo(Post);

    await User.sync({alter: true});
    await Post.sync({alter: true});
    await Comment.sync({alter: true})

}

module.exports = Init;