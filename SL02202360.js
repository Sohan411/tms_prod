const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

// MQTT broker URL
const broker = 'ws://65.2.127.156:9001';

// MySQL configuration
const mysqlConfig = {
  host: '13.200.38.129',
  user: 'mysql',
  password: 'sense!123',
  database: 'tms',
  port: 3306,
};

// Create a MySQL connection pool
const mysqlPool = mysql.createPool(mysqlConfig);

// Fetch the local IP address
const localIpAddress = getLocalIpAddress();

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    const iface = interfaces[key];
    for (const item of iface) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return 'Unknown';
}

console.log('Local IP Address:', localIpAddress);

const options = {
  username: 'Sense2023',
  password: 'sense123',
};

// Connect to the MQTT broker
const mqttClient = mqtt.connect(broker, options);

// Handle MQTT connection event
mqttClient.on('connect', () => {
  const deviceId = 'SL02202360';
  const topic = `Sense/Live/${deviceId}`;

  mqttClient.subscribe(topic, (error) => {
    if (error) {
      console.error(`Error subscribing to ${topic}:`, error);
    } else {
      console.log(`Subscribed to ${topic}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if (topic === `Sense/Live/SL02202360`) {
    try {
      const data = JSON.parse(message);
      const insertQuery = `
        INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, totalVolume, ip_address)
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        data.DeviceUID,
        data.Temperature,
        data.TemperatureR,
        data.TemperatureY,
        data.TemperatureB,
        data.Humidity,
        data.flowRate,
        data.totalVolume,
        localIpAddress,
      ];

      mysqlPool.query(insertQuery, insertValues, (error) => {
        if (error) {
          console.error('Error inserting data into MySQL:', error);
        } else {
          console.log('Data inserted into MySQL');
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
