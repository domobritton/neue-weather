{
    const express = require('express');
    // import express from 'express';
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
        dataPoints: []
    }

    const url =
        "https://api.darksky.net/forecast/c6a6fc2e87187ffa21074dad430396cd/37.8267,-122.4233?exclude=minutely";
    const getWeather = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            updateWeather(data);
        } catch (error) {
            console.log(error);
        }
    };

    setTimeout(() => getWeather(url), 10000);

    const timeConverter = (UNIX_timestamp) => {
        let unix, hourC, minuteC, hours, minutes;
        unix = new Date(UNIX_timestamp * 1000);
        hourC = unix.getHours() % 12;
        minuteC = unix.getMinutes();
        hours = hourC < 10 ? `0${hourC}` : hourC;
        minutes = minuteC < 10 ? `0${minuteC}` : minuteC;
        return `${hours}:${minutes}`;
    }

    const updateWeather = (data) => {
        let time, temp, precip, hourlyTime, hourlyTemp, hourlyPrecip, icon, clouds;
        time = timeConverter(data.currently.time);
        temp = data.currently.temperature;
        icon = data.currently.icon;
        clouds = data.currently.cloudCover;
        precip = data.currently.precipIntensity;
        hourlyTime = data.hourly.data.map(time => timeConverter(time.time));
        hourlyTemp = data.hourly.data.map(temps => temps.temperature);
        hourlyPrecip = data.hourly.data.map(prec => prec.precipIntensity);
        for (let i = 0; i < 47; i++) {
            let newDataPoint = {
                time: hourlyTime[i],
                temp: hourlyTemp[i],
                precip: hourlyPrecip[i]
            }
            localWeatherData.dataPoints.push(newDataPoint);
        }

        if (isNaN(time) && !isNaN(temp) && !isNaN(precip)) {
            let newDataPoint = {
                time,
                temp,
                precip,
                icon,
                clouds
            };
            localWeatherData.dataPoints.push(newDataPoint);
            pusher.trigger('local-weather-chart', 'new-weather', {
                dataPoint: newDataPoint
            });
        } else {
            console.log("not found");
        }
     
        if (localWeatherData.dataPoints.length > 48) {
            localWeatherData.dataPoints.shift();
        }
        console.log(localWeatherData);
    }

    app.get('/getWeather', (req, res) => {
        res.send(localWeatherData);
    });

    module.exports = app;

    app.listen(9000, () => {
        console.log('listening on port 9000!')
    });
    getWeather(url);
}