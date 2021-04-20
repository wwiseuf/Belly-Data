var samplesJson = "data/samples.json"

//dropdown menu
var idSelectDropDown = d3.select("#selDataset");
//demographics table 
var demographTable = d3.select("#sample-metadata");
//barchart
var barChargraphing = d3.select("#bar"); 
//bubblechart
var bubbleChartgraphing = d3.select("#bubble"); 


function init() {
	
	d3.json(samplesJson).then(data => {
		
		data.names.forEach(name => {
			
			var option = idSelectDropDown.append("option");
			option.text(name);
		
		}); 
     

	 var inDeezId = idSelectDropDown.property("value")
	 plotCharts(inDeezId); 
  
	}); 
  } 

  function plotCharts(id) {
	  
	//clear html to prevent multiple IDs showing on top of each other
	clearHtml(); 
  
	//this builds the demograph info table
	d3.json(samplesJson).then(data => {
		
		var indivMetaData = data.metadata.filter(participant => participant.id == id)[0];
		
		Object.entries(indivMetaData).forEach(([key, value]) => {
			
			var demographlist = demographTable.append("ul")
				.attr("class","list-group");
			
			var listItemized = demographlist.append("li")
			
				.attr("style", "list-style-type: none");
			
			listItemized.text(`${key}: ${value}`);
		
		});
  
	  //filter the samples.json file for the drop down selection
	  var SampleSpecimen = data.samples.filter(sample => sample.id == id)[0];
	  
	  //values for trace (x axis)
	  var sampleSpecimenValues = []
	  
		sampleSpecimenValues.push(SampleSpecimen.sample_values);
		
		var top1OSpecimen = sampleSpecimenValues[0].slice(0, 10).reverse();
	  
	  //values for trace (y axis)
	  var otuIDs = []
	  
		otuIDs.push(SampleSpecimen.otu_ids);
		
		var top1OID = otuIDs[0].slice(0, 10).reverse();	
  
	  //values for hover labels
	  var otuLabeling = []
	  
		otuLabeling.push(SampleSpecimen.otu_labels);
		
		var top1OSpecLabels = otuLabeling[0].slice(0, 10).reverse();

//*****************************************************/
		// Raising the Bar with Bar chart 
//****************************************************/

var barTrace = {
	x: top1OSpecimen,
	y: top1OID.map(otu => `OTU ${otu}`),
	type: "bar",
//left right bars in leiu of up down
	orientation: "h",

	text: top1OSpecLabels 
  }; 

  var layout = {
	height: 650,
	width: 450
  }

  var barData = [barTrace];

  Plotly.newPlot("bar",barData, layout);

  //*****************************************************/
  //       Bubbling up with a Bubble Chart
  //****************************************************/
  var bubbleTrace = {
	x: otuIDs[0],
	y: sampleSpecimenValues[0],
	
	text: otuLabeling[0], 
	
	mode: 'markers',
	  marker: {
		size: sampleSpecimenValues[0],
		color: otuIDs[0] 
	  }
  }; 

  var layout = {
	xaxis: {
	  title: "OTU ID",
	  autotick: false,
	  dtick: "500"
	},
	showlegend: false,
	height: 600,
	width: 1200
  };

  var bubbleData = [bubbleTrace];

  Plotly.newPlot("bubble",bubbleData, layout);

 
  //****************************************************/
  //        Arming for the Gauge Chart
  //****************************************************/
  
  var wfreq = indivMetadata.wfreq;

  if (wfreq == null) {
	wfreq = 0;
  }

  // create an indicator trace for the gauge chart
  var traceGauge = {
	  // domain:
	  value: wfreq,
	  type: "indicator",
	  mode: "gauge",
	  gauge: {
		  axis: {
			  range: [0, 9],
			  tickmode: 'linear',
			  tickfont: {
				  size: 22
			  }
		  },

		   // making transparent
		  bar: { color: 'rgba(8,29,88,0)' },
		  steps: [
			  { range: [0, 1], color: 'rgb(243,244,224)' }, 
			  { range: [1, 2], color: 'rgb(238,240,218)' },
			  { range: [2, 3], color: 'rgb(228,230,201)' },
			  { range: [3, 4], color: 'rgb(238,243,186)' },
			  { range: [4, 5], color: 'rgb(220,238,184)' },
			  { range: [5, 6], color: 'rgb(192,209,156)' },
			  { range: [6, 7], color: 'rgb(169,215,156)' },
			  { range: [7, 8], color: 'rgb(144,188,149)' },
			  { range: [8, 9], color: 'rgb(108,156,114)' }
		  ]
	  }
  };

  // determine angle for each wfreq segment on the chart
  var angle = (wfreq / 9) * 180; 
  // calculate end points for triangle pointer path
  var degrees = 180 - angle,
	  radius = .75;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path to create needle shape
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
	  cX = String(x),
	  cY = String(y),
	  pathEnd = ' Z';
  var path = mainPath + cX + " " + cY + pathEnd;

  // create a trace to draw the circle where the needle is centered
  var needleCenter = {
	  x: [0],
	  y: [0],
	  marker: {
		size: 15,
		color: '850000'
	}
  };

  var dataGauge = [traceGauge, needleCenter];

  var layout = {
	  // draw the needle pointer shape using path defined above
	  shapes: [{
		  type: 'path',
		  path: path,
		  fillcolor: '850000',
		  line: {
			  color: '850000',
			  width: 7
		  }
	  }],
	  title: {
		  text: `<b>Belly Button Washing Frequency</b><br>Scrubs per Week`,
		  font: {
			  size: 20
		  },
	  },
	  height: 500,
	  width: 500,
	  xaxis: {
		  zeroline: false,
		  showticklabels: false,
		  showgrid: false,
		  range: [-1, 1],
		  fixedrange: true
	  },
	  yaxis: {
		  zeroline: false,
		  showticklabels: false,
		  showgrid: false,
		  range: [-0.5, 1.5],
		  fixedrange: true
	  }
  };

  Plotly.newPlot('gauge', dataGauge, layout);

}); 

} 

function clearHtml() {
demographTable.html("");
}

function optionChanged(id) {
plotCharts(id); 
}

init();
