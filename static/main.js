var offcolor = "#bbdefb"
var oncolor = "#1565c0"
var size = 3
var main_size = 16
var pixels = 784
var grid = Array.apply(null, Array(784)).map(function(_, i) {
    return i;
});
var pred = d3.select("#prediction")
    .append("svg:svg")
    .attr("width", 28 * main_size)
    .attr("height", 50);

var bar = pred.append("g")
    .attr("class", "bar")

bar.append("svg:rect")
    .attr("id", "chancebar")
    .attr("class", "bar")
    .attr("width", 28 * main_size)
    .attr("height", 50)
    .style("fill", offcolor);

bar.append("text")
    .attr("id", "percent_text")
    .attr("dy", ".75em")
    .attr("y", 15)
    .attr("x", 13 * main_size)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", 30)

// Finds the Guess of a grid
function getAndDrawChance(pixel1) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/score",
        dataType: "json",
        async: true,
        data: "{\"example\": [" + pixel1 + "]}"
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

// input
var pic = []

var input_svg = d3.select("#input").append("svg")
    .attr("width", 28 * size)
    .attr("height", 28 * size);
var input_rect = input_svg.selectAll("rect")
    .data(grid)
    .enter().append("rect")
    .attr("y", function(d, i) {
        return Math.floor((d) / 28) * size
    })
    .attr("x", function(d, i) {
        return (d % 28) * size;
    })
    .attr("width", size)
    .attr("height", size)
    .style("fill", offcolor);

function update_input(picture) {
    for (i = 0; i < picture.length; i++) {
        d3.select(input_rect[0][picture[i]])
            .style("fill", oncolor);
    }
}

// Graph
var bar_svg = d3.select("#bar").append("svg")
    .attr("width", 230)
    .attr("height", 430)

var num = [0,1,2,3,4,5,6,7,8,9]
bar_svg.selectAll("rect")
    .data(num)
    .enter().append("rect")
    .attr("y", function(d, i) {
        return d*37+39;
    })
    .attr("x", function(d, i) {
        return 0;
    })
    .attr("width", 0)
    .attr("height", 36)
    .style("fill", "#fdebd0");

var updateBarGraph = function(xarray){
  bar_svg.selectAll("rect")
  .data(xarray)
  .attr("width", function(d,i){
    return d*150;
  })
}

// Main
var main_svg = d3.select("#grid").append("svg")
    .attr("width", 28 * main_size)
    .attr("height", 28 * main_size);

var main_rect = main_svg.selectAll("rect")
    .data(grid)
    .enter().append("rect")
    .attr("y", function(d, i) {
        return Math.floor((d) / 28) * main_size
    })
    .attr("x", function(d, i) {
        return d % 28 * main_size;
    })
    .attr("width", main_size - 1)
    .attr("height", main_size - 1)
    .style("fill", offcolor);

var startDragging = function(e) {
    // When the mouse down event is received
    if (e.type == "mousedown") {
        main_rect.on("mouseover", function(d) {
            d3.select(main_rect[0][d]).style("fill", oncolor);
            d3.select(main_rect[0][d + 1]).style("fill", oncolor);
            d3.select(main_rect[0][d - 1]).style("fill", oncolor);
            d3.select(main_rect[0][d + 28]).style("fill", oncolor);
            d3.select(main_rect[0][d - 28]).style("fill", oncolor);
            pic.push(d);
            pic.push(d + 1);
            pic.push(d - 1);
            pic.push(d - 28);
            pic.push(d + 28);
            update_input(pic)
            getAndDrawChance(pic)
        })
    }
}
var endDragging = function(e) {
        // When the mouse down event is received
        if (e.type == "mouseup") {
            main_rect.on("mouseover", function(d) {})
        }
    }
    // Reset the grid
function newNumber() {
    pic = []
    main_rect.style("fill", offcolor);
    input_rect.style("fill", offcolor);
    d3.select("#percent_text")
        .text("Prediction: Nothing");
    $("#output td").text('').removeClass('success');
    $("#output th").removeClass('success');
    updateBarGraph([0,0,0,0,0,0,0,0,0,0,]);
};
newNumber()
$(document).on("mousedown", startDragging);
$(document).on("mouseup", endDragging);
