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

    if (hour > 12) {
        hour = hour - 12;
        if (hour === 12) {
            hour = checkTime(hour);
            document.getElementById("time").innerHTML = `${hour} : ${minute} AM`;
        } else {
            hour = checkTime(hour);
            document.getElementById("time").innerHTML = `${hour} : ${minute} PM`;
        }
    } else {
        document.getElementById("time").innerHTML = `${hour} : ${minute} AM`;;
    }
    let time = setTimeout(digi, 1000);
}