let map;

let allDataLayer;
let monthLayers = [];
let dayLayers = [];
let hourLayers = [];

let currentSelection = "All Data";

let animate = false;

let showMarker = false;

monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
hourNames = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
hourFormalNames = ['12 am', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm'];

// graph boundaries
let width, height;
if (window.innerWidth<992) {
     width = vw(100);
     height = vh(30);
} else {
     width = vw(50);
     height = vh(40);
}
const margin = {top: 50, bottom: 50, right: 25, left:35};

// month graph
let color1 = '#379683';
let opacity1 = .75;
let fillColor1 =  color1;
let fillOpacity1 = 1;

// day graph
let color2 = '#ff761a';
let opacity2 = .5;
let fillColor2 = color2;
let fillOpacity2 = 1;

// hour graph
let color3 = '#156f90';
let opacity3 = .5;
let fillColor3 = color3;
let fillOpacity3 = 1;

// all data graph
let color4 = '#156f90';
let opacity4 = .5;
let fillColor4 = color4;
let fillOpacity4 = 1;

let markerColor = '#156f90';

let mapTitle = document.getElementById("mapTitle");

let monthButton = document.getElementById("showMonthData");
let monthSlider = document.getElementById("monthSlider");
let currentMonth = document.getElementById("currentMonth");

let dayButton = document.getElementById("showDayData");
let daySlider = document.getElementById("daySlider");
let currentDay = document.getElementById("currentDay");

let hourButton = document.getElementById("showHourData");
let hourSlider = document.getElementById("hourSlider");
let currentHour = document.getElementById("currentHour");

let allDataButton = document.getElementById("showAllData");
let toggleAnimationButton = document.getElementById("toggleAnimation");
let toggleMarker = document.getElementById("toggleMarker");

// generate top locations
allData.forEach((d, idx) => {
     allData[idx].index = idx;
})
sortedData = allData.slice();
sortedData.sort(function(a,b) {
     return b.numRides - a.numRides;
 });
sortedData = sortedData.slice(0, 50);
topLocations = [];
sortedData.forEach((d, idx) => {
     topLocations.push({name: `(${d.lat.toFixed(4)}, ${d.lon.toFixed(4)})`, numRides: d.numRides, lat: d.lat, lon: d.lon, index: d.index})
});

// // generate map
// mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmxhenoxNiIsImEiOiJja2h3amxyeWQxZHl6MzRtYWxsc3piYXU4In0.aA9LP2eD-hObaNyjmrgvWA';
// // mapboxgl.accessToken = process.env.MAPBOXGL_KEY;
// map = new mapboxgl.Map({
//      container: 'map',
//      style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
//      // style: 'mapbox://styles/ryanlazz16/ckhx06buc05ih19qjcwv7zp5k',
//      center: [-73.975, 40.75], // starting position [lng, lat]
//      zoom: 11.25, // starting zoom
//      pitch: 15
// });

let xhr = new XMLHttpRequest;
xhr.open("GET","key");
xhr.addEventListener("load", function() {
     if (xhr.status == 200) {  // success
          // generate map
          mapboxgl.accessToken = JSON.parse(xhr.responseText);
          map = new mapboxgl.Map({
               container: 'map',
               style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
               // style: 'mapbox://styles/ryanlazz16/ckhx06buc05ih19qjcwv7zp5k',
               center: [-73.975, 40.75], // starting position [lng, lat]
               zoom: 11.25, // starting zoom
               pitch: 15
          });

          // wait for map to be ready and show allData layer
          map.on('load', () => {
               showBuildings();

               map.addLayer(allDataLayer);
          });

          map.on('click', (e) => {
               clearMarker();
          
               closestDistance = 1000;
               closestIndex = 0;
               allData.forEach((d, idx) => {
                    let dist = Math.sqrt(Math.pow(e.lngLat.lat-d.lat, 2)+Math.pow(e.lngLat.lng-d.lon, 2))
                    if (dist<closestDistance) {
                         closestIndex = idx;
                         closestDistance = dist;
                    }
               });
          
               pointData = allData[closestIndex];
          
               setMarker(pointData);
          
               genPointDataCreateGraphs(pointData);
          });

          // display initial graphs
          let pointData = allData[125250];
          setMarker(pointData);
          createAllDataGraph(topLocations);
     } else { // failure
          console.log(`Bad ${xhr.responseText}`);
     }
});
xhr.send();

// generate layer for all data
allDataLayer = new deck.MapboxLayer({
     id: "allData",
     type: deck.HeatmapLayer,
     data: allData,
     getPosition: d => [d.lon, d.lat],
     getWeight: d => d.numRides,
     radiusPixels: 40,
     threshold: 0.05,
});

monthNames.forEach(month => {
     monthLayers.push(new deck.MapboxLayer({
          id: month,
          type: deck.HeatmapLayer,
          data: allData,
          getPosition: d => [d.lon, d.lat],
          getWeight: d => d[month],
          radiusPixels: 40,
          threshold: 0.05,
     }));
});

dayOfWeekNames.forEach(day => {
     dayLayers.push(new deck.MapboxLayer({
          id: day,
          type: deck.HeatmapLayer,
          data: allData,
          getPosition: d => [d.lon, d.lat],
          getWeight: d => d[day],
          radiusPixels: 40,
          threshold: 0.05,
     }));
});

hourNames.forEach(hour => {
     hourLayers.push(new deck.MapboxLayer({
          id: 'Hour'+hour,
          type: deck.HeatmapLayer,
          data: allData,
          getPosition: d => [d.lon, d.lat],
          getWeight: d => d['Hour'+hour],
          radiusPixels: 40,
          threshold: 0.05,
     }));
});

function showBuildings() {
     var layers = map.getStyle().layers;
 
     var labelLayerId;
     for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
               labelLayerId = layers[i].id;
               break;
          }
     }
     
     map.addLayer(
          {
               'id': '3d-buildings',
               'source': 'composite',
               'source-layer': 'building',
               'filter': ['==', 'extrude', 'true'],
               'type': 'fill-extrusion',
               'minzoom': 13,
               'paint': {
                    'fill-extrusion-color': '#aaa',
                    
                    // use an 'interpolate' expression to add a smooth transition effect to the
                    // buildings as the user zooms in
                    'fill-extrusion-height': [
                         'interpolate',
                         ['linear'],
                         ['zoom'],
                         15,
                         0,
                         15.05,
                         ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                         'interpolate',
                         ['linear'],
                         ['zoom'],
                         15,
                         0,
                         15.05,
                         ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
               }
          },
          labelLayerId
     );
}

