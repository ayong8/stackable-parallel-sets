import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, gLayout, l, llv, lbl, lwbr} from './layout';
import Block from './block';

function Level(selection) { // User-defined sementic category
	let idx = 0;
	let data = [];

	function _level(container) {
		const [ rawData, LVData, instances ] = data;
		let gLVData, gLVs;

		console.log('llv: ', llv);
		
		gLVData = container
			.selectAll('.g_level')
			.data(LVData)
			
		gLVs = gLVData
			.enter()
			.append('g')
			.attr('class', (d, i) => 'g_level g_level_' + i)
			.attr('transform', function(lvData, lvIdx) {
				if (lvData.mode == 'unfold')
					return 'translate(' + l.wForLabel + ',' + scales.yLvsScale(lvIdx) + ')'
				else if (lvData.mode == 'fold') {
					return 'translate(' + l.wForLabel + ',' + 10 + ')'
				}
			});

		gLVData
			.transition()
			.attr('transform', function(lvData, lvIdx) {
				if (lvData.mode == 'unfold')
					return 'translate(' + l.wForLabel + ',' + scales.yLvsScale(lvIdx) + ')'
				else if (lvData.mode == 'fold') {
					return 'translate(' + l.wForLabel + ',' + 10 + ')'
				}
			});
		

		gLVs
			.append('rect')
			.attr('class', 'level_rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', llv.w)
			.attr('height', llv.h);

		gLVs
      .append('line')
      .attr('class', 'level_bar level_bar_top')
      .attr('x1', 0)
      .attr('y1', -5)
      .attr('x2', llv.w)
      .attr('y2', -5);

		gLVs
      .append('line')
      .attr('class', 'level_bar level_bar_bottom')
      .attr('x1', 0)
      .attr('y1', llv.h + 5)
      .attr('x2', llv.w)
			.attr('y2', llv.h + 5);
			
		gLVs
			.append('text')
			.attr('class', 'level_label')
			.attr('x', 0)
			.attr('y', llv.h)
			.text((d, i) => d.name);

		gLVs.each(function(lvData, lvIdx) {
			const LV = d3.select(this);

			// Set the layout for levels and blocks
			const numFeatures = lvData.features.length;
			const LVWForFeatures = (llv.w * llv.minFeatureAreaRatio) + (llv.w * (llv.maxFeatureAreaRatio-llv.minFeatureAreaRatio)) * (numFeatures-2/llv.maxNumFeatures);
			llv.setM(LVWForFeatures);
			lbl.setS(LVWForFeatures, numFeatures);
			lvData.blScale = scales.calculateYBlockScale(lvData);

			const BL = Block();

			LV.call(
				BL
				.data(lvData.features)
			);

			// // Render the blocks
			// lvData.features.forEach(function(feature, featureId) {
			// 	const block = Block();

			// 	level.call(
			// 		block
			// 		.id(featureId)
			// 		.data(feature)
			// 	);
			// });

			// Render the edges between blocks
			const BLs = LV.selectAll('.g_block');
			BLs.each(function(blData, blId) {
				const gBL = d3.select(this);
				if (blId < BLs.nodes().length-1){
					const gBtnBLs = LV.append('g')
						.attr('class', 'g_btn_bls')
						.attr('transform', 'translate(0,' + (lvData.blScale(blId)+lwbr.h) + ')');
					console.log('gBtnBLs transform: ', gBtnBLs.attr('transform'))
					gLayout.renderCatToCatLines(gBtnBLs, instances, lvData, blData, BLs.data()[blId+1], blId+1, llv.w);
				}	
			});
		});
	}

	_level.idx = function(lvId) {
		if (!arguments.length) return lvId;
		idx = lvId;
		return _level;
	}

	_level.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _level;
	}

	return _level;
}

export default Level;