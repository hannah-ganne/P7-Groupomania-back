// DAO model
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const Like = require('./likes');

let Init = async () => {
    Post.belongsTo(User, { onDelete: "CASCADE" });
    Comment.belongsTo(User);
    Comment.belongsTo(Post);
    Like.belongsTo(Post);
    Like.belongsTo(User);

    await User.sync({alter: true});
    await Post.sync({alter: true});
    await Comment.sync({ alter: true });
    await Like.sync({ alter: true });
}

module.exports = Init;