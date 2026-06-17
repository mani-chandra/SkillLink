
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

app.use(express.json());

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const User = sequelize.define('User', { name: DataTypes.STRING, email: DataTypes.STRING });
await sequelize.sync();

app.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(5003, () => {
  console.log('Listening on 5003');
  const http = require('http');
  const postData = JSON.stringify({ name: 'test', email: 't@t.com' });
  const options = { hostname: 'localhost', port: 5003, path: '/', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } };
  const req = http.request(options, (res) => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => { console.log('Test result:', d); server.close(); });
  });
  req.write(postData);
  req.end();
});
