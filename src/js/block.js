import * as d3 from 'd3';
import _ from 'lodash';

import {globalColors, l, llv, lbl} from './style';
import data from './data';

function Level(selection) { // User-defined sementic category
	let id = 0;
	let data = [];

	function _level(selection) {
		const gLevels = selection
			.selectAll('.level_rect')
			.data(data).enter()
			.append('g')
			.attr('class', 'g_level');

		gLevels
			.append('rect')
			.attr('class', 'level_rect')
			.attr('x', 3)
			.attr('y', 3)
			.attr('width', llv.w)
			.attr('height', llv.h)
			.style('fill', 'none')
			.style('stroke', 'blue');

		gLevels.each(function(lvData) {
			const level = d3.select(this);
			lvData.features.forEach(function(feature, featureId) {
				const block = Block();
				level.call(
					block
					.id(featureId)
					.data(feature)
				);
			})
		});
	}

	_level.id = function(id) {
		if (!arguments.length) return id;
		id = id;
		return _block;
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
			.style('stroke', 'red');
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
	let id = 0;
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
			.style('stroke', 'red')
			.on('click', function() {
				const selectedBlock = d3.select(this);
				fetch('/dataset/loadData', {
					method: 'get'
				})
				.then((response) => {
					selectedBlock.style('fill', 'red');
				})
			});
	}
	
	_block.id = function(id) {
		if (!arguments.length) return id;
		id = id;
		return _block;
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

		console.log('data in container: ', data);

		const level1 = Level();
		const level2 = Level();

		gContainer1.call(
			level1
			.data(data)
		);
		gContainer1.call(
			level2
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