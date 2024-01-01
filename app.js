const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
// const SA = require('./superadmin/SA');
const https = require('https')
//const TMS_logs = require('./tms_trigger_logs');
//const checkState = require('./SMS/smsController');

/*               Interval                */

// const MinuteData = require('./dash/interval_min');
// const hourData = require('./dash/interval_hour');
// const weekData = require('./dash/interval_week');
// const dayData = require('./dash/interval_day');
// const MonthData = require('./dash/interval_month');
/*                 MQTT                  */
// const mqtt_sub = require('./sub');
// const mqtt_pub = require('./pub');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/tms.senselive.in/privkey.pem', 'utf8');
const fullchain = fs.readFileSync('/etc/letsencrypt/live/tms.senselive.in/fullchain.pem', 'utf8');

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

