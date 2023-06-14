const axios = require('axios');
const pool = require('./dbconfig');
const moment = require('moment-timezone');
async function countHits(req, res, next) {
    const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const device = req.headers['user-agent'];
    let ip = ipAddress.replace(/^::ffff:/, "");
    const browser = getBrowserType(req.headers['user-agent']);
    const location = await getLocation(ip);
    const url = req.url;
    const method = req.method;
    console.log('timestamp==', timestamp);

    await insertHit(timestamp, ip, device, browser, location, url, method,);
    next();
}
async function insertHit(timestamp, ip, device, browser, location, url, method,) {
    try {
        const client = await pool.connect();

        const query = `INSERT INTO website_hits (timestamp, ip_address, device, browser, location, url, method)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`;

        const values = [timestamp, ip, device, browser, location, url, method,];

        await client.query(query, values);

        client.release();

    } catch (error) {
        console.log('err', error)
        // throw new Error('DB error')
    }
}


function getBrowserType(userAgent) {
    const UAParser = require('ua-parser-js');
    const parser = new UAParser();
    const result = parser.setUA(userAgent).getResult();
    return result.browser.name;
}

async function getLocation(ip) {
    const apiKey = process.env.ipapikey;
    const url = `http://api.ipapi.com/${ip}?access_key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { city, region_name, country_name } = response.data;

        return `${city}, ${region_name}, ${country_name}`;
    } catch (error) {
        console.error('Error retrieving location:', error);
        return 'Unknown';
    }
}

module.exports = countHits 
