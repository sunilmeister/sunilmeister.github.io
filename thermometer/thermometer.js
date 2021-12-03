function drawThermoGauge(value, axisColorC, axisColorF) {
    var gauge = anychart.gauges.linear();
    gauge.data([value]).padding(10, 0, 30, 0);
    gauge
        .tooltip()
        .useHtml(true)

    // Set axis and axis settings
    // Add left axis with custom labels
    var axisLeft = gauge.axis(0);
    axisLeft.minorTicks(true);
    axisLeft
        .labels()
        .useHtml(true)
        .format(function() {
            return '<span style="color:' + axisColorC + ';">' + this.value + ' C</span>';
        });

    // Set scale settings
    var Cscale = gauge.scale();
    Cscale.minimum(-20).maximum(60).ticks({
        interval: 5
    });
    axisLeft.scale(Cscale).width('0.5%').offset('-1%');

    // Add right axis with custom labels
    var axisRight = gauge.axis(1);
    axisRight.minorTicks(true);
    axisRight
        .labels()
        .useHtml(true)
        .format(function() {
            return '<span style="color:' + axisColorF + ';">' + this.value + ' F</span>';
        });
    axisRight.orientation('right').offset('3.5%');

    // Set scale Fahrenheit for right axis
    var Fscale = anychart.scales.linear();
    Fscale.minimum(-4).maximum(140).ticks({
        interval: 8
    });
    axisRight.scale(Fscale);

    return gauge;
}

function drawThermometer(container, valueC, axisColorC, axisColorF) {
    // Create gauge with extra axis
    var thermoGauge = drawThermoGauge(valueC, axisColorC, axisColorF);
    var thermometer = thermoGauge.thermometer(0);
    thermometer.name('Thermometer').id('0');

    // Create table to place thermometers
    var thermoTable = anychart.standalones.table();
    thermoTable
        .hAlign('center')
        .vAlign('middle')
        .useHtml(true)
        .fontSize(16)
        .cellBorder(null);

    // Put thermometers into the layout table
    thermoTable.contents([
        [thermoGauge]
    ]);

    // Merge cells in layout table where needed
    thermoTable.getCell(0, 0).colSpan(8);

    // Set container id and initiate drawing
    thermoTable.container(container);
    thermoTable.draw();
}
