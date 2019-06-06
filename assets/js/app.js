//Make the browser responsive and load the chart
d3.select(window).on("resize", makeResponsive);
loadChart();

// Boilerplate code for the browser re-size
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  }
}

// Let's make a chart!  
function loadChart() {
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  var margin = {
    top: 40,
    right: 40,
    bottom: 100,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Make the SVG wrapper for our chart
 
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Make a group and select some defaults
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // Time to make the donuts (aka get the data)
  d3.csv("assets/data/data.csv", function(err, healthData) {
    if (err) throw err;

    // LOOOOOOOOOOOOOOOOOOP
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });




    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Weight watchers
    if (svgWidth < 500) {
      var leftAxis = d3.axisLeft(yLinearScale).ticks(5);
    }
    else {
      var leftAxis = d3.axisLeft(yLinearScale).ticks(10);
    }

    // do all the axis stuff
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // add the circles
    var circlesGroup = chartGroup.append("g")
      .selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 12)
      .attr("fill", "green")
      .attr("opacity", ".75");

    // label the circles
    var textsGroup = chartGroup.append("g")
      .selectAll("text")
      .data(healthData)
      .enter()
      .append("text")
      .classed("text-group", true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("font_family", "fantasy") 
      .attr("font-size", "12px")  
      .attr("fill", "black")   
      .style("font-weight", "bold");



    // Responsive scatter size and text labels
    if (svgWidth < 500) {
      circlesGroup.attr("r", 5);
      textsGroup.style("display", "none");
    }
    else {
      circlesGroup.attr("r", 12);
      textsGroup.style("display", "inline");
    }

    // Label the labels and stuff
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
      .classed("xLabel", true);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poor People (%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income");
    
    // Create group for  3 y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .classed("yLabel", true);

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 50)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")
      .attr("dy", "1em")
      .classed("active", true)
      .text("% with no insurance");

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 70)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("% Fat People");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 0 - 90)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("% Smokes");

    // update the ToolTip 
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

    // get the clickity click from the user
    labelsGroup.selectAll("text")
      .on("click", function() {
        // what'd they pick?
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // update the data
          chosenXAxis = value;
          xLinearScale = xScale(healthData, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
          textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis);
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // tons of stupid code just to make the selection bold
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "poverty") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // do the same for the y axis stuff
    ylabelsGroup.selectAll("text")
      .on("click", function() {
    //mucho copy paste-o
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          
          chosenYAxis = value;
          yLinearScale = yScale(healthData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
          textsGroup = renderYTexts(textsGroup, yLinearScale, chosenYAxis);
          circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });


  // weight watchers when clickity click
  function xScale(healthData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;
  }

  // weight watchers when clickity click
  function yScale(healthData, chosenYAxis) {
  
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d[chosenYAxis]) * 1.2])
      .range([height, 0]);

    return yLinearScale;
  }

  // X label when clickity click
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // Y label when clickity click
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  
  // make new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  
  // russian circles is a good band
  function renderTexts(textsGroup, newXScale, chosenXAxis) {

    textsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));

    return textsGroup;
  }

  function renderYTexts(textsGroup, newYScale, chosenYAxis) {

    textsGroup.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return textsGroup;
  }

  // update the tool tips
  function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var label = "Poor People (%)";
    }
    else if (chosenXAxis === "age") {
      var label = "Age";
    }
    else if (chosenXAxis === "income") {
      var label = "Household Income";
    }

    var chosenYAxis = d3.select(".yLabel").select(".active").attr("value");

    if (chosenYAxis === "healthcare") {
      var yLabel = "% with no insurance";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "% Fat People";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "% Smokes";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    return circlesGroup;
  }

  // function used for updating circles group with new tooltip
  function updateYToolTip(chosenYAxis, circlesGroup) {

    if (chosenYAxis === "healthcare") {
      var yLabel = "% with no insurance";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "% Fat People";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "% Smokes";
    }

    var chosenXAxis = d3.select(".xLabel").select(".active").attr("value");

    if (chosenXAxis === "poverty") {
      var label = "Poor People (%)";
    }
    else if (chosenXAxis === "age") {
      var label = "Age";
    }
    else if (chosenXAxis === "income") {
      var label = "Household Income";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    return circlesGroup;
  }

}