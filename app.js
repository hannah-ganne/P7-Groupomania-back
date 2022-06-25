const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const helmet = require('helmet');
const path = require('path');

const postRoutes = require('./routes/post.js');
const userRoutes = require('./routes/user.js');
const commentRoutes = require('./routes/comment.js')


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

//testing database connection
// try {
//     await db.authenticate();
//     console.log('Connection has been established successfully.');
//     } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     }

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/posts', postRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/comments', commentRoutes);

module.exports = app;