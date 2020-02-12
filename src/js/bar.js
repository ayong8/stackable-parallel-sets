import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lbr, lwbr, gLayout} from './layout';

import "../css/index.css";

function Bar() {
	let idx;
	let BRData = {};
	let axis = {
			right: null,
			left: null
	}
	console.log('this in Block: ', this);

	function _bar(LV) {
		const [ cls, clScales ] = BRData;
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
			.selectAll('.bar_rect')
			.data(cls).enter()
			.append('rect')
			.attr('class', 'bar_rect')
			.attr('x', (cat, i) => clScales[i].range()[0] - i*lwbr.m.btn) // i*2 is cumulative margin
			.attr('y', 0)
			.attr('width', (cat, i) => clScales[i].range()[1] - clScales[i].range()[0])
			.attr('height', 20)
			.style("filter", "url(#drop-shadow)")
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