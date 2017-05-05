var offcolor = "#bbdefb";
var oncolor = "#1565c0";
var size = 3;
var main_size = 16;
var pixels = 784;

var grid = new Array(pixels);
for (var i = 0; i < pixels; i++) {
    grid[i] = i;
}

var pic = new Set();

// Prediction Bar.
var pred_bar_svg = d3.select("#prediction")
    .append("svg:svg")
    .attr("width", 28 * main_size)
    .attr("height", 50);

var pred_bar = pred_bar_svg.append("g");

pred_bar.append("svg:rect")
    .attr("width", 28 * main_size)
    .attr("height", 50)
    .style("fill", offcolor);

pred_bar.append("text")
    .attr("id", "percent_text")
    .attr("dy", ".75em")
    .attr("y", 15)
    .attr("x", 13 * main_size)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", 30);

// Main Rect.
var main_svg = d3.select("#grid").append("svg")
    .attr("width", 28 * main_size)
    .attr("height", 28 * main_size);

var main_rect = main_svg.selectAll("rect")
    .data(grid)
    .enter().append("rect")
    .attr("y", function(d, i) {
        return Math.floor((d) / 28) * main_size;
    })
    .attr("x", function(d, i) {
        return d % 28 * main_size;
    })
    .attr("width", main_size - 1)
    .attr("height", main_size - 1)
    .style("fill", offcolor);

// input Rect.
var input_svg = d3.select("#input").append("svg")
    .attr("width", 28 * size)
    .attr("height", 28 * size);

var input_rect = input_svg.selectAll("rect")
    .data(grid)
    .enter().append("rect")
    .attr("y", function(d, i) { return Math.floor(d / 28) * size; })
    .attr("x", function(d, i) { return (d % 28) * size; })
    .attr("width", size)
    .attr("height", size)
    .style("fill", offcolor);

// Graph
var graph_svg = d3.select("#graph").append("svg")
    .attr("width", 230)
    .attr("height", 430);

var num = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

graph_svg.selectAll("rect")
    .data(num)
    .enter().append("rect")
    .attr("y", function(d){ return d * 37 + 39; })
    .attr("x", 0)
    .attr("width", 0)
    .attr("height", 36)
    .style("fill", "#fdebd0");

var updateBarGraph = function(xarray) {
    graph_svg.selectAll("rect")
        .data(xarray)
        .attr("width", function(d) { return d * 150;});
}

// Finds the Guess of a grid
function getAndDrawChance(pic) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/score",
        dataType: "json",
        async: true,
        data: "{\"example\": [" + Array.from(pic) + "]}"
    }).done(function(data) {
        var max = 0;
        var max_index = 0;
        var pred = data["pred"];
        updateBarGraph(pred);
        for (var j = 0; j < 10; j++) {
            var value = Math.round(pred[j] * 1000);
            if (value > max) {
                max = value;
                max_index = j;
            }
            var digits = String(value).length;
            for (var k = 0; k < 3 - digits; k++) {
                value = '0' + value;
            }
            var text = '0.' + value;
            if (value > 999) {
                text = '1.000';
            }

            $("#output tr").eq(j + 1).find('td').eq(0).text(text);
        }
        for (var j = 0; j < 10; j++) {
            if (j == max_index) {
                $("#output tr").eq(j + 1).find('td').eq(0).addClass('success');
                $("#output tr").eq(j + 1).find('th').eq(0).addClass('success');
            } else {
                $("#output tr").eq(j + 1).find('td').eq(0).removeClass('success');
                $("#output tr").eq(j + 1).find('th').eq(0).removeClass('success');
            }
        }
        //var chance = data["score"];
        d3.select("#percent_text")
            .text("Prediction: " + max_index.toFixed(0));
    }).fail(function(result) {})
}

var startDragging = function(e) {
    if (e.type == "mousedown") {
        main_rect.on("mouseover", function(d) {
            pic.add(d);
            pic.add(d + 1);
            pic.add(d - 1);
            pic.add(d + 28);
            pic.add(d - 28);
            // update main rect.
            pic.forEach(function(i) {
                d3.select(main_rect[0][i]).style("fill", oncolor);
            })
            // update input rect.
            pic.forEach(function(i) {
                d3.select(input_rect[0][i]).style("fill", oncolor);
            })
            getAndDrawChance(pic);
        })
    }
};

var endDragging = function(e) {
    if (e.type == "mouseup") {
        main_rect.on("mouseover", function(d) {});
    }
};

// Reset the grid
var newNumber = function() {
    pic = new Set();
    main_rect.style("fill", offcolor);
    input_rect.style("fill", offcolor);
    d3.select("#percent_text").text("Prediction: Nothing");
    $("#output td").text('').removeClass('success');
    $("#output th").removeClass('success');
    updateBarGraph([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

// $(document).ready(do_something);
$(function() {
    newNumber();
    $(document).on("mousedown", startDragging);
    $(document).on("mouseup", endDragging);
    $("button").on("click", newNumber);
});
