const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const helmet = require('helmet');
const path = require('path');
const Init = require('./models/initdb');

const postRoutes = require('./routes/post.js');
const userRoutes = require('./routes/user.js');
const commentRoutes = require('./routes/comment.js');
const likeRoutes = require('./routes/like.js');

const app = express(); 

app.use(express.json());

app.use(cors());

/**
 * allow frontend and backend using different ports
 */
app.use(helmet({ 
    crossOriginResourcePolicy: false 
    })
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

Init()
    .then(() => {
        app.use('/images', express.static(path.join(__dirname, 'images')));
        app.use('/api/posts', postRoutes);
        app.use('/api/auth', userRoutes);
        app.use('/api/posts', commentRoutes);
        app.use('/api/posts', likeRoutes);
    })
    .catch(err => console.log(err));

module.exports = app;