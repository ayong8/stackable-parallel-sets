import * as d3 from 'd3';
import _ from 'lodash';

import Level from './level';
import {globalColors, l, llv, lbl, getElLayout, addAxis} from './style';

function Container() {
	let data = [];  // data
	let levels = [];
	function _container(svg) {
		const gContainer1 = svg.append('g')
			.attr('class', 'container1');

		fetch('/dataset/hClusteringForAllLVs/', {
			method: 'post',
			body: JSON.stringify({
				data: data
			})
		})
		.then((response) => {
			return response.json();
		})
		.then((response) => {
			console.log('response in hClusteringForAllLVs: ', response);
			const dataWithCls = response.data;
			console.log('dataWithCls: ', dataWithCls);
			const LV = Level();
			gContainer1.call(
				LV
				.data(dataWithCls)
			);
		});

		
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