// // wait for map to be ready and show allData layer
// map.on('load', () => {
//      showBuildings();

//      map.addLayer(allDataLayer);
// });

function resetAll() {
     monthButton.classList.add('btn-primary');
     dayButton.classList.add('btn-primary');
     hourButton.classList.add('btn-primary');
     allDataButton.classList.add('btn-primary');
     monthButton.classList.remove('btn-success');
     dayButton.classList.remove('btn-success');
     hourButton.classList.remove('btn-success');
     allDataButton.classList.remove('btn-success');

     if (map.getLayer("allData"))
          map.removeLayer("allData");
          
     for (i = 0; i<monthNames.length; i++) {
          if (map.getLayer(monthNames[i]))
               map.removeLayer(monthNames[i])
     }
          
     for (i = 0; i<dayOfWeekNames.length; i++) {
          if (map.getLayer(dayOfWeekNames[i]))
               map.removeLayer(dayOfWeekNames[i])
     }
          
     for (i = 0; i<hourNames.length; i++) {
          if (map.getLayer('Hour'+hourNames[i]))
               map.removeLayer('Hour'+hourNames[i]);
     }

     monthSlider.value = 0;
     currentMonth.innerText = monthNames[0];
     daySlider.value = 0;
     currentDay.innerText = dayOfWeekNames[0];
     hourSlider.value = 0;
     currentHour.innerText = hourFormalNames[0];
}

var intervalID = window.setInterval(animateMap, 500);

function setMapToMonth(index) {
     resetAll();
     monthButton.classList.remove('btn-primary');
     monthButton.classList.add('btn-success');
     currentSelection = "Month";
     map.addLayer(monthLayers[index]);
     monthSlider.value = index;
     currentMonth.innerText = monthNames[index];
     mapTitle.innerText = "Uber Pickups by Month";
}

function setMapToDay(index) {
     resetAll();
     dayButton.classList.remove('btn-primary');
     dayButton.classList.add('btn-success');
     currentSelection = "Day";
     map.addLayer(dayLayers[index]);
     daySlider.value = index;
     currentDay.innerText = dayOfWeekNames[index];
     mapTitle.innerText = "Uber Pickups by Day";
}

