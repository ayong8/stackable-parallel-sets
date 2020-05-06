import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, gLayout, l, llv, lbl, lBtn, lwbr, lbr} from './layout';
import {globalScales, scales} from './scale';
import {data} from './data';

import Level from './level';
import Bar from './bar';
import BarTreemap from './bar-treemap';

// For debugging
window.globalColors = gColors;
window.gLayout = gLayout;
window.getElLayout = gLayout.getElLayout;
window.l = l;
window.llv = llv
window.lbl = lbl;
window.lBtn = lBtn;
window.lwbr = lwbr;
window.scales = scales;
window.data = data;

function Container() {
	let data = [];  // data
	let levels = [];


	function _container(svg) {
		const [ rawData, LVData, instances ] = data;

		l.setContainerBoundingClientRect(gContainer);
		const gContainer = svg.append('g')
			.attr('class', 'container')
			.attr('transform', 'translate(' + l.container.local.p.l + ',' + l.container.local.p.t + ')');
		
		
		// renderInterface();

		scales.calculateYLevelScale(LVData);  // calculate yLvsScale
		LVData.forEach(function(lvData){	// after calculate the yLvsScale, store the level height information
			lvData.mode.height = scales.yLvsScale(lvData.idx+1) - scales.yLvsScale(lvData.idx) - lBtn.h;
		});
		scales.calculatecolorClOnSelectScale('--bar-fill-selected');
		scales.calculateColorCatOnSelectScale('--block-fill-selected');
		scales.calculateColorClOnSelectTwoGroupsScale('--bar-fill-selected', '--bar-fill-second-selected');
		scales.calculateColorCatOnSelectTwoGroupsScale('--block-fill-selected', '--block-fill-second-selected');
		for(let i=0; i<5; i++) {
			scales.calculateColorTreemapsScale('--treemap-fill-cl-' + i);
			// scales.calculateColorSecondaryItemGroupScale('--')
		}
		
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

			// const Treemap = BarTreemap();

			// let gBars = null;
			// if (lvData.idx === 0) {
			// 	gBars = d3.select('.g_bars.lower' + '.lv_' + lvData.idx);
			// } else {
			// 	gBars = d3.select('.g_bars.upper' + '.lv_' + lvData.idx);
			// }
			// console.log('check gBars: ', gBars.node())

			// gBars.call(
			// 	Treemap
			// 	.data(lvData));
		});

		// Render the edges between clusters per level
		const BRs = gContainer.selectAll('.g_bars'); 
		LVs.each(function(lvData, lvId) {
			const LV = d3.select(this);
			if (lvId < numLVs-1) {
				const currLvData = LVs.data()[lvId],
					nextLvData = LVs.data()[lvId+1];
				const currLowerBar = d3.select('.g_level_' + lvId + '> .level_bar_bottom'),
					nextUpperBar = d3.select('.g_level_' + (lvId+1) + '> .level_bar_top');
				
				const gBtnLVs = gContainer.append('g')
					.attr('class', 'g_btn_lvs' + ' lv_' + lvId)
					.attr('transform', 'translate(' + 
						gLayout.getElLayout(currLowerBar).x1 + 
						',' + 
						(gLayout.getGlobalElLayout(currLowerBar).y2 + lbr.h) + 
						')');

				gLayout.renderClToClLines(gBtnLVs, instances, currLvData, nextLvData, currLowerBar, nextUpperBar, llv.w)
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