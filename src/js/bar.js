import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, llv, lbl, lbr, getElLayout, addAxis} from './style';

import "../css/index.css";

function Bar() {
	let idx;
	let data = [];
	let axis = {
			right: null,
			left: null
	}
	console.log('this in Block: ', this);

	function _bar(selection) {
		let gBR;

		gBR = selection
			.append('g')
			.attr('class', 'g_bar')
			.attr('transform', 'translate(' + lbl.getBLX(idx) + ',' + lbl.t + ')');
	}
	
	_bar.id = function(clId) {
		if (!arguments.length) return clId;
		idx = clId;
		return _bar;
	}

	_bar.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _bar;
	}

	return _bar;
}

export default Bar;