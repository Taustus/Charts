export function createMap({
    data_p = undefined,
    weekNum = -1,
    yearNum = -1
    } = {} ) {
    var width = 960,
        height = 500;

    ///>
    //<asp: ControlParameter ControlID="Calendar2" PropertyName="SelectedDate" DefaultValue="1970-01-01" Name="DateEnd">
    // Setting color domains(intervals of values) for our map

    var ext_color_domain = [0, 50, 150, 350]
    var legend_labels = ["SUPER", "OK", "NOK", "UPS"]
    var colors = ["#30d5c7", "green", "#ffba00", "red"];

    var div = d3.select("#MapArea").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("#MapArea").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin", "10px auto");

    var projection = d3.geo.albers()
        .rotate([-105, 0])
        .center([-10, 65])
        .parallels([52, 64])
        .scale(700)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);

    //Reading map file and data
    var data = d3.csv.parse(data_p);

    queue()
        .defer(d3.json, "https://raw.githubusercontent.com/KoGor/Maps.GeoInfo/master/russia_1e-7sr.json")
        .await(ready);

    //Start of Choropleth drawing

    function ready(error, map) {
        var rateById = {};
        var nameById = {};
        var scales = {};

        data.forEach(function (d) {
            rateById[d.regioncode] = +d.value;
            nameById[d.regioncode] = d.regionname;
            scales[d.regioncode] = d3.scale.threshold()
                .domain([d.low, d.medium, d.high])
                .range(colors);
        });
        //Московская область = Москва
        rateById['RU-MOS'] = rateById['RU-MOW'];
        nameById['RU-MOS'] = nameById['RU-MOW'];
        scales['RU-MOS'] = scales['RU-MOW'];
        //Ленинградская область = Санкт-Петербург
        rateById['RU-LEN'] = rateById['RU-SPE'];
        nameById['RU-LEN'] = nameById['RU-SPE'];
        scales['RU-LEN'] = scales['RU-SPE'];
        //Республика Адыгея = Краснодар
        rateById['RU-AD'] = rateById['RU-KDA'];
        nameById['RU-AD'] = nameById['RU-KDA'];
        scales['RU-AD'] = scales['RU-KDA'];
        //Ненецкий автономный округ = Сургут
        rateById['RU-NEN'] = rateById['RU-KHM'];
        nameById['RU-NEN'] = nameById['RU-KHM'];
        scales['RU-NEN'] = scales['RU-KHM'];
        //Ямало-Ненецкий автономный округ = Сургут
        rateById['RU-YAN'] = rateById['RU-KHM'];
        nameById['RU-YAN'] = nameById['RU-KHM'];
        scales['RU-YAN'] = scales['RU-KHM'];
        //Алтайский край = Барнаул
        rateById['RU-ALT'] = rateById['RU-AL'];
        nameById['RU-ALT'] = nameById['RU-AL'];
        scales['RU-ALT'] = scales['RU-AL'];
        //Алтайский край = Барнаул
        rateById['RU-TY'] = rateById['RU-KYA'];
        nameById['RU-TY'] = nameById['RU-KYA'];
        scales['RU-TY'] = scales['RU-KYA'];
        //Еврейская автономная область = Хабаровск
        rateById['RU-YEV'] = rateById['RU-KHA'];
        nameById['RU-YEV'] = nameById['RU-KHA'];
        scales['RU-YEV'] = scales['RU-KHA'];
        //Чеченская Республика и Республика Ингушетия = Грозный
        rateById['RU-CE & RU-IN'] = rateById['RU-CE'];
        nameById['RU-CE & RU-IN'] = nameById['RU-CE'];
        scales['RU-CE & RU-IN'] = scales['RU-CE'];
        //Drawing Choropleth
        var obj = topojson.object(map, map.objects.russia).geometries;
        svg.append("g")
            .attr("class", "region")
            .selectAll("path")
            .data(obj)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d) {
                if (scales[d.properties.region] == undefined)
                    return 'black';
                return scales[d.properties.region](rateById[d.properties.region]);
            })
            .style("opacity", 0.8)

            //Adding mouseevents
            .on("mouseover", function (d) {
                d3.select(this).transition().duration(300).style("opacity", 1);
                div.transition().duration(300)
                    .style("opacity", 1)
                div.text(nameById[d.properties.region] + " : " + rateById[d.properties.region])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition().duration(300)
                    .style("opacity", 0.8);
                div.transition().duration(300)
                    .style("opacity", 0);
            })

        // Adding cities on the map

        d3.tsv("./FilesForCharts/cities.tsv", function (error, data) {
            console.log(data);
            var city = svg.selectAll("g.city")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "city")
                .attr("transform", function (d) { return "translate(" + projection([d.lon, d.lat]) + ")"; });

            city.append("circle")
                .attr("r", 3)
                .style("fill", "lime")
                .style("opacity", 0.75);

            city.append("text")
                .attr("x", 5)
                .text(function (d) { return d.City; });
        });

    }; // <-- End of Choropleth drawing

    //Adding legend for our Choropleth

    var legend = svg.selectAll("g.legend")
        .data(ext_color_domain)
        .enter().append("g")
        .attr("class", "legend");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
        .attr("x", 20)
        .attr("y", function (d, i) { return height - (i * ls_h) - 2 * ls_h; })
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function (d, i) {
            return colors[i];
        })
        .style("opacity", 0.8);

    legend.append("text")
        .attr("x", 50)
        .attr("y", function (d, i) { return height - (i * ls_h) - ls_h - 4; })
        .text(function (d, i) { return legend_labels[i]; });

}
