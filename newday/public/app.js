{
    // For pusher logging - don't include this in production
    Pusher.logToConsole = true;

    let serverUrl = "/",
        members = [],
        pusher = new Pusher('35eceb7b79993dd7be7e', {
            cluster: 'us2',
            // authEndpoint: '/usersystem/auth',
            encrypted: true
        }),
        channel, weatherChartRef;

    // const showEle = (elementId) => {
    //     document.getElementById(elementId).style.display = 'flex';
    // }

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
                scales: {
                    xAxes: [{
                        display: false //this will remove all the x-axis grid lines
                    }],
                    yAxes: [{
                        display: false
                    }]
                },
                legend: {
                    display: false
                }
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem) => {
                        return tooltipItem.yLabel;
                    }
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
            lineTension: 0,
            backgroundColor: "rgba(52,152,219,1)",
            borderColor: "rgba(255,255,255,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(255,255,255,1)",
            pointBackgroundColor: "rgba(255,255,255,1)",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(255,255,255,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
        }]
    };
   
    axios.get('/getWeather').then((response => onFetchWeatherResponse(response)));

    function onFetchWeatherResponse(response) {
        hideEle("loader");
        let respData = response.data;
        tempConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
        tempConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperature);
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
        weatherChartRef.data.datasets[0].data.push(newWeatherData.temperature);
        precipChartRef.data.datasets[0].data.push(newWeatherData.precip);

        weatherChartRef.update();
        precipChartRef.update();
    });
}