function setMapToHour(index) {
     resetAll();
     hourButton.classList.remove('btn-primary');
     hourButton.classList.add('btn-success');
     currentSelection = "Hour";
     map.addLayer(hourLayers[index]);
     hourSlider.value = index;
     currentHour.innerText = hourFormalNames[index];
     mapTitle.innerText = "Uber Pickups by Hour";
}

function animateMap() {
     if (animate) {
          if (currentSelection=="Month") {
               let val = parseInt(monthSlider.value);
               val = val==monthNames.length-1?0:val+1
               setMapToMonth(val);
          }
          else if (currentSelection=="Day") {
               let val = parseInt(daySlider.value);
               val = val==dayOfWeekNames.length-1?0:val+1
               setMapToDay(val);
          }
          else if (currentSelection=="Hour") {
               let val = parseInt(hourSlider.value);
               val = val==hourNames.length-1?0:val+1
               setMapToHour(val);
          }
     }
}

monthButton.addEventListener('click', () => {
     animate = false;
     setMapToMonth(0);
});

monthSlider.oninput = function() {
     animate = false;
     let val = parseInt(monthSlider.value);
     setMapToMonth(val);
};

dayButton.addEventListener('click', () => {
     animate = false;
     setMapToDay(0);
});

daySlider.oninput = function() {
     animate = false;
     let val = parseInt(daySlider.value);
     setMapToDay(val);
};

hourButton.addEventListener('click', () => {
     animate = false;
     setMapToHour(0);
});

hourSlider.oninput = function() {
     animate = false;
     let val = parseInt(hourSlider.value);
     setMapToHour(val);
};

allDataButton.addEventListener('click', () => {
     animate = false;
     resetAll();
     allDataButton.classList.remove('btn-primary');
     allDataButton.classList.add('btn-success');
     currentSelection = "All Data";
     mapTitle.innerText = "All Uber Pickups";
     map.addLayer(allDataLayer);
     createAllDataGraph(topLocations);
     flyTo(-73.975, 40.75, 11.25);
});

toggleAnimationButton.addEventListener('click', () => {
     if (currentSelection!="All Data")
          animate = !animate;
});

let marker;
let monthFrequencies = [];
let dayFreqs = [];
let hourFreqs = [];

function genPointDataCreateGraphs(pd) {
     pointData = pd;
     flyTo(pd.lon, pd.lat, 12.25);
     initPointData();
     createMonthGraph(monthFreqs);
     createDayGraph(dayFreqs);
     createHourGraph(hourFreqs);
}

function initPointData() {
     monthFreqs = [];
     monthNames.forEach(month => {
          monthFreqs.push({name: month, numRides: pointData[month], lat: pointData.lat, lon: pointData.lon})
     });

     dayFreqs = [];
     dayOfWeekNames.forEach(day => {
          dayFreqs.push({name: day, numRides: pointData[day], lat: pointData.lat, lon: pointData.lon})
     });

     hourFreqs = [];
     hourNames.forEach((hour, idx) => {
          hourFreqs.push({name: hourFormalNames[idx], numRides: pointData['Hour'+hour], lat: pointData.lat, lon: pointData.lon})
     });
}

function getMaxRides(data) {
     let maxRides = 1;
     data.forEach(d => {
          if (d.numRides>maxRides)
               maxRides = d.numRides;
     });
     return maxRides;
}

function clearMarker() {
     showMarker = false;
     if (marker!=undefined)
          marker.remove()
}

function setMarker(pointData) {
     showMarker = true;
     marker = new mapboxgl.Marker({ "color": markerColor })
          .setLngLat([pointData.lon, pointData.lat])
          .addTo(map);
}

toggleMarker.addEventListener('click', () => {
     if (!showMarker)
          setMarker(pointData);
     else
          clearMarker();
})

function flyTo(lon, lat, zoom) {
     map.flyTo({
          // These options control the ending camera position: centered at
          // the target, at zoom level 9, and north up.
          center: [lon, lat],
          zoom: zoom,
          bearing: 0,
           
          // These options control the flight curve, making it move
          // slowly and zoom out almost completely before starting
          // to pan.
          speed: 0.6, // make the flying slow
          curve: 1, // change the speed at which it zooms out
           
          // This can be any easing function: it takes a number between
          // 0 and 1 and returns another number between 0 and 1.
          easing: function (t) {
               return t;
          },
           
          // this animation is considered essential with respect to prefers-reduced-motion
          essential: true
     });
}

