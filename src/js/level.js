import * as d3 from 'd3';
import _ from 'lodash';
import TSNE from 'tsne-js';

import {gColors, gLayout, l, llv, lbl, lwbr, lBtn} from './layout';
import {globalScales, scales} from './scale';
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
				if (lvData.mode.folded == false)
					return 'translate(' + 0 + ',' + scales.yLvsScale(lvIdx) + ')'
				else if (lvData.mode.folded == true) {
					return 'translate(' + 0 + ',' + 10 + ')'
				}
			});

		renderLV();

		function renderLV() {
			gLVs.each(function(lvData, lvIdx) {
				const gLV = d3.select(this);
				const numFeatures = lvData.features.length;
				const heightForLv = scales.yLvsScale(lvData.idx+1) - scales.yLvsScale(lvData.idx) - lBtn.h;

				if (lvData.btnMode.bipartiteMode == 1) {
					const secondaryInstances = _.flatten(lvData.cls.map(d => d.instances));
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
						.attr('y1', heightForLv + 5)
						.attr('x2', llv.w+10)
						.attr('y2', heightForLv + 5);
						
					gLV
						.append('text')
						.attr('class', 'level_label')
						.attr('x', llv.w + 20 + 20)
						.attr('y', heightForLv + 13)
						.text((d, i) => d.name);

					gLV
						.append('rect')
						.attr('class', 'level_fold_button')
						.attr('x', llv.w + 20)
						.attr('y', heightForLv)
						.attr('width', 15)
						.attr('height', 15);

					renderScatterPlot(gLV, secondaryInstances);
				} else if (lvData.btnMode.bipartiteMode == 0) {
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
								.attr('x', llv.w + 20 + 20)
								.attr('y', heightForLv + 13)
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
								.attr('y1', heightForLv + 5)
								.attr('x2', llv.w+10)
								.attr('y2', heightForLv + 5);
		
							gLV
								.append('rect')
								.attr('class', 'level_rect')
								.attr('x', 0)
								.attr('y', 0)
								.attr('width', llv.w)
								.attr('height', heightForLv);
								
							gLV
								.append('text')
								.attr('class', 'level_label')
								.attr('x', llv.w + 20 + 20)
								.attr('y', heightForLv + 13)
								.text((d, i) => d.name);

							gLV
								.append('rect')
								.attr('class', 'level_fold_button')
								.attr('x', llv.w + 20)
								.attr('y', heightForLv)
								.attr('width', 15)
								.attr('height', 15);
		
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
										0	+
										')'
									);
							gBLIcons
								.append('rect')
								.attr('class', 'block_icon_group_rect')
								.attr('x', 5)
								.attr('y', 0)
								.attr('width', 25)
								.attr('height', heightForLv-10);

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
								.filter(d => d.isSignificant === 'true')
								.append('path')
								.attr('class', 'block_corr_path')
								.attr('d', d => {
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
				}

				function renderScatterPlot(gLV, secondaryInstances) {
					let dataSecondaryInstancesForPlot = [];
					let model = new TSNE({
						dim: 2,
						perplexity: 30.0,
						earlyExaggeration: 4.0,
						learningRate: 100.0,
						nIter: 1000,
						metric: 'euclidean'
					});

					// inputData is a nested array which can be converted into an ndarray
					// alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
					model.init({
						data: secondaryInstances.map(d => _.omit(d, 'idx')),
						type: 'dense'
					});

					let coords = model.getOutputScaled();
					console.log('outputScaled: ', coords);

					dataSecondaryInstancesForPlot = secondaryInstances.map((d, i) => ({
						idx: d.idx,
						freq: _.sum(_.values(_.omit(d, 'idx'))),
						coord: coords[i]
					}));

					const xScale = d3.scaleLinear()
						.domain([-1, 1])
						.range([10, 300-10]);
					const yScale = d3.scaleLinear()
						.domain([-1, 1])
						.range([10, 300-10]);
					const circleRScale = d3.scaleLinear()
						.domain(d3.extent(dataSecondaryInstancesForPlot.map(d => d.freq)))
						.range([4, 10]);

					const gBipartitePlot = gLV
						.append('g')
						.attr('class', 'g_bipartite_plot');

					gBipartitePlot
						.append('rect')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 300)
						.attr('height', 300)
						.style('fill', 'whitesmoke');

					gBipartitePlot
						.selectAll('.secondary_instance_circle')
						.data(dataSecondaryInstancesForPlot).enter()
						.append('circle')
						.attr('class', 'secondary_instance_circle')
						.attr('cx', d => xScale(d.coord[0]))
						.attr('cy', d => yScale(d.coord[1]))
						.attr('r', d => circleRScale(d.freq));

					gBipartitePlot
						.selectAll('.secondary_instance_label')
						.data(dataSecondaryInstancesForPlot).enter()
						.append('text')
						.attr('class', 'secondary_instance_label')
						.attr('x', d => xScale(d.coord[0])+10)
						.attr('y', d => yScale(d.coord[1])+5)
						.text(d => d.idx);
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