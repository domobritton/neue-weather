{

    // For pusher logging - don't include this in production
    Pusher.logToConsole = true;

    let pusher = new Pusher('35eceb7b79993dd7be7e', {
            cluster: 'us2',
            encrypted: true
        }),
        channel, weatherChartRef;

    const hideEle = (elementId) => {
        document.getElementById(elementId).style.display = 'none';
    }

    const renderWeatherChart = (weatherData) => {
        const ctx = document.getElementById("weatherChart").getContext("2d");
        let options = {};
        weatherChartRef = new Chart(ctx, {
            type: "line",
            data: weatherData,
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        display: true, //this will remove all the x-axis grid lines
                        gridLines: {
                            color: "rgba(211, 211, 211, 0)"
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(211, 211, 211, 0.2)"
                        }
                    }]
                }
            }
        });
    }

    const renderPrecipChart = (weatherData) => {
        const ctx = document.getElementById("bar-chart");
        let options = {};
        precipChartRef = new Chart(ctx, {
            type: "bar",
            data: weatherData,
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        display: false //this will remove all the x-axis grid lines
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(211, 211, 211, 0.2)"
                        }
                    }]
                }
            }
        });
    }

    const precipConfig = {
        labels: "",
        datasets: [{
            label: "",
            backgroundColor: "rgba(211, 211, 211, 0.7)",
            data: []
        }]
    }

    const tempConfig = {
        labels: "",
        datasets: [{
            label: "",
            fill: false,
            backgroundColor: "rgba(52,152,219,1)",
            borderColor: "rgba(211, 211, 211, 1)",
            borderCapStyle: 'butt',
            borderWidth: 5,
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(211, 211, 211, 1)",
            pointBackgroundColor: "rgba(211, 211, 211, 1)",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(211, 211, 211, 1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
        }]
    };

    const renderIcon = (resp) => {
        const icons = resp.dataPoints.map(dataPoint => dataPoint.icon);
        const icon = icons[icons.length - 1];
        const skycon = new Skycons({
            "color": "rgba(255,255,255,1)"
        });

        switch (icon) {
            case "clear-night":
                skycon.set("icon", Skycons.CLEAR_NIGHT);
                break;
            case "clear-day":
                skycon.set("icon", Skycons.CLEAR_DAY);
                break;
            case "partly-cloudy-day":
                skycon.set("icon", Skycons.PARTLY_CLOUDY_DAY);
                break;
            case "partly-cloudy-night":
                skycon.set("icon", Skycons.PARTLY_CLOUDY_NIGHT);
                break;
            case "cloudy":
                skycon.set("icon", Skycons.CLOUDY);
                break;
            case "rain":
                skycon.set("icon", Skycons.RAIN);
                break;
            case "sleet":
                skycon.set("icon", Skycons.SLEET);
                break;
            case "snow":
                skycon.set("icon", Skycons.SNOW);
                break;
            case "wind":
                skycon.set("icon", Skycons.WIND);
                break;
            case "fog":
                skycon.set("icon", Skycons.FOG);
                break;
            default:
                skycon.set("icon", Skycons.CLEAR_DAY);
        }
        skycon.play();
    }

    const renderHeaderData = (resp) => {
        const temp = resp.dataPoints.map(dataPoint => dataPoint.temp);
        const clouds = resp.dataPoints.map(dataPoint => dataPoint.clouds);
        const currTemp = temp[temp.length - 1];
        const currCloud = clouds[clouds.length - 1];
        document.getElementById("temp").innerHTML = `${Math.round(currTemp)} F°`;
        document.getElementById("clouds").innerHTML = `Cloud cover is at ${currCloud * 100} %`;
    }


    
    const slideHeader = () => {
        document.getElementById("header").classList.add("open");
        setTimeout(() => document.getElementById("header").classList.remove("open"), 4000);
    }

    document.addEventListener("keydown", (e) => {
        e.preventDefault();
        if (e.keyCode === 40) {
           slideHeader(); 
        }
    });

    axios.get('/getWeather').then((response => onFetchWeatherResponse(response)));

    function onFetchWeatherResponse(response) {
        hideEle("loader");
        let respData = response.data;
        renderIcon(respData);
        renderHeaderData(respData);
        tempConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
        tempConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temp);
        precipConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
        precipConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.precip);
        renderWeatherChart(tempConfig);
        renderPrecipChart(precipConfig);
    }

    channel = pusher.subscribe('local-weather-chart');
    channel.bind('new-weather', function (data) {
        let newWeatherData = data.dataPoint;
        if (weatherChartRef.data.labels.length > 15) {
            weatherChartRef.data.labels.shift();
            precipChartRef.data.labels.shift();
            weatherChartRef.data.datasets[0].data.shift();
            precipChartRef.data.datasets[0].data.shift();
        }
        weatherChartRef.data.labels.push(newWeatherData.time);
        precipChartRef.data.labels.push(newWeatherData.time);
        weatherChartRef.data.datasets[0].data.push(newWeatherData.temp);
        precipChartRef.data.datasets[0].data.push(newWeatherData.precip);

        weatherChartRef.update();
        precipChartRef.update();
    });

}