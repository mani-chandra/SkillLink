const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './new-database.sqlite',
  logging: console.log
});

module.exports = sequelize;
