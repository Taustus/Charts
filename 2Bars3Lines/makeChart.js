//chartNum - index of textAreaWhite
//data_p - data typeof string
//width_p - width of svg
//height_p - height of svg
//arrOfColors - array of line/rectangle colors
//arrRectangle - array of bools (false not rectangle, true is)
//arrArea - array of bools (false without area, true with)
//rightAxis - true or false
//(right/left/bottom)Axis(Min/Max)Value - values for domains

function makeChart(chartNum, data_p, width_p, height_p,
    arrOfNames,
    arrOfColors,
    arrRectangle, arrArea,
    rightAxis,
    rightAxisMinValue, rightAxisMaxValue,
    leftAxisMinValue, leftAxisMaxValue,
    bottomAxisMinValue, bottomAxisMaxValue) {

    const data_main = data_p;

    //We need this container because of scroll bars
    const svgContainer = d3.select('body')
        .attr('class', 'svgContainer')
        .style('width', width_p + 'px')
        .style('height', height_p + 'px');
  	
    //Main element
    const svg = svgContainer
        .append("svg")
        .attr('class', 'charts')
        .attr("width", width_p)
        .attr("height", height_p);

    //Tooltip
    //по 15px за столбец
    const tooltip = svgContainer.append('div')
        .style("position", "absolute")
        .style("visibility", 'hidden')
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style('width', '150px')
        .style('height', '130px');

    tooltip.append('div')
        .attr('class', 'tooltip_header')
        .append('span');

    tooltip.append('div')
        .attr('class', 'tooltip_text');

    //Set margin and append g element considering margin
    const margin = { "top": 20, "right": 55, "bottom": 30, "left": 45 };
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //Set width and height (also inner variants)
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //Maximum length of an array
    var length = 0;
    //Width of rectangle
    var rectWidth = 0;
    //Counter for chart's id's
    var idCounter = 0;

    //Here we render the invisible rectangles that will
    //select the nodes behind them
    const renderThings = () => {

        //Append g element and append rectangles in cycle
        const selection = g.append('g').attr('class', 'sectionForSelection');
        for (var i = 0; i < length; i++) {
            selection.append('rect')
                //Width of rectangle * rectangle№ + small range between rectangles
                .attr('transform', `translate(${i * rectWidth + (i * 2)}, ${0})`)
                .attr('width', rectWidth)
                .attr('height', innerHeight)
                .style('fill', 'transparent');
                //.style('opacity', 0.4);
        }
        //This is how we select nodes behind rectangles
        function getNodes(k) {
            var elements = [];
            for (var l = 0; l < idCounter; l++) {
                var temp = d3.select(svgContainer).node().select(`[name=chart_${l}]`);
                if (!temp.select(`[name=c${l}-rect_${k}]`).empty()) {
                    elements.push(temp.select(`[name=c${l}-rect_${k}]`));
                }
                else if (!temp.select(`[name=c${l}-circle_${k}]`).empty()) {
                    elements.push(temp.select(`[name=c${l}-circle_${k}]`));
                }
            }
            return elements;
        }
        //Putting all the magic here
        d3.select(svgContainer).node().select('.sectionForSelection').selectAll('rect')
            .on('mouseover', function (d, k) {
                var arrOfNodes = getNodes(k);
                tooltip.style('height', 10 + 13 * arrOfNodes.length + 'px');
                d3.select(svgContainer).node().select('.tooltip_header').select('span')
                    .text(`Данные ${k + 1} недели:`);
                var text = '';
                arrOfNodes.forEach((el, i) => {
                    el.dispatch('mouseover');
                    d3.select(svgContainer).node().select(`[name=span_${i}]`)
                        .text(el.attr('columnName') + '\t' + el.attr('value'));
                });

                tooltip
                    .style('visibility', 'visible')
                    .style('font-size', 11 + 'px');
            })
            .on('mouseout', function (d, k) {
                getNodes(k).forEach(el =>
                    el.dispatch('mouseout'));
                tooltip.selectAll('.text_for_node').text(' ');
                tooltip
                    .style('visibility', 'hidden');
            })
            .on('mousemove', function (d, k) {
                tooltip
                    .style("top", event.pageY - 100 + "px");
                var translate = +tooltip.style('width')
                    .split('px')[0];
                //Translate on the left
                if (translate + event.pageX > svg.attr('width'))
                    tooltip.style('left', event.pageX - translate - 20 + "px");
                else
                    tooltip.style('left', event.pageX + 10 + "px");
            });
    };

    //This function adds axes to chart
    const renderAxes = (data, xScale, yScaleLeft, yScaleRight) => {
        g.append('g').call(d3.axisBottom(xScale).ticks(length / 2))
            .attr('transform', `translate(${-rectWidth / 2 - 2}, ${innerHeight})`)
            .attr('height', 20)
            .attr('class', 'rightAxis');
        var path = d3.select('.rightAxis').select('.domain');
      	var pathD = path.attr('d');
      	//Change this crap on RegEx
      	path.attr('d', pathD.split('H')[0]+'H'+(+pathD.split('H')[1].split('.')[0]+2*(rectWidth / 2 + 2))+'.'+pathD.split('H')[1].split('.')[1]);
        g.append('g').call(d3.axisLeft(yScaleLeft))
            .attr('class', 'leftAxis')
            .attr('transform', `translate(${-rectWidth / 2 - 2}, 0)`);
        if (rightAxis)
            g.append('g').call(d3.axisRight(yScaleRight))
                .attr('transform', `translate(${innerWidth + rectWidth / 2 + 2})`)
                .attr('class', 'bottomAxis');
    };

    //Rendering chart here
    const renderChart = (data, columnName, yScale, xScale, lineColour, fill, rect) => {

        //Add new element to g
        const gNew = g
            .append('g')
            .attr('name', 'chart_' + idCounter++);

        //Make line
        var line = d3.line()
            .x((d, i) => xScale(i) + (innerWidth / length) / 2) // set the x values for the line generator
            .y(d => yScale(d)); // set the y values for the line generator 
        //.curve(d3.curveMonotoneX); // apply smoothing to the line

        //Radius
        const r = 2;
        //Stores rectangles or circles
        var elements = undefined;

        //If not rectangles
        if (!rect) {

            //Add line to connect circles
            gNew.append('path')
                .attr("d", line(data))
                .attr("stroke", lineColour)
                .attr("stroke-width", r)
                .attr("fill", "none");

            //Append circles
            elements = gNew.selectAll('circle').data(data)
                //We need these two lines from below to add links
                .enter()//.append('a')
                //.attr('xlink:href', 'http://google.com')
                .append('circle')
                .attr('name', (d, i) => 'c' + (idCounter - 1) + '-circle_' + i)
                .attr('value', d => d)
                .attr('r', r)
                .attr('cx', (d, i) => xScale(i) + (innerWidth / length) / 2)
                .attr('cy', d => yScale(d));

            //If we need area under chart
            if (fill) {
                gNew.append("path")
                    .datum(data)
                    .attr("fill", lineColour)
                    .attr("fill-opacity", .3)
                    .attr("stroke", "none")
                    .attr("d", d3.area()
                        .x((d, i) => xScale(i) + (innerWidth / length) / 2)
                        .y0(innerHeight)
                        .y1(d => yScale(d))
                    )
            }
        }
        //If rectangles
        else {

            //Append rectangles
            elements = gNew.selectAll('rect').data(data)
                //We need these two lines from below to add links
                .enter()//.append('a')
                //.attr('xlink:href', 'http://google.com')
                .append('rect')
                .attr('name', (d, i) => 'c' + (idCounter - 1) + '-rect_' + i)
                .attr('value', d => d)
                .attr('x', (d, i) => xScale(i))
                .attr('y', d => yScale(d))
                .attr('height', d => innerHeight - yScale(d))
                .attr('width', rectWidth);
        };
        //Set events
        //I have a bit problem here, but it doesn't affect functionality
        //I don't check here if elements are rectangles or circles, because
        //code for this is big enough and also if I'll set attr 'r' for rects
        //it won't affect anything.
        elements
            .attr('columnName', columnName)
            .on('mouseover', function (d, i) {
                //Change radius and colour
                d3.select(this)
                    //Fix for rects
                    .attr('r', r * 2.5);
                //.style('fill', circleColour);
                //We don't need this right now
                //.append('title')
                //.text(`x value is ${i}\n`+
                //			`y value is ${d}`);

            })
            .on('mouseout', function (d, i) {
                //Set radius and colour to default
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('r', r);
                //.style('fill', lineColour);
            })
            .style('fill', lineColour);
    };
    //console.log(d3.csvParse(data_main));
    const data = d3.csvParse(data_main);
    //csv('https://raw.githubusercontent.com/Taustus/Charts/master/2Bars3Lines/RandomData.csv')
    //.then(data => {

    ////Operations with data
    var arrOfColumns = [];

    for (const key in data[0]) {
        //Cast to number
        data.forEach(x => +x[key]);
        var temp = data.map(x => x[key])
            .filter(x => !isNaN(x));
        //Map columns and filter
        arrOfColumns.push(temp);
    }

    ////Set global vars and define scales
    //Set vars
    length = data.length;
    rectWidth = innerWidth / length - 2;
    //Define scales
    const yScale = (l, r) => d3.scaleLinear()
        .domain([l, r])
        .range([innerHeight, 0]);

    const xScale = (l, r) => d3.scaleLinear()
        .domain([0, length])
        .range([0, innerWidth]);

    ////Render this beauty
    //Render left, bottom and right axes
    renderAxes(data,
        xScale(bottomAxisMinValue, bottomAxisMaxValue),
        yScale(leftAxisMinValue, leftAxisMaxValue),
        yScale(rightAxisMinValue, rightAxisMaxValue));

    //Define colors arr
    //Render all columns
    for (var i = 1; i < arrOfColumns.length; i++) {
        d3.select(svgContainer).node().select('.tooltip_text')
            .append('span')
            .attr('name', 'span_' + i)
            .attr('class', 'text_for_node')
            .style('display', 'block');
      	

        var yScaleLeftOrRight = yScale(leftAxisMinValue, leftAxisMaxValue);
        var left = d3.max(arrOfColumns[i]) <= leftAxisMaxValue;
        yScaleLeftOrRight = left ?
            yScale(leftAxisMinValue, leftAxisMaxValue) :
            yScale(rightAxisMinValue, rightAxisMaxValue);

        //renderChart params:
        //array, yScale(array), xScale, colour for mouseover event, line/bar colour, withArea, isRectangle)
        renderChart(arrOfColumns[i],
            arrOfNames[i],
            yScaleLeftOrRight,
            xScale(bottomAxisMinValue, bottomAxisMaxValue),
            arrOfColors[i],
            arrArea[i],
            arrRectangle[i])
    }
    renderThings();

}
makeChart(0,
            `A,B,C,D,E,F,G,H,I
13,64,72,79.364,3200,3500,400,87,77
11,61.488,100,77.364,3104,2381,2547,87,77
23,58.17,69.592,NULL,2850,2226,NULL,87,77
14,61.544,71.768,NULL,3561,2502,NULL,87,77
7,50.939,72.44,77.328,3360,2237,1608,87,77
4,62.657,70.72,80.019,2571,2178,1940,87,77
1,62.902,70.28,79.695,2208,2045,2173,87,77
26,59.92,68.336,NULL,2516,2050,NULL,87,77
16,60.928,69.672,NULL,2821,2238,NULL,87,77
13,60.914,69.776,NULL,2920,2465,NULL,87,77
6,59.808,71.76,79.191,2374,2134,2224,87,77
17,59.864,69.384,NULL,2657,2606,NULL,87,77
3,61.635,70.152,79.011,2363,2171,2228,87,77
21,59.976,69.712,NULL,2641,2444,NULL,87,77
24,59.171,69.672,NULL,2674,2071,NULL,87,77
10,59.836,69.864,77.301,3448,2342,2120,87,77
13,61.061,67.976,NULL,3396,2454,NULL,87,77
19,60.879,69.76,NULL,2621,2253,NULL,87,77
22,58.919,65.896,NULL,2895,2374,NULL,87,77
3,61.691,71.472,80.001,2358,2639,2288,87,77
25,60.312,70.048,NULL,2734,2307,NULL,87,77
0,59.885,70.784,79.191,614,492,366,87,77
12,60.585,69.392,74.88,2183,2328,2180,87,77
23,60.235,68.424,NULL,2632,2157,NULL,87,77
9,59.759,70.256,78.984,1870,1460,1575,87,77
15,59.773,70.552,NULL,3121,2508,NULL,87,77
5,62.426,68.776,80.1,1752,1651,2516,87,77
20,58.94,70.048,NULL,2724,2362,NULL,87,77
2,62.671,71.584,79.605,2285,2214,2181,87,77
9,59.556,71.448,76.923,2354,2166,1327,87,77
12,59.43,67.976,70.326,2696,2604,2862,87,77
18,59.402,70.04,NULL,2995,2405,NULL,87,77
6,61.152,70.856,78.669,2765,2326,2198,87,77
21,58.429,69.68,NULL,3035,2246,NULL,87,77
2,62.293,70.864,78.147,2412,1991,2405,87,77
11,61.327,69.32,78.579,3041,2385,2212,87,77
16,59.318,69.36,NULL,2731,2326,NULL,87,77
19,61.271,71.96,NULL,3220,2555,NULL,87,77
8,61.005,69.224,79.677,3118,2317,1597,87,77
22,57.477,68.48,NULL,2276,1939,NULL,87,77
1,62.643,67.984,78.615,1781,1271,1164,87,77
24,61.117,68.2,NULL,2515,2031,NULL,87,77
8,61.502,71.792,79.506,3645,2373,1736,87,77
15,61.117,69.36,NULL,2704,2184,NULL,87,77
17,60.564,70.08,NULL,2872,2444,NULL,87,77
20,60.137,69.856,NULL,2752,2307,NULL,87,77
5,63.28,70.712,79.533,2915,2110,1973,87,77
10,62.825,70.464,77.373,3427,2566,1670,87,77
14,60.34,69.744,NULL,3008,2501,NULL,87,77
7,57.757,70.16,78.867,2768,1929,1416,87,77
18,61.04,69.208,NULL,2730,2039,NULL,87,77
4,60.522,71.12,80.163,1937,2402,2327,87,77
25,61.089,69.368,NULL,2514,2748,NULL,87,77`,
            960, 450,
          	['', 'l', 'o', 'l', 'k' ,'e', 'k', 'f', 'k'],
            ['', '#e6e6e6', 'Orange', '#8080ff', 'Gray', 'DarkOliveGreen', 'Red', 'green', 'black', 'purple'],
            [null, false, true, false, false, false, false, false, false, false],
            [null, true, false, false, false, false, false, false, false, false],
            true,
            0, 3700,
            0, 100,
            0, 52);