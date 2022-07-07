// DAO model
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const Like = require('./likes');
const Populate = require('./populate');
const Department = require('./department');
const Topic = require('./topic')

let Init = async () => {
    Post.belongsTo(User, { onDelete: "CASCADE" });
    Post.hasMany(Comment);
    Comment.belongsTo(User, { onDelete: "CASCADE" });
    Comment.belongsTo(Post, { onDelete: "CASCADE" });
    Post.hasMany(Like);
    Like.belongsTo(Post, { onDelete: "CASCADE" });
    Like.belongsTo(User, { onDelete: "CASCADE" });

    await User.sync({alter: true});
    await Post.sync({alter: true});
    await Comment.sync({ alter: true });
    await Like.sync({ alter: true });
    await Department.sync({ alter: true });
    await Topic.sync({ alter: true });

    await Populate();
}

module.exports = Init;