// map.on('click', (e) => {
//      clearMarker();

//      closestDistance = 1000;
//      closestIndex = 0;
//      allData.forEach((d, idx) => {
//           let dist = Math.sqrt(Math.pow(e.lngLat.lat-d.lat, 2)+Math.pow(e.lngLat.lng-d.lon, 2))
//           if (dist<closestDistance) {
//                closestIndex = idx;
//                closestDistance = dist;
//           }
//      });

//      pointData = allData[closestIndex];

//      setMarker(pointData);

//      genPointDataCreateGraphs(pointData);
// })


// d3 implementation

function vh(v) {
     var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
     return (v * h) / 100;
}

function vw(v) {
     var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
     return (v * w) / 100;
}

function vmin(v) {
     return Math.min(vh(v), vw(v));
}

function vmax(v) {
     return Math.max(vh(v), vw(v));
}

function createMonthGraph(data) {
     document.getElementById('graph1').innerHTML = "";

     const svg = d3.select('#graph1')
          .append('svg')
          .attr('height', height-margin.top-margin.bottom)
          .attr('width', width-margin.left-margin.right)
          .attr('viewBox', [0, 0, width, height]);

     const x = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([margin.left, width-margin.right])
          .padding(0.1);

     const y = d3.scaleLinear()
          .domain([0, getMaxRides(data)])
          .range([height-margin.bottom, margin.top]);

     var tooltip = d3.select("#tooltip");

     var mouseover = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip text 
          d3.select("#tooltip").select("p")
          .text(d.name+": " +parseInt(d.numRides)+" Rides")

          // Update the tooltip position
          d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")

          // Show the tooltip
          d3.select("#tooltip").classed("hidden", false);

          d3.select(this).attr('fill', fillColor1).attr('opacity', fillOpacity1);
     }

     var mousemove = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip position
          d3.select("#tooltip")
               .style("left", xPosition + "px")
               .style("top", yPosition + "px")
     }

     var mouseleave = function(d) {
          // Hide tooltip
          d3.select("#tooltip").classed("hidden", true);
          d3.select(this).attr('fill', color1).attr('opacity', opacity1);
     }

     svg.append('g')
          .selectAll('rect')
          .data(data)
          .join('rect')
               .attr('fill', color1)
               .attr('opacity', opacity1)
               .attr('x', (d, idx)=> x(idx))
               .attr('y', (d) => y(d.numRides))
               .attr('height', d => y(0)-y(d.numRides))
               .attr('width', x.bandwidth())
               .on('mouseover', mouseover)
               .on('mousemove', mousemove)
               .on('mouseleave', mouseleave)
               .on('click', (d, idx) => {
                    animate = false;
                    setMapToMonth(idx);
               });

     function xAxis(g) {
          g.attr('transform', `translate(0, ${height-margin.bottom})`)
               .call(d3.axisBottom(x).tickFormat(i => data[i].name.slice(0, 3)))
               .attr('font-size', '20px');
     }

     function yAxis(g) {
          g.attr('transform', `translate(${margin.left}, 0)`)
               .call(d3.axisLeft(y).ticks(null, data.format))
               .attr('font-size', '20px')
     }

     svg.append("text")
     .attr("x", width / 2 )
     .attr("y", margin.top/2)
     .style("text-anchor", "middle")
     .attr('font-size', '20px')
     .text(`Month vs. Rides for Coordinate (${data[0].lat.toFixed(4)}, ${data[0].lon.toFixed(4)})`);

     svg.append('g').call(xAxis)
     svg.append('g').call(yAxis)
     svg.node();
}

