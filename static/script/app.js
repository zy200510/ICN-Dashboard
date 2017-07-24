function App(){
    this.host = window.location;
    this.selectedId = "";
    this.currentIndex = 0;
    this.alphabet=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    this.debug = false;
    this.d3Graph = new D3ForceDirectedGraph()
    this.colors = new Array("#00ff00","#66ff66","#99ff66","#ccff66","#ffff00","#ffcc00","#ff9933","#ff6600","#ff3300","#ff0000","#ff0000")
    this.timelineChartContainer="";
    this.ratioChartContainer = "";
    this.selectedChartContainer = "";
    this.preSelectedId = "";

}

App.prototype={

    start:function(){
        var apiSummaryAddress = this.host + "summary";
        var apiSelectedAddress = this.host + "selected/";
        var self = this;
        var timelineChart = $("#" + this.timelineChartContainer).highcharts();
        var ratioChart = $("#" + this.ratioChartContainer).highcharts();

        var selectedChartObj = $("#" + this.selectedChartContainer);
        var selectedChart =selectedChartObj.highcharts();
        selectedChartObj.hide();

        setInterval(function () {
            $.getJSON(apiSummaryAddress, function(data) {

                  var cache = data["cache"];
                  values = []
                  for(var i=0;i<10;i++){
                    values.push(cache[i]);
                  }
                  ratioChart.series[0].setData(values);

                  var timeLineX = (new Date()).getTime();
                  var timeLineY = Math.round(Math.random() * 100);

                  timelineChart.series[0].addPoint([timeLineX, timeLineY], true, true);

                }, 1000);

                if(self.d3Graph.selectedId == ""){
                    selectedChartObj.hide();
                }else{
                    selectedChartObj.show();
                    selectedChart.setTitle({text: self.d3Graph.selectedId});
                    var apiSelected = apiSelectedAddress +self.d3Graph.selectedId;
                    $.getJSON(apiSelected, function(data) {
                        selectedChart.series[0].addPoint([data], true, true);
                    }, 1000);
                }

        }, 1000);
    },
    // drawTimeline, use to show cache timeline
    drawTimeline:function(container){
        this.timelineChartContainer = container;
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        // Create the chart
       Highcharts.stockChart(container, {

            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1M'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5M'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 0
            },

            title: {
                text: 'Live random data'
            },

            exporting: {
                enabled: false
            },

            series: [{
                name: 'Random data',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -999; i <= 0; i += 1) {
                        data.push([
                            time + i * 1000,
                            Math.round(Math.random() * 100)
                        ]);
                    }
                    return data;
                }())
            }]
        });

    },

    // drawRatio, use to show the ratio of nodes group cache in networking
    drawRatio:function(container, api){
        var self = this;
        self.ratioChartContainer = container;
        Highcharts.chart(container, {
             chart: {
                type: 'column'
            },

            title: {
                text: 'Node count for each ratio  section'
            },

            xAxis: {
                categories: [
                    '0-10%',
                    '10%-20%',
                    '20%-30%',
                    '30%-40%',
                    '40%-50%',
                    '50%-60%',
                    '60%-70%',
                    '70%-80%',
                    '80%-90%',
                    '90%-100%',
                ],
                crosshair: true
            },
            yAxis: {
                min: 0,
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'node',
                data: [{ y:0, color: self.colors[0]},
                { y:0, color: self.colors[1]},
                { y:0, color: self.colors[2]},
                { y:0, color: self.colors[3]},
                { y:0, color: self.colors[4]},
                { y:0, color: self.colors[5]},
                { y:0, color: self.colors[6]},
                { y:0, color: self.colors[7]},
                { y:0, color: self.colors[8]},
                { y:0, color: self.colors[9]}]
            }]
        });

    },

    drawSelected:function(container, api){
        var self = this;

        self.selectedChartContainer = container;
        var apiAddress = this.host + api;

        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        chartOBj =Highcharts.chart(container, {
            title: {
                text: "",
            },

            xAxis: {
                labels: {
                    formatter: function () {
                        var currentDate = new Date();
                        var x = currentDate.getHours() + ":"
                            + currentDate.getMinutes() + ":"
                            + currentDate.getSeconds();
                        return x;
                    }
                },
                maxPadding: 0.05,
                showLastLabel: true
            },

            yAxis: {
                title: {
                    text: 'Usage'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },


            series: [{
                showInLegend: false,
                name: '',
                data: [0, 0, 0, 0, 0, 0, 0, 0]
            }]

        });
        self.selectedChart = $("#"+container).highcharts();
    },

    drawTopology:function(canvasId, api){
        var apiAddress = this.host + api;
        var networkSvg = d3.select(canvasId);
        var self = this;

        d3.json(apiAddress, function(error, graph) {
            if (!error) {
                self.d3Graph.createD3ForceDirectedGraph(networkSvg, graph);

            } else {
                console.error(error);
            }
        });
    },

    formatTime:function(minutes){
        var hours = minutes/60;
        var min = minutes%60;
        return hours +"hours"
    },


    getDataFromServer:function(api){

    }
}