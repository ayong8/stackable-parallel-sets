import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, llv, lbl, getElLayout, addAxis} from './style';
import data from './data';

import "../css/index.css";

function Block() {
	let idx;
	let data = [];
	let axis = {
			right: null,
			left: null
	}
	console.log('this in Block: ', this);

	function _block(selection) {
		let gBL;

		gBL = selection
			.append('g')
			.attr('class', 'g_block')
			.attr('transform', 'translate(' + lbl.getBLX(idx) + ',' + lbl.t + ')');
		gBL
			.append('rect')
			.attr('class', 'block_rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', lbl.s)
			.attr('height', lbl.s)
			.on('click', function() {
				const selectedBlock = d3.select(this);
				fetch('/dataset/loadData', {	
					method: 'get'
				})
				.then((response) => {
					selectedBlock.style('fill', 'red');
				})
			});

		const gBLl = getElLayout(gBL);

		const sampleScale = d3.scaleLinear()
				.domain([0, 1])
				.range([gBLl.y1, gBLl.y2]);
		
		console.log('layout in _block: ', );
		addAxis(gBL, idx, 'right', sampleScale);
		// switch (idx) {
		// 	case 0:
		// axis[direction] = selection
		// .enter()
		// .append('g')
		// .attr('class', function(d) {
		//   return 'g_axis g_feature_axis g_feature_axis_' + d.key;
		// })
		// .attr('transform', function(d, i) {
		//   return 'translate(' + xFeatureScale(d.key) + ',' + 0 + ')';
		// });
	}

		
	
	_block.id = function(featureId) {
		if (!arguments.length) return featureId;
		idx = featureId;
		return _block;
	}

	_block.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _block;
	}

	

	_block.removeAxis = function(direction, scale) {

	}

	return _block;
}

export default Block;