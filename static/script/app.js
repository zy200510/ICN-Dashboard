function App(){
    this.host = window.location;
    this.currentIndex = 0;
    this.alphabet=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    this.debug = false;
}

App.prototype={

    // drawTimeline, use to show cache timeline
    drawTimeline:function(container){
        Highcharts.setOptions({
            global : {
                useUTC : false
            }
        });

        // Create the chart
        $(container).highcharts('StockChart', {
            chart : {
                events : {
                    load : function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.round(Math.random() * 100);
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },

            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1m'
                }, {
                    count: 60,
                    type: 'hour',
                    text: '60m'
                }, {
                    count: 3600,
                    type: 'day',
                    text: '3600m'
                }],
                inputEnabled: false,
                selected: 0
            },

            title : {
                text : 'Time line'
            },

            exporting: {
                enabled: false
            },

            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}%',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: 'Cache',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: false

            }

            ],

            series : [{
                name : 'percentage',
                yAxis: 0,
                data : (function () {
                    // generate an array of random data
                    var data = [], time = (new Date()).getTime(), i;

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
    drawRatio:function(dataAddress){
        var svg = d3.select("#ratioChart");
        let parentWidth = svg.node().parentNode.clientWidth;
        let parentHeight = svg.node().parentNode.clientHeight;

        var radius = Math.min(parentWidth, parentHeight)/4*3
        svg.attr("width", radius);
        svg.attr("height", radius);
        var width = radius,
            height = radius,
            radius = Math.min(width, height) / 2,
            g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d.population; });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        d3.csv(dataAddress, function(d) {
            d.population = +d.population;
            return d;
        }, function(error, data) {
            if (error) throw error;

            var arc = g.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "arc");

            arc.append("path")
                .attr("d", path)
                .attr("fill", function(d) { return color(d.data.age); });

            arc.append("text")
                .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
                .attr("dy", "0.35em")
                .text(function(d) { return d.data.age; });
        });
    },

    // drawingTopology, use to show the topology of networking
    // crate a force directed graph ny d3
    // refer to the http://emptypipes.org/2017/04/29/d3v4-selectable-zoomable-force-directed-graph/
    drawTopology:function(canvasId, data){
        var networkSvg = d3.select(canvasId);

        d3.json(data, function(error, graph) {
            if (!error) {
                createV4SelectableForceDirectedGraph(networkSvg, graph);
            } else {
                console.error(error);
            }
        });
    },

    formatTime:function(minutes){
        var hours = minutes/60;
        var min = minutes%60;
        return hours +"hours"
    }
}