function incValue() {
  var obj = document.getElementById("NumVal");
  from = Number(obj.innerHTML);
  to = from + 2;
  console.log("from=" + from + " to=" + to);
  animateNumberValue(obj,from,to,500);
}
