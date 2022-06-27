const User = require('./user');
const Post = require('./post');

module.exports = async () => {
// Démarre 2 tâches en parallèle et on attend que les deux soient finies
await Promise.all([
    (async()=> await User.create({
        firstName: 'Samuel',
        lastName: 'James', 
        email: 'samuel@test.com',
        password: '1234asdASD'
    }))(),
    (async()=> await User.create({
        firstName: 'Theodore',
        lastName: 'Crepey',
        email: 'theo@test.com',
        password: '1234asdASD'
    }))(),
    (async()=> await Post.create({
        title: 'sample title', 
        topic: 'sample topic',
        description: 'sample description',
        imageUrl: 'sample image url',
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    }))(),
]);
}