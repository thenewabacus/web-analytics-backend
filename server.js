require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const morgan = require('morgan');
const app = express();
app.use(morgan('tiny'));

const countHits = require('./utils/hitCounter')
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public/index.html');
  res.sendFile(indexPath);
});
app.use(countHits)

app.use((req, res, next) => {
  if (req.path !== '/logo.png' && req.path !== '/') {
    return res.status(404).send('404 Not Found');
  }
  next();
});

app.use(express.static(__dirname, { dotfiles: 'allow' }));

const privateKey = fs.readFileSync(process.env.privkey, process.env.encoding);
const certificate = fs.readFileSync(process.env.cert, process.env.encoding);
const ca = fs.readFileSync(process.env.chain, process.env.encoding);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});