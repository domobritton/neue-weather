const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require("axios");
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

const localWeatherData = {
    city: 'San Francisco',
    unit: 'fahrenheit',
    dataPoints: [{
            time: 1130,
            temperature: 57,
            precip: 10
        },
        {
            time: 1200,
            temperature: 58,
            precip: 5
        },
        {
            time: 1230,
            temperature: 64,
            precip: 20
        },
        {
            time: 1300,
            temperature: 68,
            precip: 40
        },
        {
            time: 1330,
            temperature: 69,
            precip: 30
        },
        {
            time: 1400,
            temperature: 72,
            precip: 5
        },
    ]
}

const url =
    "https://api.darksky.net/forecast/c6a6fc2e87187ffa21074dad430396cd/37.8267,-122.4233";
const getWeather = async url => {
    try {
        const response = await axios.get(url);
        const data = response.data;
        updateWeather(data);
    } catch (error) {
        console.log(error);
    }
};
getWeather(url);

const updateWeather = (data) => {
    const time = data.currently.time;
    const temp = data.currently.temperature;
    const precip = data.currently.precipIntensity;

    if (!isNaN(time) && !isNaN(temp) && !isNaN(precip)) {
        let newDataPoint = {
            time: time,
            temperature: temp,
            precip: precip
        };
        localWeatherData.dataPoints.push(newDataPoint);
        pusher.trigger('local-weather-chart', 'new-weather', {
            dataPoint: newDataPoint
        });
    } else {
        console.log("not found");
    }
 
}

app.get('/getWeather', (req, res) => {
    res.send(localWeatherData);
});


module.exports = app;

app.listen(9000, () => {
    console.log('listening on port 9000!')
});