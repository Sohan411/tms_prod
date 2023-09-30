const bcrypt = require('bcrypt');
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('../token/secure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


function fetchAllUsers(req, res) {
    try {
      const query = 'SELECT * FROM tms_users';
      db.query(query, (error, rows) => {
        if (error) {
          throw new Error('Error fetching users');
        }
        const encryptedUsers = secure.encryptData(rows, encryptKey);
  
        res.json({ users: rows });
        /*res.json({ users: encryptedUsers });*/
        console.log(rows);
        console.log(encryptedUsers)
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function fetchAllDevices(req, res) {
    try {
      const query = 'SELECT * FROM tms_devices';
      db.query(query, (error, rows) => {
        if (error) {
          throw new Error('Error fetching devices');
        }
        res.json({ devices: rows });
        console.log(rows);
      });
    } catch (error) {
      console.error('Error fetching Devices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

function userByCompanyname(req, res) {
    try {
      const company_name = req.params.company_name;
      const getDeviceByIdQuery = 'SELECT FirstName,LastName,CompanyName,CompanyEmail,ContactNo,Location,UserType,PersonalEmail FROM tms_users WHERE CompanyName = ?';
  
      db.query(getDeviceByIdQuery, [company_name], (error, result) => {
        if (error) {
          console.error('Error fetching device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        res.json(result);
      });
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  //DEVICES
  function addDevice(req, res) {
    try {
      const { EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName } = req.body;
      const createDeviceQuery = 'INSERT INTO tms_devices (EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName) VALUES (?, ?, ?, ?, ?, ?)';
  
      db.query(createDeviceQuery, [EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName], (error, result) => {
        if (error) {
          console.error('Error adding device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        res.json({ message: 'Device added successfully' });
      });
    } catch (error) {
      console.error('Error adding device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function getDeviceByUID(req, res) {
    try {
      const deviceUID = req.params.deviceUID;
      const getDeviceByIdQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';
  
      db.query(getDeviceByIdQuery, [deviceUID], (error, result) => {
        if (error) {
          console.error('Error fetching device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        res.json(result[0]);
      });
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function updateDevice(req, res) {
    try {
      const deviceUID = req.params.deviceUID;
      const { EntryId, DeviceLocation, DeviceName, CompanyEmail, CompanyName } = req.body;
      const updateDeviceQuery =
        'UPDATE tms_devices SET EntryId=?, DeviceLocation=?, DeviceName=?, CompanyEmail=?, CompanyName=? WHERE DeviceUID=?';
  
      db.query(
        updateDeviceQuery,
        [EntryId, DeviceLocation, DeviceName, CompanyEmail, CompanyName, deviceUID],
        (error, result) => {
          if (error) {
            console.error('Error updating device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Device not found' });
          }
  
          res.json({ message: 'Device updated successfully' });
        }
      );
    } catch (error) {
      console.error('Error updating device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // function deleteDevice(req, res) {
  //   try {
  //     const deviceUID = req.params.deviceUID;
  //     const deleteDeviceQuery = 'DELETE FROM tms_devices WHERE DeviceUID = ?';
  
  //     db.query(deleteDeviceQuery, [deviceUID], (error, result) => {
  //       if (error) {
  //         console.error('Error deleting device:', error);
  //         return res.status(500).json({ message: 'Internal server error' });
  //       }
  
  //       if (result.affectedRows === 0) {
  //         return res.status(404).json({ message: 'Device not found' });
  //       }
  
  //       res.json({ message: 'Device deleted successfully' });
  //     });
  //   } catch (error) {
  //     console.error('Error deleting device:', error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // }


 
  function fetchCompanyDetails(req, res) {
    const CompanyEmail = req.params.CompanyEmail;
    const companyQuery = 'SELECT CompanyName, ContactNo, Location, Designation FROM tms_users WHERE CompanyEmail = ?';
  
    db.query(companyQuery, [CompanyEmail], (error, companyResult) => {
      if (error) {
        console.error('Error fetching company details:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (companyResult.length === 0) {
        console.log('company not found!');
        return res.status(404).json({ message: 'company not found!' });
      }
  
      const company = companyResult[0];
      res.json({ companyDetails: company });
    });
  }

  function fetchCounts(req, res) {
    const CompanyEmail = req.params.CompanyEmail;
    const standardUserCountQuery = 'SELECT COUNT(*) AS standardUserCount FROM tms_users WHERE CompanyEmail = ? AND UserType = "Standard"';
    const adminCountQuery = 'SELECT COUNT(*) AS adminCount FROM tms_users WHERE CompanyEmail = ? AND UserType = "Admin"';
    const deviceCountQuery = 'SELECT COUNT(*) AS deviceCount FROM tms_devices WHERE CompanyEmail = ?';
    const userCountQuery = 'SELECT COUNT(*) AS userCount FROM tms_users WHERE CompanyEmail = ?';
  
    try {
      db.query(standardUserCountQuery, [CompanyEmail], (error, standardUserResult) => {
        if (error) {
          console.error('Error fetching standard user count:', error);
          throw new Error('Internal server error');
        }
  
        const standardUserCount = standardUserResult[0].standardUserCount;
  
        db.query(adminCountQuery, [CompanyEmail], (error, adminResult) => {
          if (error) {
            console.error('Error fetching admin count:', error);
            throw new Error('Internal server error');
          }
  
          const adminCount = adminResult[0].adminCount;
  
          db.query(deviceCountQuery, [CompanyEmail], (error, deviceResult) => {
            if (error) {
              console.error('Error fetching device count:', error);
              throw new Error('Internal server error');
            }
  
            const deviceCount = deviceResult[0].deviceCount;
  
            db.query(userCountQuery, [CompanyEmail], (error, userResult) => {
              if (error) {
                console.error('Error fetching user count:', error);
                throw new Error('Internal server error');
              }
  
              const userCount = userResult[0].userCount;
  
              res.json({
                standardUserCount: standardUserCount,
                adminCount: adminCount,
                deviceCount: deviceCount,
                userCount: userCount,
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  
  function usermanagement(req, res) {
    const userQuery = 'SELECT UserId,Username,CompanyName, Designation,PersonalEmail,Location,ContactNo,Block FROM tms_users';
  
    db.query(userQuery, (error, userResult) => {
      if (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (userResult.length === 0) {
        console.log('users not found!');
        return res.status(404).json({ message: 'users not found!' });
      }
  
      const users = userResult;
      res.json({ userDetails: users });
    });
  }
  function apilogs(req, res) {
    try {
      const timeInterval = req.params.interval; 
      if (!timeInterval) {
        return res.status(400).json({ message: 'Invalid time interval' });
      }
  
      let duration;
      switch (timeInterval) {

        case '10hour':
          duration = 'INTERVAL 10 HOUR';
          break;
        case '12hour':
          duration = 'INTERVAL 12 HOUR';
          break;
        case '1day':
          duration = 'INTERVAL 1 DAY';
          break;
        case '7day':
          duration = 'INTERVAL 7 DAY';
          break;
        case '30day':
          duration = 'INTERVAL 30 DAY';
          break;
          case '1year':
              duration = 'INTERVAL 365 DAY';
              break;
        default:
          return res.status(400).json({ message: 'Invalid time interval' });
      }
  
      const sql = `SELECT * FROM tmp_api_usage WHERE created_time >= DATE_SUB(NOW(), ${duration})`;
      
      db.query(sql, (error, results) => {
        if (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ data: results });
      });
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  
    function devicelogs(req, res) {
      try {
        const query = 'SELECT * FROM tms_trigger';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  
    function userInfo(req, res) {
      try {
        const query = 'SELECT * FROM user_info';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    function companyinfo(req, res) {
      try {
        const query = 'SELECT * FROM company_info';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  
    function alarms(req, res) {
      try {
        const query = 'SELECT * FROM alarms';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  
    function notification(req, res) {
      try {
        const query = 'SELECT * FROM messages';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    function fetchLogs(req, res) {
      try {
        const timeInterval = req.params.interval; 
        if (!timeInterval) {
          return res.status(400).json({ message: 'Invalid time interval' });
        }
    
        let duration;
        switch (timeInterval) {
          case '10hour':
            duration = 'INTERVAL 10 HOUR';
            break;
          case '12hour':
            duration = 'INTERVAL 12 HOUR';
            break;
          case '1day':
            duration = 'INTERVAL 1 DAY';
            break;
          case '7day':
            duration = 'INTERVAL 7 DAY';
            break;
          case '30day':
            duration = 'INTERVAL 30 DAY';
            break;
            case '1year':
              duration = 'INTERVAL 365 DAY';
              break;
          default:
            return res.status(400).json({ message: 'Invalid time interval' });
        }
    
        const sql = `SELECT * FROM logs WHERE timestamp >= DATE_SUB(NOW(), ${duration})`;
        
        db.query(sql, (error, results) => {
          if (error) {
            console.error('Error fetching data:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }
          res.json({ data: results });
        });
      } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    function graph1(req, res) {
      try {
        const query = 'SELECT * FROM log_table';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    function graph2(req, res) {
      try {
        const query = 'SELECT * FROM log_count_table';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    function graph3(req, res) {
      try {
        const query = 'SELECT * FROM info_twi_log';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
          res.json({ logs: rows });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    function graph4(req, res) {
      try {
        const query = 'SELECT Date, TransportValues FROM transport';
        db.query(query, (error, rows) => {
          if (error) {
            throw new Error('Error fetching logs');
          }
    
          // Transform rows into the desired format
          const formattedData = rows.map(row => ({
            x: new Date(row.Date).toISOString(), // Convert the Date to an ISO 8601 timestamp
            y: parseInt(row.TransportValues, 10) // Parse the TransportValues as an integer
          }));
    
          // Send the formatted data as the response
          res.json({ data: formattedData });
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    
    

//device_info table

const maxEntriesToKeep = 10;
const batchSize = 50; // Number of data sets to process before deleting old entries
let processedDataSets = 0;

function DeviceIP(limit, callback) {
  const selectQuery = `
    SELECT
      deviceuid,
      ip_address,
      status,
      timestamp
    FROM
      actual_data
    ORDER BY
      timestamp DESC
    LIMIT ?
  `;

  db.query(selectQuery, [limit], (error, results) => {
    if (error) {
      console.error('Error fetching device data:', error);
      callback(error, null);
    } else {
      const devices = results;
      callback(null, devices);
    }
  });
}

function DeviceInfo(device) {
  const insertQuery = `
    INSERT INTO device_info (deviceuid, ip_address, status, timestamp, company_name, company_location)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const { deviceuid, ip_address, status, timestamp } = device;
  const statusToInsert = status || 'offline';
  const company_name = "Senselive";
  const company_location = "Nagpur";

  db.query(insertQuery, [deviceuid, ip_address, statusToInsert, timestamp, company_name, company_location], (error, result) => {
    if (error) {
      console.error('Error inserting device data:', error);
    } else {
      // Update the device object with default values
      device.status = statusToInsert;
      device.company_name = company_name;
      device.company_location = company_location;

      processedDataSets++; // Increment the processed data sets count

      if (processedDataSets % batchSize === 0) {
        // When we reach a multiple of batchSize, delete old entries
        deleteOldDeviceInfo(maxEntriesToKeep);
      }

      // Update tms_trigger with the same device data
      updateTmsTrigger(device);
    }
  });
}

function deleteOldDeviceInfo(maxEntries) {
  const selectIdsQuery = `
    SELECT id
    FROM device_info
    ORDER BY timestamp DESC
    LIMIT ?
  `;

  db.query(selectIdsQuery, [maxEntries], (error, results) => {
    if (error) {
      console.error('Error selecting IDs to keep:', error);
    } else {
      const idsToKeep = results.map((result) => result.id);

      if (idsToKeep.length > 0) {
        const deleteQuery = `
          DELETE FROM device_info
          WHERE id NOT IN (${idsToKeep.join(',')})
        `;

        db.query(deleteQuery, (deleteError, deleteResult) => {
          if (deleteError) {
            console.error('Error deleting old device data:', deleteError);
          } else {
            //console.log('Deleted old device data from device_info table');
          }
        });
      }
    }
  });
}

function updateTmsTrigger(device) {
  const updateQuery = `
    UPDATE tms_trigger
    SET
      ip_address = ?,
      status = ?,
      timestamp = ?,
      company_name = ?,
      company_location = ?
    WHERE deviceuid = ?
  `;

  const {
    ip_address,
    status,
    timestamp,
    company_name,
    company_location,
    deviceuid
  } = device;

  db.query(
    updateQuery,
    [ip_address, status, timestamp, company_name, company_location, deviceuid],
    (error, result) => {
      if (error) {
        console.error('Error updating tms_trigger:', error);
      } else {
        //console.log(`Updated tms_trigger for device with deviceuid: ${deviceuid}`);
      }
    }
  );
}

const limit = 9;

function runCode() {
  DeviceIP(limit, (error, devices) => {
    if (error) {
      console.error('Error:', error);
    } else {
      devices.forEach((device) => {
        DeviceInfo(device);
      });
    }
    setTimeout(runCode, 10000);
  });
}

runCode();
    
    function deleteDevice(req, res) {
      try {
        const deviceUID = req.params.deviceUID;
        const deleteDeviceQuery = 'DELETE FROM tms_devices WHERE deviceuid = ?';
    
        db.query(deleteDeviceQuery, [deviceUID], (error, result) => {
          if (error) {
            console.error('Error deleting device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }
    
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Device not found' });
          }
    
          res.json({ message: 'Device deleted successfully' });
        });
      } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    function removeUser(req, res) {
      const userId = req.params.userId; 
      const getUserQuery = 'SELECT * FROM tms_users WHERE UserId = ?';
      db.query(getUserQuery, [userId], (error, userResult) => {
        if (error) {
          console.error('Error during user retrieval:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    
        try {
          if (userResult.length === 0) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
          }
          const deleteUserQuery = 'DELETE FROM tms_users WHERE UserId = ?';
          db.query(deleteUserQuery, [userId], (error, deleteResult) => {
            if (error) {
              console.error('Error during user deletion:', error);
              return res.status(500).json({ message: 'Internal server error' });
            }
    
            try {
              console.log('User deleted successfully');
              res.json({ message: 'User deleted successfully' });
            } catch (error) {
              console.error('Error responding to user deletion:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
        } catch (error) {
          console.error('Error during user removal:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    }

    function deviceCount(req, res) {
      const deviceQuery = 'SELECT COUNT(*) AS deviceCount FROM tms_devices';
      const activeQuery = 'SELECT COUNT(*) AS activeCount FROM tms_devices WHERE  status = "1"';
      const inactiveQuery = 'SELECT COUNT(*) AS inactiveCount FROM tms_devices WHERE status = "0"';
      
      try {
        db.query(deviceQuery, (error, deviceQuery) => {
          if (error) {
            console.error('Error fetching standard user count:', error);
            throw new Error('Internal server error');
          }
    
          const deviceCount = deviceQuery[0].deviceCount;
    
          db.query(activeQuery, (error, activeResult) => {
            if (error) {
              console.error('Error fetching admin count:', error);
              throw new Error('Internal server error');
            }
    
            const activeCount = activeResult[0].activeCount;
    
            db.query(inactiveQuery,(error, inactiveResult) => {
              if (error) {
                console.error('Error fetching device count:', error);
                throw new Error('Internal server error');
              }
    
              const inactiveCount = inactiveResult[0].inactiveCount;
                res.json({
                  deviceCount: deviceCount,
                  activeCount:activeCount,
                  inactiveCount:inactiveCount
                  
                });
              });
            });
          });
      
      } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    

module.exports = {
  fetchAllUsers,
  fetchAllDevices,
  fetchCompanyDetails,
  addDevice,
  getDeviceByUID,
  updateDevice,
  fetchCounts,
  usermanagement,
  apilogs,
  devicelogs,
  userInfo,
  companyinfo,
  alarms,
  notification,
  fetchLogs,
  deleteDevice,
  removeUser,
  deviceCount,
  graph1,
  graph2,
  graph3,
  graph4,
  userByCompanyname

  
};