function createDayGraph(data) {
     document.getElementById('graph2').innerHTML = "";

     const svg = d3.select('#graph2')
          .append('svg')
          .attr('height', height-margin.top-margin.bottom)
          .attr('width', width-margin.left-margin.right)
          .attr('viewBox', [0, 0, width, height]);

     const x = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([margin.left, width-margin.right])
          .padding(0.1);

     const y = d3.scaleLinear()
          .domain([0, getMaxRides(data)])
          .range([height-margin.bottom, margin.top]);

     var tooltip = d3.select("#tooltip");

     var mouseover = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip text 
          d3.select("#tooltip").select("p")
          .text(d.name+": " +parseInt(d.numRides)+" Rides")

          // Update the tooltip position
          d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")

          // Show the tooltip
          d3.select("#tooltip").classed("hidden", false);

          d3.select(this).attr('fill', fillColor2).attr('opacity', fillOpacity2);
     }

     var mousemove = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip position
          d3.select("#tooltip")
               .style("left", xPosition + "px")
               .style("top", yPosition + "px")
     }

     var mouseleave = function(d) {
          // Hide tooltip
          d3.select("#tooltip").classed("hidden", true);

          d3.select(this).attr('fill', color2).attr('opacity', opacity2);
     }

     svg.append('g')
          .selectAll('rect')
          .data(data)
          .join('rect')
               .attr('fill', color2)
               .attr('opacity', opacity2)
               .attr('x', (d, idx)=> x(idx))
               .attr('y', (d) => y(d.numRides))
               .attr('height', d => y(0)-y(d.numRides))
               .attr('width', x.bandwidth())
               .on('mouseover', mouseover)
               .on('mousemove', mousemove)
               .on('mouseleave', mouseleave)
               .on('click', (d, idx) => {
                    animate = false;
                    setMapToDay(idx);
               });

     function xAxis(g) {
          g.attr('transform', `translate(0, ${height-margin.bottom})`)
               .call(d3.axisBottom(x).tickFormat(i => data[i].name.slice(0, 3)))
               .attr('font-size', '20px');
     }

     function yAxis(g) {
          g.attr('transform', `translate(${margin.left}, 0)`)
               .call(d3.axisLeft(y).ticks(null, data.format))
               .attr('font-size', '20px')
     }

     svg.append("text")
     .attr("x", width / 2 )
     .attr("y", margin.top/2)
     .style("text-anchor", "middle")
     .attr('font-size', '20px')
     .text(`Day vs. Rides for Coordinate (${data[0].lat.toFixed(4)}, ${data[0].lon.toFixed(4)})`);

     svg.append('g').call(xAxis)
     svg.append('g').call(yAxis)
     svg.node();
}

function createHourGraph(data) {
     document.getElementById('graph3').innerHTML = "";

     const svg = d3.select('#graph3')
          .append('svg')
          .attr('height', height-margin.top-margin.bottom)
          .attr('width', width-margin.left-margin.right)
          .attr('viewBox', [0, 0, width, height]);

     const x = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([margin.left, width-margin.right])
          .padding(0.1);

     const y = d3.scaleLinear()
          .domain([0, getMaxRides(data)])
          .range([height-margin.bottom, margin.top]);

     var tooltip = d3.select("#tooltip");

     var mouseover = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip text 
          d3.select("#tooltip").select("p")
          .text(d.name+": " +parseInt(d.numRides)+" Rides")

          // Update the tooltip position
          d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")

          // Show the tooltip
          d3.select("#tooltip").classed("hidden", false);

          d3.select(this).attr('fill', fillColor3).attr('opacity', fillOpacity3);
     }

     var mousemove = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip position
          d3.select("#tooltip")
               .style("left", xPosition + "px")
               .style("top", yPosition + "px")
     }

     var mouseleave = function(d) {
          // Hide tooltip
          d3.select("#tooltip").classed("hidden", true);

          d3.select(this).attr('fill', color3).attr('opacity', opacity3);
     }

     svg.append('g')
          .selectAll('rect')
          .data(data)
          .join('rect')
               .attr('fill', color3)
               .attr('opacity', opacity3)
               .attr('x', (d, idx)=> x(idx))
               .attr('y', (d) => y(d.numRides))
               .attr('height', d => y(0)-y(d.numRides))
               .attr('width', x.bandwidth())
               .on('mouseover', mouseover)
               .on('mousemove', mousemove)
               .on('mouseleave', mouseleave)
               .on('click', (d, idx) => {
                    animate = false;
                    setMapToHour(idx);
               });

     function xAxis(g) {
          g.attr('transform', `translate(0, ${height-margin.bottom})`)
               .call(d3.axisBottom(x).tickFormat(i => data[i].name.slice(0, data[i].name.indexOf(" "))))
               .attr('font-size', '20px');
     }

     function yAxis(g) {
          g.attr('transform', `translate(${margin.left}, 0)`)
               .call(d3.axisLeft(y).ticks(null, data.format))
               .attr('font-size', '20px')
     }

     svg.append("text")
     .attr("x", width / 2 )
     .attr("y", margin.top/2)
     .style("text-anchor", "middle")
     .attr('font-size', '20px')
     .text(`Hour vs. Rides for Coordinate (${data[0].lat.toFixed(4)}, ${data[0].lon.toFixed(4)})`);

     svg.append('g').call(xAxis)
     svg.append('g').call(yAxis)
     svg.node();
}

