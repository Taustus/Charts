//chartNum - index of textAreaWhite
//data_p - data typeof string
//width_p - width of svg
//height_p - height of svg
//arrOfColors - array of line/rectangle colors
//arrRectangle - boolean array (false not rectangle, true is)
//arrArea - boolean array (false without area, true with)
//arrOfDots - boolean array (false dots without line, true with)
//rightAxis - true or false
//(right/left)Axis(Min/Max)Value - values for domains
//(right/left/bottom)AxisTicks - amount of ticks for each axis
//start - index of initial column
//additionalLeftMargin - add some left margin
//toReplace - id of old chart to replace
//dotsRadius - radius of dot
//onClick - do we need to onClick eventlistener
//dashedLine - boolean array (false line is not dashed, true dashed)
//additional(Left/Right)Margin - additional margin
//forceLength - if we want to make chart's length bigger (example: 28 rows from select, we need 52 => forceLength = 52)

export function makeChart({ chartNum, data_p, width_p, height_p,
    arrOfNames = [],
    stringForAbuseDay = '',
    arrOfColors,
    arrRectangle,
    arrArea = [],
    dotsRadius = 3,
    arrOfLines = [],
    dashedLine = [],
    rightAxis = false,
    leftArr = [],
    forceRightAxisMin, forceRightAxisMax,
    forceLeftAxisMin, forcleLeftAxisMax,
    bottomAxisTicks = 0,
    start = 1,
    finish = -1,
    dataIndexes = [],
    allStacked = false,
    stacked = false,
    neighbors = false,
    additionalLeftMargin = 0,
    additionalRightMargin = 0,
    toReplace,
    horizontalTicks = true,
    forceLength = 0 } = {}) {

    stacked = allStacked ? true : stacked;

    //Container for svg
    var svgContainer;

    if (chartNum == undefined) {
        var temp = d3.select('#' + toReplace).node().parentNode;
        temp.innerHTML = '';
        svgContainer = d3.select(temp);
    }
    else {
        d3.select('#' + toReplace).remove();
        svgContainer = d3.selectAll('.chartArea')
            .filter(function (d, i) { return i === chartNum; });
    }

    svgContainer.innerHTML = '';

    svgContainer.style('width', width_p + 'px')
        .style('height', height_p + 'px');

    //Main element
    const svg = svgContainer
        .append('svg')
        .attr('class', 'charts')
        .attr('width', width_p)
        .attr('height', height_p);

    //Set up tooltip
    const tooltip = svgContainer.append('div');

    //Legend
    var legend = undefined;
    var maxWidth = 0;
    var textHeight = 20;
    var textMargin = 5;
    var rectX = -12;
    var rectY = -12;

    var leftMargin = 75 + additionalLeftMargin;
    var rightMargin = 55 + additionalRightMargin;
    //Set margin and append g element considering margin
    const margin = { 'top': 20, 'right': rightMargin, 'bottom': 30, 'left': leftMargin };
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //Set width and height (also inner variants)
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //If stacked
    var forStack = [];
    //Maximum length of an array
    var length = 0;
    //Width of rectangle
    var rectWidth = 0;
    //rectWidth/2 + 2
    var offset = 0;
    //Counter for charts
    var chartCounter = 0;

    var maxTextLength = 0;
    var flagForTextLength = true;
    //Set up legend, transparent rectangles and their eventListeners
    function renderThings(xScale, data, isBand, bandData) {
        //Set up rectangle in legend
        var textNodesCount = tooltip.selectAll('.text_for_node').size();
        legend.attr(
            'transform',
            `translate(${innerWidth - maxWidth}, ${margin.top + margin.bottom + 5})`
        );
        legend.select('.legend-rect')
            .attr('width', maxWidth * 1.23 + 5 + 'px')
            .attr('height', textNodesCount * textHeight + textMargin * 2 + rectY / 2 + 'px')
            .attr('x', rectX)
            .attr('y', rectY)
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('opacity', 0.8);
        //Append g element and append rectangles in cycle
        const selection = g.append('g').attr('class', 'sectionForSelection');
        selection.selectAll('rect')
            .data(data).enter().append('rect')
            //Width of rectangle * rectangle№ + small range between rectangles
            .attr('transform', (d, i) => {
                var toReturn = xScale(i + 1) > innerWidth && i < 1 ? xScale(i + 0.5) - offset : xScale(i) + 1;
                //SAY MY NAME
                //Kostyl....
                //You're God damn right
                toReturn = length < 7 && length > 1 ? toReturn + ((innerWidth / length) / ((0.5 + (0.05 * (length - 2))) * (length + 3))) : toReturn;
                if (neighbors) {
                    toReturn -= rectWidth + rectWidth * neighborNum;
                }
                else if (isBand) {
                    toReturn -= rectWidth / 2;
                }
                return `translate(${toReturn}, 0)`;
            })
            .attr('width', rectWidth)
            .attr('height', innerHeight)
            .style('fill', 'transparent');

        //Get nodes(circles and rectangles) behind transparentRectangle[k]
        function getNodes(k) {
            var elements = [];
            for (var l = 0; l < chartCounter; l++) {
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
        //Add eventListeners to rectangles
        d3.select(svgContainer).node().select('.sectionForSelection').selectAll('rect')
            .on('mouseover', function (d, k) {
                //Get nodes behind this rectangle
                var arrOfNodes = getNodes(k);

                tooltip.style('height', 11.8 * (arrOfNodes.length + 1) + 2 + 'px');
                var spanHeaderText = `${k + 1} недели:`;
                if (isBand) {
                    spanHeaderText = `${bandData[k]}:`
                }
                //Change tooltip header
                var spanHeader = d3.select(svgContainer).node().select('.tooltip_header').select('span')
                    .text(`Данные ${spanHeaderText}`);
                if (flagForTextLength)
                    maxTextLength = spanHeader.node().offsetWidth > maxTextLength ? spanHeader.node().offsetWidth : maxTextLength;
                //For each node dispatch her event and use her value attr for tooltip
                arrOfNodes.forEach((el, i) => {
                    el.dispatch('mouseover');
                    var span = d3.select(svgContainer).node().select(`[name=span_${i}]`)
                        .text(el.attr('columnName') + ':\t' + el.attr('value'));
                    if (flagForTextLength)
                        maxTextLength = span.node().scrollWidth > maxTextLength ? span.node().scrollWidth : maxTextLength;
                });
                //Make tooltip visible
                if (flagForTextLength)
                    tooltip.style('width', (maxTextLength + 5) + 'px');
                flagForTextLength = false;
                tooltip
                    .style('visibility', 'visible');
            })
            .on('mouseout', function (d, k) {
                //For each node behind dispatch mouseout
                getNodes(k).forEach(el =>
                    el.dispatch('mouseout'));
                //Reset all text back (if we won't do that, tooltip won't scale)
                tooltip.selectAll('.text_for_node')
                    .text(' ');
                //Make tooltip hidden
                tooltip
                    .style('visibility', 'hidden');
            })
            .on('mousemove', function (d, k) {
                //Change tooltip position
                tooltip
                    .style('top', event.pageY - 100 + 'px');
                var translate = +tooltip.style('width')
                    .split('px')[0];
                //Translate on the left
                if (translate + event.pageX > svg.attr('width'))
                    tooltip.style('left', event.pageX - translate - 20 + 'px');
                else
                    tooltip.style('left', event.pageX + 10 + 'px');
            });
        if (stringForAbuseDay != '') {
            d3.select(svgContainer).node().select('.sectionForSelection').selectAll('rect')
                .on('click', function (d, k) {
                    var newWindow = window.open(`http://${window.location.href.split('//')[1].split('/')[0]}/AbuseDay.aspx?${k + 1}?${k + 2}?${stringForAbuseDay.replace(' ', '_')}`);
                    if (window.focus) {
                        newWindow.focus();
                    }
                })
        }
    };

    //This function adds axes to chart
    function renderAxes(data, xScale, yScaleLeft, yScaleRight, leftTicks, rightTicks, isBand, isDate) {
        const axes = g.append('g').attr('class', 'axes');

        var axisLeft = d3.axisLeft(yScaleLeft)
            .ticks(leftTicks)
            .tickSizeOuter(0);
        var tickSizeLeft = -innerWidth;
        if (rightAxis) {
            tickSizeLeft -= offset * 2;
        }
        else {
            tickSizeLeft -= offset;
        }
        if (!horizontalTicks) {
            tickSizeLeft = 0;
        }
        axisLeft
            .tickSizeInner(tickSizeLeft);
        var bottomAxis = d3.axisBottom(xScale);
        bottomAxis
            .tickSizeInner(-innerHeight)
            .tickSizeOuter(0)
            .tickPadding(7);
        if (isDate) {
            var values = xScale.domain();
            if (!(xScale.domain().length < 5)) {
                values = xScale.domain().map((x, i) => {
                    if (i % (Math.floor(xScale.domain().length / 5)) == 0 || i == xScale.domain().length - 1)
                        return x;
                }).filter(x => {
                    return !(x == undefined);
                })
                var temp = new Date();
                if (values.length < 2) {
                    values.push(new Date(temp.setDate(values[0].getDate() - 1)));
                }
                if (values.length < 3) {
                    values.push(new Date(temp.setDate(values[0].getDate() + 1)));
                }
                values = values.slice().sort((a, b) => a.date - b.date)

                values[values.length - 1] = values.length >= 7 ? '' : values[values.length - 1];
            }
            var format = d3.timeFormat("%d.%m.%Y");
            var counter = 0;
            bottomAxis.tickValues(xScale.domain())
                .tickFormat(function (d, i) {
                    if (values[counter] == d || xScale.domain().length <= 12) {
                        counter++;
                        return format(d)
                    }
                    return '';
                });
        }

        axes.append('g')
            .call(axisLeft)
            .attr('class', 'leftAxis')
            .attr('transform', `translate(${-offset - 1}, 0)`);

        if ((length == 52 || length == 53) && !isBand) {
            bottomAxisTicks = 2;
        }
        if (bottomAxisTicks == 0) {
            bottomAxisTicks = length;
        }
        else {
            bottomAxisTicks = length < 26 ? length : length % 2 == 0 ? length / bottomAxisTicks : (length - 1) / bottomAxisTicks;
        }
        axes.append('g')
            .call(bottomAxis.ticks(bottomAxisTicks))
            .attr('transform', `translate(${-offset + 0.4}, ${innerHeight})`)
            .attr('height', 20)
            .attr('class', 'bottomAxis');
        if (rightAxis) {
            axes.append('g')
                .call(d3.axisRight(yScaleRight)
                    .ticks(rightTicks)
                    .tickSizeInner(0)
                    .tickSizeOuter(0))
                .attr('transform', `translate(${innerWidth + offset})`)
                .attr('class', 'rightAxis');
            var path = svgContainer.select('.bottomAxis').select('.domain');
            var pathD = path.attr('d');
            var pathLength = parseInt(pathD.split('H')[1].split('.')[0]) + parseInt(offset);
            //Change this crap on RegEx
            path.attr(
                'd',
                pathD.split('H')[0] +
                'H' +
                pathLength +
                '.' +
                pathD.split('H')[1].split('.')[1]);
        }
    }

    //Rendering chart here
    function renderChart(
        data,
        columnName,
        yScale,
        xScale,
        lineColour,
        fill,
        rect,
        withLine,
        isDashed,
        neighborNum,
        isBand
    ) {
        //Add new element to g
        const gNew = g.append('g').attr('name', 'chart_' + chartCounter++);
        //Edit legend-items
        var legendItems = legend.select('.legend-items');
        var newTextOfLegend = legendItems
            .append('text')
            .attr('y', (chartCounter - 1) * textHeight + textMargin)
            .attr('x', '1em')
            .text(columnName);
        if (+newTextOfLegend.node().clientWidth > maxWidth) {
            maxWidth = +newTextOfLegend.node().clientWidth;
        }

        //Radius
        var r = dotsRadius;
        //Stores rectangles or circles
        var elements = undefined;

        //If not rectangles
        if (!rect) {
            if (withLine) {
                //Make line
                var line = d3.line()
                    .x((d, i) => {
                        var toReturn = xScale(i) + innerWidth / length / 2;
                        if (isBand) {
                            toReturn -= rectWidth / 2;
                        }
                        return toReturn;
                    }) // set the x values for the line generator
                    .y((d) => yScale(d)); // set the y values for the line generator

                //Add line to connect circles
                var path = gNew.append('path')
                    .attr('d', line(data))
                    .style('stroke', lineColour)
                    .style('stroke-width', dotsRadius)
                    .style('fill', 'none');

                if (isDashed)
                    path.style('stroke-dasharray', '3, 3')
                        .style('opacity', '0.8');
            }

            //Append circles
            elements = gNew.selectAll('circle')
                .data(data)
                //We need these two lines from below to add links
                .enter() //.append('a')
                //.attr('xlink:href', 'http://google.com')
                .append('circle')
                .attr('name', (d, i) => 'c' + (chartCounter - 1) + '-circle_' + i)
                .attr('value', (d) => d)
                .attr('r', dotsRadius / 2)
                .attr('cx', (d, i) => {
                    var toReturn = xScale(i) + innerWidth / length / 2;
                    if (isBand) {
                        toReturn -= rectWidth / 2;
                    }
                    return toReturn;
                })
                .attr('cy', (d) => yScale(d));

            legendItems.append('circle')
                .attr('r', dotsRadius * 2)
                .attr('fill', lineColour)
                .attr('transform', `translate(0, ${(chartCounter - 1) * textHeight + textMargin - 5})`);
            //If we need area under chart
            if (fill) {
                gNew.append('path')
                    .datum(data)
                    .attr('fill', lineColour)
                    .attr('fill-opacity', 0.3)
                    .attr('stroke', 'none')
                    .attr(
                        'd',
                        d3.area()
                            .x((d, i) => xScale(i) + innerWidth / length / 2)
                            .y0(innerHeight)
                            .y1((d) => yScale(d))
                    );
            }
        }
        //If rectangles
        else {
            //Append rectangles
            elements = gNew.selectAll('rect')
                .data(data)
                //We need these two lines from below to add links
                .enter() //.append('a')
                //.attr('xlink:href', 'http://google.com')
                .append('rect')
                .attr('name', (d, i) => 'c' + (chartCounter - 1) + '-rect_' + i)
                .attr('value', (d) => d)
                .attr('x', (d, i) => {
                    var toReturn = xScale(i + 1) > innerWidth && i < 1 ? xScale(i + 0.5) - offset : xScale(i) + 1;
                    //SAY MY NAME
                    //Kostyl....
                    //You're God damn right
                    toReturn = length < 7 && length > 1 ? toReturn + ((innerWidth / length) / ((0.5 + (0.05 * (length - 2))) * (length + 3))) : toReturn;
                    if (neighbors) {
                        toReturn -= rectWidth + rectWidth * neighborNum;
                    }
                    else if (isBand) {
                        toReturn -= rectWidth / 2;
                    }
                    return toReturn;
                })
                .attr('y', (d, i) => {
                    var toReturn = yScale(d);
                    if (stacked) {
                        if (forStack.length <= i) {
                            forStack.push(innerHeight - yScale(d));
                        }
                        else {
                            toReturn -= forStack[i];
                            forStack[i] += innerHeight - yScale(d);
                        }
                    }
                    return toReturn;
                })
                .attr('height', (d) => innerHeight - yScale(d))
                .attr('width', rectWidth - 2);

            legendItems.append('rect')
                .attr('height', dotsRadius * 4)
                .attr('width', dotsRadius * 4)
                .attr('x', -(dotsRadius * 4) / 2)
                .attr('y', -(dotsRadius * 4) / 2)
                .attr('fill', lineColour)
                .attr('transform', `translate(0, ${(chartCounter - 1) * textHeight + textMargin - 5})`);
        }
        //Set events for circles
        elements.attr('columnName', columnName)
            .style('fill', lineColour);
        if (!rect) {
            elements
                .on('mouseover', function (d, i) {
                    //Change radius and colour
                    d3.select(this)
                        .attr('r', dotsRadius * 1.5);
                })
                .on('mouseout', function (d, i) {
                    //Set radius and colour to default
                    d3.select(this)
                        .transition()
                        .duration(0)
                        .attr('r', dotsRadius / 2);
                })
        }
        else {
            elements
                .on('mouseover', function (d, i) {
                    d3.select(this).attr('stroke', 'blue').attr('stroke-width', 1.5);
                })
                .on('mouseout', function (d, i) {
                    //Set radius and colour to default
                    d3.select(this)
                        .attr('stroke', null)
                        .attr('stroke-width', null);
                })
        }
    }
    function configureElements() {
        tooltip
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .attr('class', 'tooltip')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '2px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .style('width', '0px')
            .style('height', '110px')
            .style('font-size', '11px')
            .style('white-space', 'nowrap');

        tooltip.append('div')
            .attr('class', 'tooltip_header').append('span');

        tooltip.append('div')
            .attr('class', 'tooltip_text');
    }
    function mainFunction() {

        const data = d3.csvParse(data_p);
        var empty = arrOfNames.length == 0;
        configureElements();
        ////Operations with data
        var arrOfColumns = [];
        var counter = 0;
        for (const key in data[0]) {
            var flag = finish == -1;
            if ((counter >= start && counter <= finish) || counter == 0 || flag) {
                //Cast to number
                if (empty)
                    arrOfNames.push(key);
                data.forEach(x => {
                    if (!isNaN(parseInt(x[key])))
                        return +x[key];
                    else
                        return x;
                });
                var temp = data.map(x => x[key])
                    .filter(x => {
                        return !(x == 'NULL');
                    });
                //Map columns and filter
                arrOfColumns.push(temp);
            }
            counter++;
        }
        //If there's a column named like a number - we'll have problems
        if (!isNaN(parseInt(arrOfNames[0]))) {
            for (var i = 0; i < arrOfNames.length; i++) {
                if (arrOfNames[i] == 'W') {
                    var tempArrNames = [];
                    var tempArrValues = [];
                    for (var l = -1; l < i; l++) {
                        if (l == -1) {
                            tempArrNames.push(arrOfNames.slice(i, i + 1)[0]);
                            tempArrValues.push(arrOfColumns.slice(i, i + 1)[0]);
                        }
                        else {
                            tempArrNames.push(arrOfNames.slice(l, l + 1)[0]);
                            tempArrValues.push(arrOfColumns.slice(l, l + 1)[0]);
                        }
                    }
                    arrOfNames = tempArrNames.slice();
                    arrOfColumns = tempArrValues.slice();
                }
            }
        }
        ////Set global vars and define scales
        //Set vars
        length = forceLength != undefined && forceLength != 0 ? forceLength : data.length;
        rectWidth = length < 7 ? innerWidth / 7 : innerWidth / length;
        offset = rectWidth / 2;

        //Set legend  
        legend = svg.append('g')
            .attr('class', 'legend')
            .style('font-size', '12px')
            .style('text-align', 'right')
            .style('background-color', 'white');
        legend.append('rect')
            .attr('class', 'legend-rect');
        legend.append('g')
            .attr('class', 'legend-items');

        var isDate = false;

        //Define scales
        const yScale = (l, r) => d3.scaleLinear()
            .domain([l, r])
            .range([innerHeight, 0]);

        const xScale = (l, r, coeff = 1) => d3.scaleLinear()
            .domain([0, r])
            .range([0, innerWidth + offset * coeff]);

        const xScaleBand = (domain) => d3.scaleBand()
            .domain(domain.map((x, i) => {
                if (x.includes(':')) {
                    isDate = true;
                    var split = x.split('.');
                    var temp = split[1] + '.' + split[0] + '.' + split[2].split(' ')[0];
                    return new Date(temp);
                }
                else
                    return x;
            }))
            .range([0, innerWidth + offset]);
        var axisRightMax = 0, axisRightMin = Number.MAX_SAFE_INTEGER;
        var axisLeftMax = 0, axisLeftMin = Number.MAX_SAFE_INTEGER;
        for (var i = 1; i < arrOfColumns.length; i++) {
            var min = d3.min(arrOfColumns[i].map(Number));
            var max = d3.max(arrOfColumns[i].map(Number));
            if (!rightAxis || leftArr[i]) {
                if (max > axisLeftMax) {
                    axisLeftMax = max;
                }
                if (min < axisLeftMin) {
                    axisLeftMin = min;
                }
            }
            else if (rightAxis) {
                if (max > axisRightMax) {
                    axisRightMax = max;
                }
                if (min < axisRightMin) {
                    axisRightMin = min;
                }
            }
        }

        if (allStacked) {
            for (var i = 0; i < arrOfColumns[0].length; i++) {
                var subMax = 0;
                for (var l = 1; l < arrOfColumns.length; l++) {
                    subMax += +arrOfColumns[l][i];
                }
                axisLeftMax = subMax > axisLeftMax ? subMax : axisLeftMax;
            }

            if (rightAxis) {
                for (var i = 0; i < arrOfColumns[0].length; i++) {
                    var subMax = 0;
                    for (var l = 1; l < arrOfColumns.length; l++) {
                        subMax += +arrOfColumns[l][i];
                    }
                    axisRightMax = subMax > axisRightMax ? subMax : axisRightMax;
                }
            }
        }
        function countDigits(n) {
            for (var i = 0; n > 1; i++) {
                n /= 10;
            }
            return i;
        }

        axisLeftMax = forcleLeftAxisMax != undefined ? forcleLeftAxisMax : axisLeftMax;
        axisLeftMin = forceLeftAxisMin != undefined ? forceLeftAxisMin : axisLeftMin;
        axisRightMax = forceRightAxisMax != undefined ? forceRightAxisMax : axisRightMax;
        axisRightMin = forceRightAxisMin != undefined ? forceRightAxisMin : axisRightMin;

        var distanceCoefficient = 0.2;

        var leftTicks = 0, rightTicks = 0;
        //Dance with left max value
        var temp = countDigits(axisLeftMax);
        var smallValue = parseFloat((axisLeftMax / Math.pow(10, (temp - 1))).toFixed(1));
        var topSpace = smallValue % 0.5 == 0 ? 0.5 : parseFloat((0.5 - parseFloat((smallValue % 0.5).toFixed(1))).toFixed(1));
        topSpace += topSpace < distanceCoefficient && smallValue != 0 ? 0.5 : 0;
        axisLeftMax = (smallValue + topSpace) * Math.pow(10, (temp - 1));
        //Fix for percents
        axisLeftMax = axisLeftMax >= 75 && (axisLeftMax < 100 || (axisLeftMax > 100 && axisLeftMax < 110)) ? 100 : axisLeftMax;
        //Dance with left min value
        temp = countDigits(axisLeftMin);
        smallValue = parseFloat((axisLeftMin / Math.pow(10, (temp - 1))).toFixed(1));
        topSpace = smallValue % 0.5 == 0 ? smallValue == 0 ? 0 : 0.5 : parseFloat((smallValue % 0.5).toFixed(1));
        topSpace += topSpace < 0.2 && smallValue != 0 ? 0.5 : 0;
        axisLeftMin = (smallValue - topSpace) * Math.pow(10, (temp - 1));
        //Left ticks
        leftTicks = Math.ceil(axisLeftMax - axisLeftMin);
        leftTicks = (leftTicks / Math.pow(10, countDigits(leftTicks) - 1)) / 0.5;
        if (rightAxis) {
            //Dance again with right max value
            temp = countDigits(axisRightMax);
            smallValue = parseFloat((axisRightMax / Math.pow(10, (temp - 1))).toFixed(1));
            topSpace = smallValue % 0.5 == 0 ? 0.5 : parseFloat((0.5 - parseFloat((smallValue % 0.5).toFixed(1))).toFixed(1));
            topSpace += topSpace < 0.2 && smallValue != 0 ? 0.5 : 0;
            axisRightMax = (smallValue + topSpace) * Math.pow(10, (temp - 1));
            //Finally dance with right min value
            temp = countDigits(axisRightMin);
            smallValue = parseFloat((axisRightMin / Math.pow(10, (temp - 1))).toFixed(1));
            topSpace = smallValue % 0.5 == 0 ? smallValue == 0 ? 0 : 0.5 : parseFloat((smallValue % 0.5).toFixed(1));
            topSpace += topSpace < 0.2 && smallValue != 0 ? 0.5 : 0;
            axisRightMin = (smallValue - topSpace) * Math.pow(10, (temp - 1));
            //Right ticks
            rightTicks = Math.ceil(axisRightMax - axisRightMin);
            rightTicks = (rightTicks / Math.pow(10, countDigits(rightTicks) - 1)) / 0.5;
        }

        var isBand = false;
        for (var i = 0; i < 1; i++) {
            for (var l = 0; l < arrOfColumns[i].length; l++) {
                if (isNaN(parseInt(arrOfColumns[i][l])) || arrOfColumns[i][l].includes(':')) {
                    isBand = true;
                    break;
                }
            }
        }
        renderAxes(data,
            isBand ? xScaleBand(arrOfColumns[0]) : xScale(0, length, 1),
            yScale(axisLeftMin, axisLeftMax),
            yScale(axisRightMin, axisRightMax),
            leftTicks, rightTicks,
            isBand,
            isDate);

        //Render all columns
        for (var i = 1; i < arrOfColumns.length; i++) {
            d3.select(svgContainer).node().select('.tooltip_text')
                .append('span')
                .attr('name', 'span_' + (i - 1))
                .attr('class', 'text_for_node')
                .style('display', 'block');
            var yScaleLeftOrRight =
                !rightAxis || leftArr[i] ? yScale(axisLeftMin, axisLeftMax) : yScale(axisRightMin, axisRightMax);
            //renderChart params:
            //array, yScale(array), xScale, colour for mouseover event, line/bar colour, withArea, isRectangle)
            renderChart(
                arrOfColumns[i],
                arrOfNames[i],
                yScaleLeftOrRight,
                xScale(0, length),
                arrOfColors[i],
                arrArea[i],
                arrRectangle[i],
                arrOfLines.length == 0 ? true : arrOfLines[i],
                dashedLine.length == 0 ? false : dashedLine[i],
                i - 1,
                isBand)
        }
        renderThings(xScale(0, length), data, isBand, arrOfColumns[0]);
    }

    mainFunction();
}
