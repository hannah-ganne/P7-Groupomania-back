// import sequelize
const Sequelize = require('sequelize')

// create connection
const db = new Sequelize(process.env.SEQUELIZE_DB, process.env.SEQUELIZE_USER, process.env.SEQUELIZE_PW, {
    host: 'localhost',
    dialect: 'mysql',
});

// export connection
module.exports = db;