const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const Pusher = require('pusher');

const pusher = new Pusher({
    appId: '635010',
    key: '35eceb7b79993dd7be7e',
    secret: '2874693b81639e06ae6a',
    cluster: 'us2',
    encrypted: true
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

const localTempData = {
    city: 'San Francisco',
    unit: 'fahrenheit',
    dataPoints: [{
            time: 1130,
            temperature: 57
        },
        {
            time: 1200,
            temperature: 58
        },
        {
            time: 1230,
            temperature: 64
        },
        {
            time: 1300,
            temperature: 68
        },
        {
            time: 1330,
            temperature: 69
        },
        {
            time: 1400,
            temperature: 72
        },
    ]
}

app.get('/getTemperature', (req, res) => {
    res.send(localTempData);
});

app.get('/addTemperature', (req, res) => {
    let temp = parseInt(req.query.temperature);
    let time = parseInt(req.query.time);
    if (temp && time && !isNaN(temp) && !isNaN(time)) {
        let newDataPoint = {
            temperature: temp,
            time: time
        };
        localTempData.dataPoints.push(newDataPoint);
        pusher.trigger('local-temp-chart', 'new-temperature', {
            dataPoint: newDataPoint
        });
        res.send({
            success: true
        });
    } else {
        res.send({
            success: false,
            errorMessage: 'Invalid Params, required - temperature & time.'
        });
    }
});

// Error Handler for 404 Pages
app.use((req, res, next) => {
    var error404 = new Error('Route Not Found');
    error404.status = 404;
    next(error404);
});

module.exports = app;

app.listen(9000, () => {
    console.log('listening on port 9000!')
});