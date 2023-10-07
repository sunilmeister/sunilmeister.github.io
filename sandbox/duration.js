function msToTimeStr(milliseconds) {
  var d = convertMS(milliseconds);
  var days = d.days;
  var hours = d.hours;
  var minutes = d.minutes;
  var seconds = d.seconds;
  var hours = days * 24 + hours;
  var strHours = (hours < 10) ? "0" + String(hours) : String(hours);
  var strMinutes = (minutes < 10) ? "0" + String(minutes) : String(minutes);
  var strSeconds = (seconds < 10) ? "0" + String(seconds) : String(seconds);
  return strHours + ":" + strMinutes + ":" + strSeconds;
}

function convertMS(milliseconds) {
  var days, hours, minutes, seconds;
  seconds = Math.floor(milliseconds / 1000);
  minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  days = Math.floor(hours / 24);
  hours = hours % 24;
  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
}


