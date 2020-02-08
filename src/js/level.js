import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, llv, lbl, getElLayout, addAxis} from './style';
import Block from './block';
import Bar from './bar';

function Level(selection) { // User-defined sementic category
	let id = 0;
	let data = [];

	function _level(selection) {
		let gLVs;

		console.log('llv: ', llv);
		
		gLVs = selection
			.selectAll('.level_rect')
			.data(data).enter()
			.append('g')
			.attr('class', 'g_level')
			.attr('transform', (d, i) => 'translate(0,' + llv.getLVT(i) + ')')

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

		gLVs.each(function(lvData) {
			const level = d3.select(this);

			// Set the layout for levels and blocks
			const numFeatures = lvData.features.length;
			const LVWForFeatures = (llv.w * llv.minFeatureAreaRatio) + (llv.w * (llv.maxFeatureAreaRatio-llv.minFeatureAreaRatio)) * (numFeatures-2/llv.maxNumFeatures);
			llv.setLVM(LVWForFeatures);
			lbl.setBLS(LVWForFeatures, numFeatures);

			// Create the blocks
			lvData.features.forEach(function(feature, featureId) {
				const block = Block();

				level.call(
					block
					.id(featureId)
					.data(feature)
				);
			});

			// Create the bars
			lvData.cls.forEach(function(cl, clId) {
				const bar = Bar();
				
				level.call(
					bar
					.id(clId)
					.data(cl)
				);
			});
		});
	}

	_level.id = function(lvId) {
		if (!arguments.length) return lvId;
		id = lvId;
		return _block;
	}

	_level.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _level;
	}

	return _level;
}

export default Level;