function D3ForceDirectedGraph(){
    this.node = null;
    this.selectedId = "";
    this.colors = new Array("#00ff00","#66ff66","#99ff66","#ccff66","#ffff00","#ffcc00","#ff9933","#ff6600","#ff3300","#ff0000","#ff0000");
}

D3ForceDirectedGraph.prototype={

    updateColor:function(graph){
//        this.node.data(graph.nodes);
//        this.node.attr("fill", function(d) {
//            var index = Math.round(d.cache/d.capacity*10);
//            return self.colors[index];
//        });
    },
    createD3ForceDirectedGraph:function(svg, graph){
        var self = this
        if (typeof d3v4 == 'undefined')
            d3v4 = d3;

        var width = +svg.attr("width"),
            height = +svg.attr("height");

        let parentWidth = d3v4.select('svg').node().parentNode.clientWidth;
        let parentHeight = d3v4.select('svg').node().parentNode.clientHeight;
        var svg = d3v4.select('svg')
        .attr('width', parentWidth)
        .attr('height', parentHeight)

        // remove any previous graphs
        svg.selectAll('.g-main').remove();

        var gMain = svg.append('g')
        .classed('g-main', true);

        var rect = gMain.append('rect')
        .attr('width', parentWidth)
        .attr('height', parentHeight)
        .style('fill', 'Transparent')

        var gDraw = gMain.append('g');

        var zoom = d3v4.zoom()
        .on('zoom', zoomed)

        gMain.call(zoom);


        function zoomed() {
            gDraw.attr('transform', d3v4.event.transform);
        }

        if (! ("links" in graph)) {
            console.log("Graph is missing links");
            return;
        }
        var nodes = {};
        var i;
        for (i = 0; i < graph.nodes.length; i++) {
            nodes[graph.nodes[i].id] = graph.nodes[i];
            graph.nodes[i].weight = 1.01;
        }

        // the brush needs to go before the nodes so that it doesn't
        // get called when the mouse is over a node
        var gBrushHolder = gDraw.append('g');
        var gBrush = null;

        // Define the div for the tooltip
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var link = gDraw.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = gDraw.append("g")
            .attr("class", "node")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function(d) { 
                var index = Math.round(d.cache/d.capacity*10);
                return self.colors[index];
            })
            .call(d3v4.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        this.node =node;

        node.on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip	.html(d.id + "<br/>capacity:" +d.capacity+"<br/>cache:"+d.cache)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("click", function(d) {
                self.selectedId = d.id;
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        var simulation = d3v4.forceSimulation()
            .force("link", d3v4.forceLink()
                    .id(function(d) { return d.id; })
                    .distance(function(d) { 
                        return 30;
                        //var dist = 20 / d.value;
                        //console.log('dist:', dist);
                    })
                )
            .force("charge", d3v4.forceManyBody())
            .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2))
            .force("x", d3v4.forceX(parentWidth/2))
            .force("y", d3v4.forceY(parentHeight/2));

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            // update node and line positions at every step of 
            // the force simulation
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }

        var brushMode = false;
        var brushing = false;

        var brush = d3v4.brush()
            .on("start", brushstarted)
            .on("brush", brushed)
            .on("end", brushended);

        function brushstarted() {
            // keep track of whether we're actively brushing so that we
            // don't remove the brush on keyup in the middle of a selection
            brushing = true;

            node.each(function(d) { 
                d.previouslySelected = shiftKey && d.selected; 
            });
        }

        rect.on('click', () => {
            node.each(function(d) {
                d.selected = false;
                d.previouslySelected = false;
            });
            node.classed("selected", false);
            self.selectedId = "";
        });

        function brushed() {
            if (!d3v4.event.sourceEvent) return;
            if (!d3v4.event.selection) return;

            var extent = d3v4.event.selection;

            node.classed("selected", function(d) {
                return d.selected = d.previouslySelected ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                && extent[0][1] <= d.y && d.y < extent[1][1]);
            });
        }

        function brushended() {
            if (!d3v4.event.sourceEvent) return;
            if (!d3v4.event.selection) return;
            if (!gBrush) return;

            gBrush.call(brush.move, null);

            if (!brushMode) {
                // the shift key has been release before we ended our brushing
                gBrush.remove();
                gBrush = null;
            }

            brushing = false;
        }

        d3v4.select('body').on('keydown', keydown);
        d3v4.select('body').on('keyup', keyup);

        var shiftKey;

        function keydown() {
            shiftKey = d3v4.event.shiftKey;

            if (shiftKey) {
                // if we already have a brush, don't do anything
                if (gBrush)
                    return;

                brushMode = true;

                if (!gBrush) {
                    gBrush = gBrushHolder.append('g');
                    gBrush.call(brush);
                }
            }
        }

        function keyup() {
            shiftKey = false;
            brushMode = false;

            if (!gBrush)
                return;

            if (!brushing) {
                // only remove the brush if we're not actively brushing
                // otherwise it'll be removed when the brushing ends
                gBrush.remove();
                gBrush = null;
            }
        }

        function dragstarted(d) {
            if (!d3v4.event.active) simulation.alphaTarget(0.9).restart();

            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every other node
                node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false; });
            }

            d3v4.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; return d.selected = true; });

            node.filter(function(d) { return d.selected; })
            .each(function(d) { //d.fixed |= 2; 
            d.fx = d.x;
            d.fy = d.y;
            })
        }

        function dragged(d) {
        //d.fx = d3v4.event.x;
        //d.fy = d3v4.event.y;
                node.filter(function(d) { return d.selected; })
                .each(function(d) { 
                    d.fx += d3v4.event.dx;
                    d.fy += d3v4.event.dy;
                })
        }

        function dragended(d) {
            if (!d3v4.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            node.filter(function(d) { return d.selected; })
            .each(function(d) { //d.fixed &= ~6; 
                d.fx = null;
                d.fy = null;
            })
        }
    }
}
