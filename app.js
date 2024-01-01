const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https')

const privateKey = fs.readFileSync('./cert/private-key.pem', 'utf8');
const fullchain = fs.readFileSync('./cert/public-cert.pem', 'utf8');

const credentials = { key: privateKey, cert: fullchain };

const app = express();

const port = 3000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use(SA.log);

// Use the router for handling routes
app.use(router);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
  console.log(`HTTPS server listening on port ${port}`);
});
// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

