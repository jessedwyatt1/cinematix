const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const configFilePath = path.join(__dirname, 'config.json');

// Middleware to read the configuration file
const readConfig = () => {
  if (fs.existsSync(configFilePath)) {
    const data = fs.readFileSync(configFilePath);
    return JSON.parse(data);
  }
  return null;
};

// Endpoint to get the configuration
router.get('/config', (req, res) => {
  const config = readConfig();
  res.json(config);
});

// Endpoint to save the configuration
router.post('/config', (req, res) => {
  const config = req.body;
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  res.status(200).send('Configuration saved successfully');
});

module.exports = router; 