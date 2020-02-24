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
		const numLVs = LVs.nodes().length;
		LVs.each(function(lvData, lvId) {
			const LV = d3.select(this);
			// Render the cluster bars (one set for first and last, two sets for middle)
			const BR = Bar();
			gContainer.call(
				BR
				.data(lvData)
			);
		});

		// Render the edges between clusters per level
		const BRs = gContainer.selectAll('.g_bars'); 
		LVs.each(function(lvData, lvId) {
			if (lvId < numLVs-1) {
				const gCurrLowerBars = d3.select('.g_bars_lower_lv_' + lvId),
					gNextUpperBars = d3.select('.g_bars_upper_lv_' + (lvId+1));

				const gBtnLVs = gContainer.append('g')
					.attr('class', 'g_btn_lvs')
					.attr('transform', 'translate(' + 
						l.wForLabel + 
						',' + 
						gLayout.getGlobalElLayout(gCurrLowerBars).y2 + 
						')');

				gLayout.renderClToClLines(gBtnLVs, instances, gCurrLowerBars, gNextUpperBars, llv.w)
			}
		});
	}
	
	_container.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _container;
	}

	return _container;
}

export default Container;