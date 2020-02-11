import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lwbr, gLayout} from './layout';
import {globalScales, scales} from './scale';
import {dataMapping} from './dataMapping';

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
		let gBLs;
		const numFeatures = BLData.length;

		gBLs = LV
			.selectAll('.g_block')
			.data(BLData).enter()
			.append('g')
			.attr('class', 'g_block')
			.attr('transform', (d, i) => {
				return 'translate(' + 
					gLayout.getElLayout(LV).x1 + 
					',' + 
					lbl.getY(gLayout.getElLayout(LV), numFeatures, i) +
					')';
			});	// each block: x - (llv.m.wtn.l) and y - (llv.h / numFeatures) 

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
		/*  
		end -- For shadow
		*/ 

		gBLs.each(function(BLData) {
			const gBL = d3.select(this);
			const cats = BLData.domain,
						featureValues = BLData.instances,
						catScales = BLData.catScales;

			gBL
				.selectAll('.cat_rect')
				.data(cats).enter()
				.append('rect')
				.attr('class', 'cat_rect')
				.attr('x', (cat, i) => catScales[cat].range()[0] - i*lwbr.m.btn) // i*2 is cumulative margin
				.attr('y', 0)
				.attr('width', (cat) => catScales[cat].range()[1] - catScales[cat].range()[0])
				.attr('height', 20)
				.style("filter", "url(#drop-shadow)")
		})
		// const gBLl = gLayout.getElLayout(gBLs);

		// const sampleScale = d3.scaleLinear()
		// 		.domain([0, 1])
		// 		.range([gBLl.y1, gBLl.y2]);
		
		console.log('layout in _block: ', );
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
	
	_block.id = function(featureId) {
		if (!arguments.length) return featureId;
		idx = featureId;
		return _block;
	}

	_block.data = function(dataset) {
		if (!arguments.length) return BLData;
		BLData = dataset;
		return _block;
	}

	

	_block.removeAxis = function(direction, scale) {

	}

	return _block;
}

export default Block;