{

   //  For pusher logging - don't include this in production
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
                        display: true, //this will remove all the x-axis grid lines if false
                        gridLines: {
                            color: "rgba(211, 211, 211, 0)"
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(211, 211, 211, 0)"
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
                        display: false //this will remove all the x-axis grid lines if false
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(211, 211, 211, 0.0)"
                        },
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 1
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
            backgroundColor: "rgba(211, 211, 211, 0.5)",
            data: []
        }]
    }

    const tempConfig = {
        labels: "",
        datasets: [{
            label: "",
            fill: false,
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
        document.getElementById("clouds").innerHTML = `Cloud cover is at ${Math.round(currCloud * 100)} %`;
    }

    const slideHeader = () => {
        const header = document.getElementById("header");
        header.classList.add("open");
        setTimeout(() => header.classList.remove("open"), 4000);
    }

    const slideFaq = () => {
        const aside = document.getElementById("aside-left");
        aside.classList.add("open");
        setTimeout(() => aside.classList.remove("open"), 10000);
    }

    const slideForecast = () => {
        const aside = document.getElementById("aside-right");
        aside.classList.add("open");
        setTimeout(() => aside.classList.remove("open"), 10000);
    }

    const slideFooter = () => {
        const footer = document.getElementById("footer");
        footer.classList.add("open");
    }

    const removeClass = () => {
        const ids = ["aside-left", "aside-right", "header", "footer"];
        ids.forEach((id) => {
            document.getElementById(id).classList.remove("open");
        });
    }

    const keys = {
        state: false
    };

    document.addEventListener("keydown", (e) => {
        let bool = keys.state === false ? keys.state = true : keys.state = false;
        if (bool) {
            if (e.keyCode === 40) {
                slideHeader();
            }
            if (e.keyCode === 39) {
                slideFaq();
            }
            if (e.keyCode === 37) {
                slideForecast();
            }
            if (e.keyCode === 38) {
                slideFooter();
            }
        } else {
            if (e.keyCode === 40) {
                removeClass();
            }
            if (e.keyCode === 39) {
                removeClass();
            }
            if (e.keyCode === 37) {
                removeClass();
            }
            if (e.keyCode === 38) {
                removeClass();
            }
        }
    });

    document.getElementById("checkbox1").addEventListener("click", dayOrNight);
    document.getElementById("checkbox2").addEventListener("click", renderCurrentTemp);

    function dayOrNight() {
        const header = document.getElementById("blur");
        const body = document.getElementById("body");
        const leftAside = document.getElementById("left-aside");
        const rightAside = document.getElementById("right-aside");
        const precip = document.getElementById("precip");
        const dateBtns = document.getElementById("date-btns");
        const truthy = body.classList.contains("day");
        if (truthy) {
            header.classList.remove("blur");
            header.classList.add("blur-night");
            body.classList.remove("day");
            body.classList.add("night");
            leftAside.classList.remove("day");
            leftAside.classList.add("night");
            rightAside.classList.remove("day");
            rightAside.classList.add("night");
            dateBtns.classList.remove("day");
            dateBtns.classList.add("night");
            precip.classList.remove("precip-day");
            precip.classList.add("precip-night");
            generateStars();
        } else {
            header.classList.remove("blur-night");
            header.classList.add("blur");
            body.classList.remove("night");
            body.classList.add("day");
            leftAside.classList.remove("night");
            leftAside.classList.add("day");
            rightAside.classList.remove("night");
            rightAside.classList.add("day");
            dateBtns.classList.remove("night");
            dateBtns.classList.add("day");
            precip.classList.remove("precip-night");
            precip.classList.add("precip-day");
        }
    }

    const currentCity = {
        city: ""
    } 

    function handleInput(val) {
        currentCity.city = val;
        axios.get(`/getWeather/${val}`).then((response => onFetchWeatherResponse(response)));
        document.getElementById("submit").value = "";
        removeClass();
    }

    const generateStars = () => {
        let galaxy = document.getElementById("precip");
        let i = 0;

        while (i <= 100) {
            let star = document.createElement("div");
            star.id = "star";
            let xPosition = Math.random();
            let yPosition = Math.random();
            let starType = Math.floor((Math.random() * 3) + 1);
            let position = {
                "x": galaxy.clientWidth * xPosition,
                "y": galaxy.clientHeight * yPosition
            };
            star.className = `star star-type${starType}`;
            star.style.top = `${Math.floor(position.y)}px`;
            star.style.left = `${Math.floor(position.x)}px`;
            galaxy.appendChild(star);
            i++;
        }
    };

    function renderCurrentTemp() {
        const toggle = document.getElementById("checkbox2");
        let fOrC = document.getElementById("temp");
        let label = document.getElementById("temps");
        let currTemp = fOrC.innerHTML.slice(0, 2);
        let converted;

        if (toggle.value === "false") {
            toggle.value = "true";
            label.innerHTML = "°C TEMP";
            converted = Math.round((currTemp - 32) * 5 / 9);
            fOrC.innerHTML = `${converted} C°`;
        } else {
            toggle.value = "false";
            label.innerHTML = "°F TEMP";
            converted = Math.round(currTemp * 9 / 5 + 32)
            fOrC.innerHTML = `${converted} F°`;
        }
    }

    function onFetchWeatherResponse(response, bool = false) {
        let tempLabels, tempData, precipLabels, precipData;
        hideEle("loader");
        let respData = response.data;
        renderIcon(respData);
        renderHeaderData(respData);
        tempLabels = respData.dataPoints.map(dataPoint => dataPoint.time);
        tempData = respData.dataPoints.map(dataPoint => dataPoint.temp);
        precipLabels = respData.dataPoints.map(dataPoint => dataPoint.time);
        precipData = respData.dataPoints.map(dataPoint => dataPoint.precip);

        if (bool) {
            tempConfig.labels = tempLabels.slice(25, 49);
            tempConfig.datasets[0].data = tempData.slice(25, 49);
            precipConfig.labels = precipLabels.slice(25, 49);
            precipConfig.datasets[0].data = precipData.slice(25, 49);
            renderWeatherChart(tempConfig);
            renderPrecipChart(precipConfig);
        } else {
            tempConfig.labels = tempLabels.slice(0, 25);
            tempConfig.datasets[0].data = tempData.slice(0, 25);
            precipConfig.labels = precipLabels.slice(0, 25);
            precipConfig.datasets[0].data = precipData.slice(0, 25);
            renderWeatherChart(tempConfig);
            renderPrecipChart(precipConfig);
        }
    }

    function tomorrowClick() {
        const bool = true;
        const val = currentCity.city;
        axios.get(`/getWeather/${val}`).then((response => onFetchWeatherResponse(response, bool)));
    }

    function todayClick() {
        const bool = false;
        const val = currentCity.city;
        axios.get(`/getWeather/${val}`).then((response => onFetchWeatherResponse(response, bool)));
    }

    channel = pusher.subscribe('local-weather-chart');
    channel.bind('new-weather', (data) => {
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