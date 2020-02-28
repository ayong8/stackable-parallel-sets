import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, gLayout, l, llv, lbl, lwbr} from './layout';
import Block from './block';

function Level(selection) { // User-defined sementic category
	let idx = 0;
	let data = [];

	function _level(container) {
		const [ rawData, LVData, instances ] = data;
		let gLVData, gLVs;
		
		gLVData = container
			.selectAll('.g_level')
			.data(LVData, (d) => d.idx)
			
		gLVs = gLVData
			.enter()
			.append('g')
			.attr('class', (d, i) => 'g_level g_level_' + i)
			.attr('transform', function(lvData, lvIdx) {
				if (lvData.mode == 'unfold')
					return 'translate(' + 0 + ',' + scales.yLvsScale(lvIdx) + ')'
				else if (lvData.mode == 'fold') {
					return 'translate(' + 0 + ',' + 10 + ')'
				}
			});


		// gLVData
		// 	.transition()
		// 	.attr('transform', function(lvData, lvIdx) {
		// 		const gLV = d3.select(this);
				
		// 		if (lvData.mode == 'unfold')
		// 			return 'translate(' + 0 + ',' + scales.yLvsScale(lvIdx) + ')'
		// 		else if (lvData.mode == 'fold') {
		// 			gLV.selectAll('*').remove();
		// 			gLV
		// 				.append('line')
		// 				.attr('class', 'level_bar level_bar_top')
		// 				.attr('x1', 0)
		// 				.attr('y1', -5)
		// 				.attr('x2', llv.w)
		// 				.attr('y2', -5);

		// 			gLV
		// 				.append('line')
		// 				.attr('class', 'level_bar level_bar_bottom')
		// 				.attr('x1', 0)
		// 				.attr('y1', 5)
		// 				.attr('x2', llv.w)
		// 				.attr('y2', 5);

		// 			const heightForMovingUp = llv.h;
		// 			const otherGLVs = d3.selectAll('.g_level')
		// 						.filter((d) => {
		// 							// only g_level elements below the selected level are moved up
		// 							return d.idx > lvIdx 
		// 						});
		// 			return 'translate(' + 0 + ',' + 10 + ')'
		// 		}

		// 		//////
		// 		const numFeatures = lvData.features.length;
	
		// 		if (numFeatures == 1) {
		// 				gLV
		// 					.append('line')
		// 					.attr('class', 'level_bar level_bar_top')
		// 					.attr('x1', 0)
		// 					.attr('y1', -5)
		// 					.attr('x2', llv.w)
		// 					.attr('y2', -5);
	
		// 				gLV
		// 					.append('line')
		// 					.attr('class', 'level_bar level_bar_bottom')
		// 					.attr('x1', 0)
		// 					.attr('y1', 5)
		// 					.attr('x2', llv.w)
		// 					.attr('y2', 5);
							
		// 				gLV
		// 					.append('text')
		// 					.attr('class', 'level_label')
		// 					.attr('x', 0)
		// 					.attr('y', 5)
		// 					.text((d, i) => d.name);
		// 		}
		// 		else if (numFeatures > 1) {
		// 				gLV
		// 					.append('line')
		// 					.attr('class', 'level_bar level_bar_top')
		// 					.attr('x1', 0)
		// 					.attr('y1', -5)
		// 					.attr('x2', llv.w)
		// 					.attr('y2', -5);
	
		// 				gLV
		// 					.append('line')
		// 					.attr('class', 'level_bar level_bar_bottom')
		// 					.attr('x1', 0)
		// 					.attr('y1', llv.h + 5)
		// 					.attr('x2', llv.w)
		// 					.attr('y2', llv.h + 5);
	
		// 				gLV
		// 					.append('rect')
		// 					.attr('class', 'level_rect')
		// 					.attr('x', 0)
		// 					.attr('y', 0)
		// 					.attr('width', llv.w)
		// 					.attr('height', llv.h);
							
		// 				gLV
		// 					.append('text')
		// 					.attr('class', 'level_label')
		// 					.attr('x', 0)
		// 					.attr('y', llv.h)
		// 					.text((d, i) => d.name);
	
		// 				// Set the layout for levels and blocks
		// 				const LVWForFeatures = (llv.w * llv.minFeatureAreaRatio) + (llv.w * (llv.maxFeatureAreaRatio-llv.minFeatureAreaRatio)) * (numFeatures-2/llv.maxNumFeatures);
		// 				llv.setM(LVWForFeatures);
		// 				lbl.setS(LVWForFeatures, numFeatures);
		// 				lvData.blScale = scales.calculateYBlockScale(lvData);
	
		// 				const BL = Block();
	
		// 				gLV.call(
		// 					BL
		// 					.data(lvData.features)
		// 				);
	
		// 				// Render the edges between blocks
		// 				const BLs = gLV.selectAll('.g_block');
		// 				BLs.each(function(blData, blId) {
		// 					const gBL = d3.select(this);
		// 					if (blId < BLs.nodes().length-1){
		// 						const gBtnBLs = gLV.append('g')
		// 							.attr('class', 'g_btn_bls')
		// 							.attr('transform', 'translate(0,' + (lvData.blScale(blId)+lwbr.h) + ')');
	
		// 						gLayout.renderCatToCatLines(gBtnBLs, lvData, blData, BLs.data()[blId+1], blId+1, llv.w);
		// 					}	
		// 				});
		// 		}
		// 	});
		// gLVData.exit().remove();

		renderLV();

		function renderLV() {
			gLVs.each(function(lvData, lvIdx) {
				const gLV = d3.select(this);
				const numFeatures = lvData.features.length;
	
				if (numFeatures == 1) {
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_top')
							.attr('x1', 0)
							.attr('y1', -5)
							.attr('x2', llv.w)
							.attr('y2', -5);
	
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_bottom')
							.attr('x1', 0)
							.attr('y1', 5)
							.attr('x2', llv.w)
							.attr('y2', 5);
							
						gLV
							.append('text')
							.attr('class', 'level_label')
							.attr('x', 0)
							.attr('y', 5)
							.text((d, i) => d.name);
				}
				else if (numFeatures > 1) {
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_top')
							.attr('x1', 0)
							.attr('y1', -5)
							.attr('x2', llv.w)
							.attr('y2', -5);
	
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_bottom')
							.attr('x1', 0)
							.attr('y1', llv.h + 5)
							.attr('x2', llv.w)
							.attr('y2', llv.h + 5);
	
						gLV
							.append('rect')
							.attr('class', 'level_rect')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', llv.w)
							.attr('height', llv.h);
							
						gLV
							.append('text')
							.attr('class', 'level_label')
							.attr('x', 0)
							.attr('y', llv.h)
							.text((d, i) => d.name);
	
						// Set the layout for levels and blocks
						const LVWForFeatures = (llv.w * llv.minFeatureAreaRatio) + (llv.w * (llv.maxFeatureAreaRatio-llv.minFeatureAreaRatio)) * (numFeatures-2/llv.maxNumFeatures);
						llv.setM(LVWForFeatures);
						lbl.setS(LVWForFeatures, numFeatures);
						lvData.blScale = scales.calculateYBlockScale(lvData);
	
						const BL = Block();
	
						gLV.call(
							BL
							.data(lvData.features)
						);
	
						// Render the edges between blocks
						const BLs = gLV.selectAll('.g_block');
						BLs.each(function(blData, blId) {
							const gBL = d3.select(this);
							if (blId < BLs.nodes().length-1){
								const currBLData = BLs.data()[blId],
										nextBLData = BLs.data()[blId+1];
								const gBtnBLs = gLV.append('g')
									.attr('class', 'g_btn_bls_' + currBLData.id + '_' + nextBLData.id)
									.attr('transform', 'translate(0,' + (lvData.blScale(blId)+lwbr.h) + ')');
	
								gLayout.renderCatToCatLines(gBtnBLs, lvData, currBLData, nextBLData, blId+1, llv.w);
							}	
						});
				}
			});
		}
	}

	_level.idx = function(lvId) {
		if (!arguments.length) return lvId;
		idx = lvId;
		return _level;
	}

	_level.data = function(dataset) {
		if (!arguments.length) return data;
		data = dataset;
		return _level;
	}

	return _level;
}

export default Level;