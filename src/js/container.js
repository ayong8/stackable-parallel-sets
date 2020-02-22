import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, gLayout, l, llv, lbl, lwbr, lbr} from './layout';
import {globalScales, scales} from './scale';
import {dataMapping} from './dataMapping';

import Level from './level';
import Bar from './bar';

// For debugging
window.globalColors = gColors;
window.gLayout = gLayout;
window.getElLayout = gLayout.getElLayout;
window.l = l;
window.llv = llv
window.lbl = lbl;
window.lwbr = lwbr;
window.scales = scales;
window.dataMapping = dataMapping;

function Container() {
	let data = [];  // data
	let levels = [];


	function _container(svg) {
		const [ rawData, LVData, instances ] = data;

		const gContainer = svg.append('g')
			.attr('class', 'container');

		const rectButton = gContainer.append('rect')
				.attr('x', 600)
				.attr('y', 0)
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', 'red')
				.on('click', function(d){
					LVData[0].mode = 'fold';
					console.log(LVData);
					renderLV(rawData,
						LVData,
						instances);
				})

		// Set up the within-level y-features
		// LVData.forEach((lvData) => {
		// 	lvData.features 
		// })
		// scales.yFeatureScale = 

		scales.calculateYLevelScale(LVData);  // calculate yLvsScale
		renderLV(rawData, LVData, instances);

		function renderLV(rawData, LVData, instances) {
			const LV = Level();

			gContainer.call(
				LV
				.data([
						rawData,
						LVData,
						instances
					])
			);
		}

		// Render the left auxilary layouts
		const gLeft = gContainer
			.append('g')
			.attr('class', 'g_left_aux_region')
			.attr('transform', 'translate(0,' + scales.yLvsScale(0) + ')');

		// Render the bars
		const LVs = d3.selectAll('.g_level');
		LVs.each(function(lvData, LVId) {
			const LV = d3.select(this);
			// Render the cluster bars (one set for first and last, two sets for middle)
			const BR = Bar();
			gContainer.call(
				BR
				.data(lvData)
			);
		});

		// Render the edges between clusters
		const BRs = gContainer.selectAll('.g_bars'); 
		BRs.each(function(brData, brId) {
			const gBRSet = d3.select(this),
						gBRSetClass = gBRSet.attr('class');
			// Select lower cluster sets only, to connect them down to upper cluster set in the next level
			if (gBRSetClass.indexOf('g_bars_lower') != -1) {
				const gBtnLVs = gContainer.append('g')
						.attr('class', 'g_btn_lvs')
						.attr('transform', 'translate(' + 
							l.wForLabel + 
							',' + 
							gLayout.getGlobalElLayout(gBRSet).y2 + 
							')');
				console.log('redundant: ', brData, BRs.data());
				gLayout.renderClToClLines(gBtnLVs, BRs, instances, brData, BRs.data()[brId+1], brId, llv.w)
			}
		})

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