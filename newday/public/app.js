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

    const ajax = (url, method, payload, successCallback) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4 || xhr.status != 200) return;
            successCallback(xhr.responseText);
        };
        xhr.send(JSON.stringify(payload));
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

    const chartConfig = {
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

    ajax("/getTemperature", "GET", {}, onFetchTempSuccess);

    function onFetchTempSuccess(response) {
        hideEle("loader");
        let respData = JSON.parse(response);
        chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
        chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperature);
        renderWeatherChart(chartConfig)
    }

    channel = pusher.subscribe('local-temp-chart');
    channel.bind('new-temperature', function (data) {
        let newTempData = data.dataPoint;
        if (weatherChartRef.data.labels.length > 15) {
            weatherChartRef.data.labels.shift();
            weatherChartRef.data.datasets[0].data.shift();
        }
        weatherChartRef.data.labels.push(newTempData.time);
        weatherChartRef.data.datasets[0].data.push(newTempData.temperature);
        weatherChartRef.update();
    });


    /* TEMP CODE FOR TESTING */
    let dummyTime = 1500;
    setInterval(() => {
        dummyTime = dummyTime + 10;
        ajax(`/addTemperature?temperature=${getRandomInt(10, 120)}&time=${dummyTime}`, "GET", {}, () => {});
    }, 6000);

    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /* TEMP CODE ENDS */

}