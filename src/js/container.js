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

		
		renderInterface();
				
		scales.calculateYLevelScale(LVData);  // calculate yLvsScale
		scales.calculateColorCatOnSelectScale('--block-fill-selected');
		scales.calculateColorOnSelectScale('--bar-fill-selected');
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
				const gCurrLowerBars = d3.select('.g_bars.lower.lv_' + lvId),
					gNextUpperBars = d3.select('.g_bars.upper.lv_' + (lvId+1));
				
				const gBtnLVs = gContainer.append('g')
					.attr('class', 'g_btn_lvs' + ' lv_' + lvId)
					.attr('transform', 'translate(' + 
						gLayout.getGlobalElLayout(gCurrLowerBars).x1 + 
						',' + 
						gLayout.getGlobalElLayout(gCurrLowerBars).y2 + 
						')');

				gLayout.renderClToClLines(gBtnLVs, instances, gCurrLowerBars, gNextUpperBars, llv.w)
			}
		});

		function renderInterface() {
			const rectButton1 = gContainer.append('rect')
				.attr('x', 600)
				.attr('y', 0)
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', 'red')
				.on('click', function(d){
					LVData[0].mode = 'fold';
					LVData.splice(1, 1);
					
					const gLVsUpdated = d3.selectAll('.g_level')
						.data(LVData, (d) => d.idx);

					gLVsUpdated.exit().remove();
				});

			const rectButton2 = gContainer.append('rect')
				.attr('x', 650)
				.attr('y', 0)
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', 'blue')
				.on('click', function(d){
					const featureToUpdate = LVData[0].features[0];

					// Update the data (order of cats in this case)
					const catsUpdated = [
						LVData[0].features[0].cats[3],
						LVData[0].features[0].cats[1],
						LVData[0].features[0].cats[2],
						LVData[0].features[0].cats[0]
					];
					featureToUpdate.cats = catsUpdated;

					// Update the catScale
					// setScaleToFeature
					const updatedScales = scales.setScaleToFeature(rawData, featureToUpdate, llv.w);
					const catScalesUpdated = updatedScales['catScales'];
					featureToUpdate.catScales = catScalesUpdated;

					const gCatsUpdated = d3.select('.g_block.lv_0.bl_smoking')
						.selectAll('.g_cat')
						.data(catsUpdated, (d) => d.idx);

					gCatsUpdated
						.attr('transform', (cat, i) => 'translate(' + 
							catScalesUpdated[i].range()[0] + ',' +
							0 +
							')'
						);

					const catLabelsUpdated = d3.select('.g_block.lv_0.bl_smoking')
						.selectAll('.cat_label')
						.data(catsUpdated, (d) => d.idx);
					catLabelsUpdated.exit().remove();
					catLabelsUpdated
						.text((cat, i) => cat.idx);
					
					const gBtnBL = d3.select('.g_btn_bls ' + '.bl_smoking')
					gLayout.renderCatToCatLines(gBtnBL, LVData[0], LVData[0].features[0], LVData[0].features[1], 1, llv.w);
				});
		}
	}
	
	_container.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _container;
	}

	return _container;
}

export default Container;