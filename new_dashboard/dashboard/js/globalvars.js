var datasource_name = "RESPIMATIC100";

var blueColor;
var darkblueColor;
var darkredColor;
var greenColor;
var orangeColor;

var initialState = false;
var standbyState = false;
var activeState = false;
var errorState = false;
var attentionState = false;

var currentViewIsSnapshot = true;
var firstDweet = true;
var numBreaths = 0;
var chartsPaused = false;
var desiredFiO2 = 21;
var o2Purity = 21;
var reqO2Flow = 0;

var fiO2Gauge = null;
var purityGauge = null;
var peakGauge = null;
var platGauge = null;
var peepGauge = null;
var tempGauge = null;
