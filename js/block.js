import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, llv, lbl} from './style';
import data from './data';

function Level(selection) { // User-defined sementic category
	let data = [];

	function _level(selection) {
		const levels = selection
			.selectAll('.level_rect')
			.data(data).enter()
			.append('rect')
			.attr('class', 'level_rect')
			.attr('x', 3)
			.attr('y', 3)
			.attr('width', llv.w)
			.attr('height', llv.h)
			.style('fill', 'none')
			.style('stroke', 'red');

		levels.each(function(lvData) {
			const block = Block();

			level.call(
				block
				.data(lvData.features)
			);
		});
	}

	_level.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _level;
	}

	return _level;
}

function Bar() {
	let axisRight = null;

	let axis = {
			right: null,
			left: null
	}

	function _bar(selection) {
		selection.append('rect')
			.attr('class', 'block_rect')
			.attr('x', 3)
			.attr('y', lbl.t)
			.attr('width', lbl.w)
			.attr('height', lbl.h)
			.style('stroke', 'red');f
	}

	_bar.data = function(value) {
			
	}

	_bar.addAxis = function(direction, scale) {
			axis[direction] = ddd;
	}

	_bar.removeAxis = function(direction, scale) {

	}

	return _bar;
}

function Block() {
		let data = [];
    let axisRight = null;

    let axis = {
        right: null,
        left: null
    }

    function _block(selection) {
			selection
				.append('rect')
				.attr('class', 'block_rect')
				.attr('x', 3)
				.attr('y', lbl.t)
				.attr('width', lbl.w)
				.attr('height', lbl.h)
				.style('stroke', 'red');
    }

    _block.data = function(dataset) {
			if (!arguments.length) return data;
			data = dataset;
			return _block;
    }

    _block.addAxis = function(direction, scale) {
        axis[direction] = ddd;
    }

    _block.removeAxis = function(direction, scale) {

    }

    return _block;
}

function Container() {
	let data = [];  // data
	let levels = [];
	function _container(svg) {
		const gContainer1 = svg.append('g')
			.attr('class', 'container1');


		const level1 = Level();

		gContainer1.call(
			level1
			.data(data)
		);

	}

	// Data
	_container.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _container;
	}

	return _container;
}

export default Container;