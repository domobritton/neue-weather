const digi = () => {
    let date = new Date(),
        hour = date.getHours(),
        minute = checkTime(date.getMinutes());

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    let toggle = document.getElementById("checkbox3");
    if (toggle.value === "false") {
        times(hour, minute);
    } else {
        hourConvert(hour, minute);
    }

    let time = setTimeout(digi, 1000);
}

document.getElementById("checkbox3").addEventListener("click", toggleTime);

function toggleTime() {
    let toggle = document.getElementById("checkbox3");
    let hours = document.getElementById("hours");
    if (toggle.value === "false") {
        toggle.value = "true";
        hours.innerHTML = "24 HOUR"
        digi();
    } else if (toggle.value === "true") {
        toggle.value = "false";
        hours.innerHTML = "12 HOUR"
        digi();
    }
}

function times(hour, minute) {
    let time = document.getElementById("time");
    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    if (hour > 12) {
        hour = hour - 12;
        if (hour === 12) {
            hour = checkTime(hour);
            time.innerHTML = `${hour} : ${minute} AM`;
        } else {
            hour = checkTime(hour);
            time.innerHTML = `${hour} : ${minute} PM`;
        }
    } else {
        time.innerHTML = `${hour} : ${minute} AM`;
    }

}

function hourConvert(hour, minute) {
    let time = document.getElementById("time");
    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    if (hour > 12) {
        time.innerHTML = `${hour} : ${minute} PM`;
    } else {
        hour = checkTime(hour);
        time.innerHTML = `${hour} : ${minute} AM`;
    }
}