function createAllDataGraph(data) {
     clearMarker();

     document.getElementById('graph1').innerHTML = "";
     document.getElementById('graph2').innerHTML = "";
     document.getElementById('graph3').innerHTML = "";

     let height = vh(100)

     const svg = d3.select('#graph1')
          .append('svg')
          .attr('height', height-margin.top-margin.bottom)
          .attr('width', width-margin.left-margin.right)
          .attr('viewBox', [0, 0, width, height]);

     const y = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([margin.top, height-margin.bottom])
          .padding(0.1);

     const x = d3.scaleLinear()
          .domain([0, getMaxRides(data)])
          .range([margin.left, width-margin.right]);

     var tooltip = d3.select("#tooltip");

     var mouseover = function(d, i) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip text 
          d3.select("#tooltip").select("p")
               .text("#"+(i+1)+" "+d.name+": "+parseInt(d.numRides)+" Rides")

          // Update the tooltip position
          d3.select("#tooltip")
               .style("left", xPosition + "px")
               .style("top", yPosition + "px")

          // Show the tooltip
          d3.select("#tooltip").classed("hidden", false);

          d3.select(this).attr('fill', fillColor4).attr('opacity', fillOpacity4);

          clearMarker();
          setMarker(d);
     }

     var mousemove = function(d) {
          var xPosition = d3.event.pageX;
          var yPosition = d3.event.pageY;

          // Update the tooltip position
          d3.select("#tooltip")
               .style("left", xPosition + "px")
               .style("top", yPosition + "px")
     }

     var mouseleave = function(d) {
          // Hide tooltip
          d3.select("#tooltip").classed("hidden", true);

          d3.select(this).attr('fill', color4).attr('opacity', opacity4);
          clearMarker();
     }

     svg.append('g')
          .selectAll('rect')
          .data(data)
          .join('rect')
               .attr('fill', color4)
               .attr('opacity', opacity4)
               .attr('x', (d) => x(0))
               .attr('y', (d, idx)=> y(idx))
               .attr('height', y.bandwidth())
               .attr('width', d => x(d.numRides))
               .on('mouseover', mouseover)
               .on('mousemove', mousemove)
               .on('mouseleave', mouseleave)
               .on('click', (d, idx) => {
                    d3.select("#tooltip").classed("hidden", true);
                    animate = false;
                    genPointDataCreateGraphs(allData[d.index]);
               });

     svg.selectAll(".text")        
          .data(data)
          .enter()
          .append("text")
          .attr("class","label")
          .attr("class", "bar-text")
          .attr("x", function(d) { return margin.left+x(d.numRides)-5; }  )
          .attr("y", function(d, i) { return y(i); })
          .style("text-anchor", "end")
          .style("dominant-baseline", "middle")
          .attr("dy", y.bandwidth()/2+1 + "px")
          .attr('font-size', '14px') 
          .text(function(d) { return d.numRides; });   

     function xAxis(g) {
          g.attr('transform', `translate(0, ${height-margin.bottom})`)
               .call(d3.axisBottom(x).tickFormat(i => i))
               .attr('font-size', '20px');
     }

     function yAxis(g) {
          g.attr('transform', `translate(${margin.left}, 0)`)
               // .call(d3.axisLeft(y).ticks(null, data.format))
               .call(d3.axisLeft(y).tickFormat(i => i+1))
               .attr('font-size', '20px')
     }

     svg.append("text")
     .attr("x", width / 2 )
     .attr("y", margin.top/2)
     .style("text-anchor", "middle")
     .attr('font-size', '20px')
     .text(`Locations with Highest Number of Rides`);

     svg.append('g').call(xAxis)
     svg.append('g').call(yAxis)
     svg.node();
}

// // display initial graphs
// let pointData = allData[125250];
// setMarker(pointData);
// createAllDataGraph(topLocations);