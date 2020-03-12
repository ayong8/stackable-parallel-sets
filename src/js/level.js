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

		renderLV();

		function renderLV() {
			gLVs.each(function(lvData, lvIdx) {
				const gLV = d3.select(this);
				const numFeatures = lvData.features.length;
				console.log('numFeatures: ', numFeatures)
	
				if (numFeatures == 1) {
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_top')
							.attr('x1', 0)
							.attr('y1', -5)
							.attr('x2', llv.w+10)
							.attr('y2', -5);
	
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_bottom')
							.attr('x1', 0)
							.attr('y1', 5)
							.attr('x2', llv.w+10)
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
							.attr('x2', llv.w+10)
							.attr('y2', -5);
	
						gLV
							.append('line')
							.attr('class', 'level_bar level_bar_bottom')
							.attr('x1', 0)
							.attr('y1', llv.h + 5)
							.attr('x2', llv.w+10)
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

						// Render the block icons on the right
						const gBLIcons = gLV
								.append('g')
								.attr('class', 'g_block_icons g_block_icons_' + lvData.idx)
								.attr('transform', 'translate(' +
									(llv.w - 40) + ',' +
									5	+
									')'
								);
						gBLIcons
							.append('rect')
							.attr('class', 'block_icon_group_rect')
							.attr('x', 5)
							.attr('y', 0)
							.attr('width', 25)
							.attr('height', llv.h-10);

						gBLIcons
							.selectAll('.block_icon')
							.data(lvData.features).enter()
							.append('rect')
							.attr('class', (feature, i) => 'block_icon block_icon_' + feature.id)
							.attr('x', 10)
							.attr('y', (feature, i) => lvData.blScale(i))
							.attr('width', 15)
							.attr('height', 15);

						gBLIcons
							.selectAll('.block_corr_path')
							.data(lvData.pairwiseCorrs).enter()
							.append('path')
							.attr('class', 'block_corr_path')
							.attr('d', d => {
									console.log('feature in corr path: ', d);
								let upperFeature;
								let lowerFeature;
				
								if (lvData.blScale(d.featurePair[0]) > lvData.blScale(d.featurePair[1])) {
									upperFeature = d.featurePair[1];
									lowerFeature = d.featurePair[0];
								} else {
									upperFeature = d.featurePair[0];
									lowerFeature = d.featurePair[1];
								}
				
								return draw(
									d3.path(),
									20, lvData.blScale(upperFeature),
									40, lvData.blScale(upperFeature) + Math.abs(lvData.blScale(lowerFeature)-lvData.blScale(upperFeature))/2,
									20, lvData.blScale(lowerFeature)
								);
							})
							.style('fill', 'none')
							.style('stroke', 'black')
							.style('opacity', 0.2)
							.style('stroke-width', d => 5+10*d.corr);
						
	
						// Render the edges between blocks
						const BLs = gLV.selectAll('.g_block');
						BLs.each(function(blData, blId) {
							const gBL = d3.select(this);
							if (blId < BLs.nodes().length-1){
								const currBLData = BLs.data()[blId],
										nextBLData = BLs.data()[blId+1];
								const gBtnBLs = gLV.append('g')
									.attr('class', 'g_btn_bls bl_' + currBLData.id)
									.attr('transform', 'translate(0,' + (lvData.blScale(blId)+lwbr.h) + ')');
	
								gLayout.renderCatToCatLines(gBtnBLs, lvData, currBLData, nextBLData, blId+1, llv.w);
							}	
						});

						// Render cooccurrence arc between words
						function draw(context, startX, startY, controlX, controlY, endX, endY) {
							context.moveTo(startX, startY);
							context.quadraticCurveTo(controlX, controlY, endX, endY);

							return context;
						}
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