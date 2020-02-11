import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lbr, gLayout} from './layout';

import "../css/index.css";

function Bar() {
	let idx;
	let BRData = [];
	let axis = {
			right: null,
			left: null
	}
	console.log('this in Block: ', this);

	function _bar(LV) {
		let gBR;

		// If it is first or last, then only lower or upper bar set
		// If it is in the middle, then both
		gBR = LV
			.append('g')
			.attr('class', 'g_bar')
			.attr('transform', 'translate(' + 
				gLayout.getElLayout(LV).x1 + 
				',' + 
				gLayout.getElLayout(LV).y2 + ')'
			);

		gBR
			.append('rect')
			.attr('class', 'bar_rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 20)
			.attr('height', 20)
	}
	
	_bar.id = function(clId) {
		if (!arguments.length) return clId;
		idx = clId;
		return _bar;
	}

	_bar.data = function(dataset) {
		if (!arguments.length) return BRData;
		BRData = dataset;
		return _bar;
	}

	return _bar;
}

export default Bar;