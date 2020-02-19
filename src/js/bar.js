import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lbr, lwbr, gLayout} from './layout';

import "../css/index.css";

function Bar() {
	let idx, lvIdx;
	let lvData = {};
	let axis = {
			right: null,
			left: null
	}
	console.log('this in Block: ', this);

	function _bar(container) {
		const cls = lvData.cls,
					clScales = lvData.clScales;
		const LV = d3.select('.g_level_' + lvData.idx)
		let gBRSet, gBRs;

		// If it is first or last, then only lower or upper bar set
		// If it is in the middle, then both
		switch(lvData.order) {
			case 'first':
				gBRSet = container
					.append('g')
					.data([cls])
					.attr('class', 'g_bars g_bars_lower g_bars_lv_' + lvData.idx)
					.attr('transform', 'translate(' + 
						gLayout.getGlobalElLayout(LV).x1 + 
						',' + 
						gLayout.getGlobalElLayout(LV).y2 + ')'
					);
		
				gBRs = gBRSet
					.selectAll('.g_bar' + lvData.idx)
					.data(cls).enter()
					.append('g')
					.attr('class', 'g_bar')
					.attr('transform', (cl, i) => 'translate(' +
						(clScales[i].range()[0]) + // i*2 is cumulative margin
						',0)'
					);

				gBRs.each(function(cl, clIdx){
					const gBR = d3.select(this),
						clWidth = clScales[clIdx].range()[1] - clScales[clIdx].range()[0];

					gBR
						.append('rect')	
						.attr('class', 'bar_rect bar_rect_lv_' + lvData.idx)
						.attr('x', 0) 
						.attr('y', 0)
						.attr('width', clWidth)
						.attr('height', lbr.h);	

					gBR
						.append('circle')
						.attr('class', 'proto_circle')
						.attr('cx', clWidth/2)
						.attr('cy', 5)
						.attr('r', 5);
				});
				
				break;
			case 'last':
				gBRSet = container
					.append('g')	
					.data([cls])
					.attr('class', 'g_bars g_bars_upper g_bars_lv_' + lvData.idx)
					.attr('transform', 'translate(' + 
						gLayout.getGlobalElLayout(LV).x1 + 
						',' + 
						(gLayout.getGlobalElLayout(LV).y1-lbr.h) + ')'
					);
		
				gBRs = gBRSet
					.selectAll('.g_bar' + lvData.idx)
					.data(cls).enter()
					.append('g')
					.attr('class', 'g_bar')
					.attr('transform', (cl, i) => 'translate(' +
						(clScales[i].range()[0]) + // i*2 is cumulative margin
						',0)'
					);

				gBRs.each(function(cl, clIdx){
					const gBR = d3.select(this),
						clWidth = clScales[clIdx].range()[1] - clScales[clIdx].range()[0];

					gBR
						.append('rect')	
						.attr('class', 'bar_rect bar_rect_lv_' + lvData.idx)
						.attr('x', 0) 
						.attr('y', 0)
						.attr('width', clWidth)
						.attr('height', lbr.h);	

					gBR
						.append('circle')
						.attr('class', 'proto_circle')
						.attr('cx', clWidth/2)
						.attr('cy', 5)
						.attr('r', 5);
				});

				

				break;
		}
	}
	
	_bar.idx = function(clIdx) {
		if (!arguments.length) return clIdx;
		idx = clIdx;
		return _bar;
	}

	_bar.data = function(dataset) {
		if (!arguments.length) return lvData;
		lvData = dataset;
		return _bar;
	}

	return _bar;
}

export default Bar;