import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, gLayout, l, llv, lbl} from './layout';
import Block from './block';
import Bar from './bar';

function Level(selection) { // User-defined sementic category
	let id = 0;
	let data = [];

	function _level(selection) {
		const [ rawData, LVData, instances ] = data;

		let gLVs;

		console.log('llv: ', llv);
		
		gLVs = selection
			.selectAll('.level_rect')
			.data(LVData).enter()
			.append('g')
			.attr('class', 'g_level')
			.attr('transform', (d, i) => 'translate(0,' + llv.getT(i) + ')')

		gLVs
			.append('rect')
			.attr('class', 'level_rect')
			.attr('x', 3)
			.attr('y', 3)
			.attr('width', llv.w)
			.attr('height', llv.h);

		gLVs
      .append('line')
      .attr('class', 'level_bar level_bar_top')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', llv.w)
      .attr('y2', 0);

		gLVs
      .append('line')
      .attr('class', 'level_bar level_bar_bottom')
      .attr('x1', 0)
      .attr('y1', llv.h)
      .attr('x2', llv.w)
      .attr('y2', llv.h);

		gLVs.each(function(LVData) {
			const LV = d3.select(this);

			// Set the layout for levels and blocks
			const numFeatures = LVData.features.length;
			const LVWForFeatures = (llv.w * llv.minFeatureAreaRatio) + (llv.w * (llv.maxFeatureAreaRatio-llv.minFeatureAreaRatio)) * (numFeatures-2/llv.maxNumFeatures);
			llv.setM(LVWForFeatures);
			lbl.setS(LVWForFeatures, numFeatures);

			const block = Block();

			LV.call(
				block
				.data(LVData.features)
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

			// Render the cluster bars (one set for first and last, two sets for middle)
			const bar = Bar();

			LV.call(
				bar
				.data([
					LVData.cls,
					LVData.clScales
				])
			);

			// Render the edges between blocks
			const BLs = d3.selectAll('.g_block');
			BLs.each(function(BLData, BLId) {
				if (BLId < BLs.nodes().length-1){
					const gBtnBls = LV.append('g')
					.attr('class', 'g_btn_bls')
					.attr('transform', 'translate(0,' + 40*(BLId+1) + ')');

					gLayout.renderCatToCatLines(gBtnBls, instances, BLData, BLs.data()[BLId+1], llv.w);
				}
			});
		});
	}

	_level.id = function(lvId) {
		if (!arguments.length) return lvId;
		id = lvId;
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