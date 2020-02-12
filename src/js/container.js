import * as d3 from 'd3';
import _ from 'lodash';

import Level from './level';
import {gColors, gLayout, l, llv, lbl} from './layout';
import {globalScales, scales} from './scale';
import {dataMapping} from './dataMapping';

// For debugging
window.globalColors = gColors;
window.gLayout = gLayout;
window.l = l;
window.llv = llv;
window.getElLayout = gLayout.getElLayout;
window.lbl = lbl;
window.scales = scales;

function Container() {
	let data = [];  // data
	let levels = [];


	function _container(svg) {
		const [ rawData, LVData, instances ] = data;

		const gContainer1 = svg.append('g')
			.attr('class', 'container1');

		const LV = Level();

		gContainer1.call(
			LV
			.data([
          rawData,
          LVData,
          instances
        ])
		);

		// Render the edges between levels
		const LVs = d3.selectAll('.g_level')
		LVs.each(function(LVData, LVId) {
			const LV = d3.select(this);
			LVData.cls.forEach(function(CLData, CLId) {
				// pairwise edges 
			});
		});

		// // Render the levels given clustering result
		// fetch('/dataset/hClusteringForAllLVs/', {
		// 	method: 'post',
		// 	body: JSON.stringify({
		// 		data: LVData
		// 	})
		// })
		// .then((response) => {
		// 	return response.json();
		// })
		// .then((response) => {
		// 	const clResults = response;
		// 	const LV = Level();

		// 	console.log('clResults: ', clResults)
		// 	LVData.forEach((lvData, LVIdx) => {
		// 		const cls = lvData.cls;
		// 		clResults[LVIdx].forEach((cl, clIdx) => {
		// 			cls[clIdx].instances = cl;
		// 		})
		// 		lvData.clScales = scales.calculateScalesForCls(rawData, cls, llv.w);
		// 	})

			
		// });

		// // Render the edges between levels
		// const LVs = d3.selectAll('.g_level')
		// LVs.each(function(LVData, LVId) {
		// 	const LV = d3.select(this);
		// 	LVData.cls.forEach(function(CLData, CLId) {
		// 		// pairwise edges 
		// 	});
		// });
	}
	
	_container.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _container;
	}

	return _container;
}

export default Container;