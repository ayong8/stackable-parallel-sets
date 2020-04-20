import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lwbr, gLayout} from './layout';
import {globalScales, scales} from './scale';
import {data} from './data';

import "../css/index.css";

function Block() {
	let idx;
	let BLData = []; // data for features
	let axis = {
			right: null,
			left: null
	}
	// { 
	// 	'name': 'gender', 
	// 	'type': 'categorical',
	// 	'scale': '',
	// 	'domain': [],
	// 	'instances': []
	// },

	function _block(LV) {
		let gBLsData, gBLs;
		const lvData = LV.data()[0];
		const numFeatures = BLData.length;

		gBLsData = LV
			.selectAll('.g_block')
			.data(BLData, (d) => d.id);
			
		gBLs = gBLsData
			.enter()
			.append('g')
			.attr('class', (blData) => 'g_block lv_' + lvData.idx + ' bl_' + blData.id)
			.attr('transform', (blData, blIdx) => {
				return 'translate(' + 
					gLayout.getElLayout(LV).x1 + 
					',' + 
					lvData.blScale(blIdx) +
					')';
			});	// each block: x - (llv.m.wtn.l) and y - (llv.h / numFeatures)
		
		gBLsData
			.attr('transform', (blData, blIdx) => {
				return 'translate(' + 
					gLayout.getElLayout(LV).x1 + 
					',' + 
					lvData.blScale(blIdx) +
					')';
			});
		gBLsData.exit().remove();

		// Render the lengthy bar that indicates the width of block
		gBLs
			.append('rect')
			.attr('class', 'block_rect')
			.attr('x', llv.m.l/2)
			.attr('y', (d, i) => {
				if (i==0) return 0
				else if (i==numFeatures-1) return lwbr.h/2
				else return lwbr.h/4
			})
			.attr('width', llv.w - (llv.m.l + llv.m.r))
			.attr('height', lwbr.h/2);

		gBLs
			.append('text')
			.attr('class', 'block_label')
			.attr('x', llv.w - 10)
			.attr('y', 15)
			.text((d, i) => d.name)
		/*  
		start -- For shadow
		*/ 
		// filters go in defs element
		var defs = LV
			.append("defs");

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		var filter = defs.append("filter")
				.attr("id", "drop-shadow")
				.attr("height", "130%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		filter.append("feGaussianBlur")
				.attr("in", "SourceAlpha")
				.attr("stdDeviation", 5)
				.attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		filter.append("feOffset")
				.attr("in", "blur")
				.attr("dx", 5)
				.attr("dy", 5)
				.attr("result", "offsetBlur");

		// overlay original SourceGraphic over translated blurred opacity by using
		// feMerge filter. Order of specifying inputs is important!
		var feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode")
				.attr("in", "offsetBlur")
		feMerge.append("feMergeNode")
				.attr("in", "SourceGraphic");

		var defs2 = LV
				.append("defs");

		var filter2 = defs2.append('filter')
				.attr('id', 'drop-shadow-path')
				.attr('x', -2)
				.attr('y', -2)
				.attr('width', 100)
				.attr('height', 100);

		filter2.append('feGaussianBlur')
			.attr('stdDeviation', 5);
		var feMerge2 = filter2.append('feMerge');

		feMerge2.append("feMergeNode")
				.attr("in", "offsetBlur")
		feMerge2.append("feMergeNode")
				.attr("in", "SourceGraphic");

		// 		<filter id="dropshadow" x="-2" y="-2" width="200" height="200">
    //   <feGaussianBlur  stdDeviation="1"/>
    // </filter>
		/*  
		end -- For shadow
		*/ 

		// Render rectangles
		gBLs.each(function(BLData, BLIdx) {
			const gBL = d3.select(this);
			const sortedCats = BLData.cats,
						sortedCatsIdx = BLData.sortedIdx,
						sortedCatInstanceSets = BLData.instances,
						catScales = BLData.catScales;
			let gCats, gCatsData, catRects, catLabels;

			gCatsData = gBL
				.selectAll('.g_cat_' + BLData.id)
				.data(sortedCats, d => d.idx);

			gCats = gCatsData
				.enter()
				.append('g')
				.attr('class', (cat, i) => 'g_cat g_cat_' + BLData.id + ' g_cat_' + cat.idx)
				.attr('transform', (cat, i) => 'translate(' + 
					catScales[i].range()[0] + ',' +
					0 +
					')'
				);

			catRects = gCats
				.append('rect')
				.attr('class', (cat, i) => 'cat_rect cat_rect_' + BLData.id + '_' + cat.idx)
				.attr('x', 0) 
				.attr('y', 0)
				.attr('width', (cat, i) => (catScales[i].range()[1] - catScales[i].range()[0])) // i*2 is cumulative margin
				.attr('height', lwbr.h);

			catLabels = gCats
				.append('text')
				.attr('class', 'cat_label')
				.attr('x', 0)
				.attr('y', (cat, i) => {
					const extraYForText = 5;
					if (BLIdx==0) return lwbr.h
					else if (BLIdx==numFeatures-1) return lwbr.h/2
					else return lwbr.h * 2/3
				})
				.text((cat, i) => cat.label);
		})
		// const gBLl = gLayout.getElLayout(gBLs);

		// const sampleScale = d3.scaleLinear()
		// 		.domain([0, 1])
		// 		.range([gBLl.y1, gBLl.y2]);
		
		// gLayout.addAxis(gBLs, idx, 'right', sampleScale);
		// renderAuxAxisForCats...

		// Render the horizontal category bars for each feature
		// renderCatBars(gBLs);
		

		function renderCatBars(gBL) {
			// const gBLData = 
			// within-bar-group
			const gWtnBRs = gBL
				.append('g')
				.attr('class', 'g_wtn_lv_bars')
				.attr('transform', 'translate(2,2)')

			gWtnBRs
				.selectAll('.wtn_cat_bar');
		}
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

	_block.data = function(dataset) {
		if (!arguments.length) return BLData;
		BLData = dataset;
		return _block;
	}

	return _block;
}

export default Block;