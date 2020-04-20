import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lbr, lwbr, gLayout} from './layout';
import {data} from './data';

import "../css/index.css";

function Bar() {
	let idx, lvIdx;
	let lvData = {};
	let axis = {
			right: null,
			left: null
	}

	function _bar(container) {
		const cls = lvData.cls,
					clScales = lvData.clScales;
		const LV = d3.select('.g_level_' + lvData.idx);
		let gBRSet, gBRLowers;

		// If it is first or last, then only lower or upper bar set
		// If it is in the middle, then both
		switch(lvData.order) {
			case 'first':
				renderLowerCls();
				break;
			case 'last':
				renderUpperCls();
				break;
			case 'middle':
				renderUpperCls();
				renderLowerCls();
				break;
		}

		function renderLowerCls() {
			const gLevel = d3.select('.g_level_' + lvData.idx);
			const lowerBar = gLevel.select('.level_bar_bottom');
			gBRSet = container
				.append('g')
				.data([cls])
				.attr('class', 'g_bars lower lv_' + lvData.idx)
				.attr('transform', 'translate(' + 
					gLayout.getElLayout(lowerBar).x1 + 
					',' + 
					(gLayout.getGlobalElLayout(lowerBar).y2) + ')'
				);
	
			gBRLowers = gBRSet
				.selectAll('.g_bar.lv_' + lvData.idx)
				.data(cls).enter()
				.append('g')
				.attr('class', cl => 'g_bar lower lv_' + lvData.idx + ' cl_' + cl.idx + ' bipartite_' + lvData.btnMode.bipartiteMode)
				.attr('transform', (cl, clIdx) => 'translate(' +
					(clScales[cl.idx].range()[0]) + // i*2 is cumulative margin
					',0)'
				);

			gBRLowers.each(function(cl, clIdx){
				const gBRLower = d3.select(this),
					clWidth = clScales[cl.idx].range()[1] - clScales[cl.idx].range()[0];
				const proto = cl.prototype;
				let gProto;
				let protoPathData = [], protoCircleData = [];
				
				gBRLower
					.append('rect')	
					.attr('class', 'bar_rect lv_' + lvData.idx)
					.attr('x', 0) 
					.attr('y', 0)
					.attr('width', clWidth < 0 ? 1 : clWidth) // When there is no items in the cluster, set it as 1
					.attr('height', lbr.h);
					
				gBRLower
					.append('text')
					.attr('class', 'cl_label')
					.attr('x', 0)
					.attr('y', 10)
					.text(cl.idx);

				gProto = container
					.selectAll('.g_prototype.lv_' + lvData.idx + '.cl_' + cl.idx)
					.data([proto]).enter()
					.append('g')
					.attr('class', 'g_prototype lv_' + lvData.idx + ' cl_' + cl.idx)
					.attr('transform', 'translate(0,0)');
				
				// If the cluster is lower, start from the first feature, ..., then lastly the cluster
				// If the cluster is upper, start from the cluster, then features
				if (typeof(proto.features) !== 'undefined' && Object.keys(proto.features).length !== 0) {
					gProto
						.selectAll('.proto_circle')
						.data(proto.features).enter()
						.append('circle')
						.attr('class', 'proto_circle lv_' + lvData.idx + ' cl_' + cl.idx)
						.attr('cx', (d, i) => {
							const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(d.name) + '_' + d.value));
							return catEl.x1 + catEl.width/2;
						})
						.attr('cy', (d, i) => {
							const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(d.name) + '_' + d.value));
							return catEl.y1 + lbr.h;
						})
						.attr('r', 5);
						
					if (lvData.idx !== 0) {
						const gBRUpper = d3.select('.g_bar.upper.lv_' + lvData.idx + '.cl_' + cl.idx);
						const firstFeatureKey = proto.features[0]['name'];
						const firstFeatureValue = proto.features[0]['value'];
						const firstCatRect = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(firstFeatureKey) + '_' + firstFeatureValue));

						protoPathData.push({
							source: { 
								x: gLayout.getGlobalElLayout(gBRUpper).x1 + clWidth/2, 
								y: gLayout.getGlobalElLayout(gBRUpper).y1 + lwbr.h
							},
							target: { 
								x: firstCatRect.x1 + firstCatRect.width/2, 
								y: firstCatRect.y1 + lwbr.h
							}
						});

						gProto
							.append('circle')
							.attr('class', 'proto_circle lv_' + lvData.idx + ' cl_' + cl.idx)
							.attr('cx', gLayout.getGlobalElLayout(gBRUpper).x1 + clWidth/2)
							.attr('cy', gLayout.getGlobalElLayout(gBRUpper).y1 + lbr.h)
							.attr('r', 5);
					}
					
					proto.features.forEach((featureObj, i) => {  // e.g., { Air Pollution: 0, Occupational Hazards: 0, idx: 0 }
						if (i < proto.features.length-1) { 
							const currFeatureKey = proto.features[i]['name'],
									nextFeatureKey = proto.features[i+1]['name'];
							const currFeatureValue = proto.features[i]['value'],
									nextFeatureValue = proto.features[i+1]['value'];
							const currCatRect = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue)),
									nextCatRect = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(nextFeatureKey) + '_' + nextFeatureValue));

							protoPathData.push({
								source: { 
									x: currCatRect.x1 + currCatRect.width/2, 
									y: currCatRect.y1 + lwbr.h
								},
								target: { 
									x: nextCatRect.x1 + nextCatRect.width/2, 
									y: nextCatRect.y1 + lwbr.h
								}
							});
						} else if (i === proto.features.length-1) {
							const currFeatureKey = proto.features[i]['name'];
							const currFeatureValue = proto.features[i]['value'];
							const currCatRect = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue));

							protoPathData.push({
								source: { 
									x: currCatRect.x1 + currCatRect.width/2, 
									y: currCatRect.y1 + lwbr.h
								},
								target: { 
									x: gLayout.getGlobalElLayout(gBRLower).x1 + clWidth/2, 
									y: gLayout.getGlobalElLayout(gBRLower).y1 + lwbr.h
								}
							});

							gProto
								.append('circle')
								.attr('class', 'proto_circle lv_' + lvData.idx + ' cl_' + cl.idx)
								.attr('cx', gLayout.getGlobalElLayout(gBRLower).x1 + clWidth/2)
								.attr('cy', gLayout.getGlobalElLayout(gBRLower).y1 + lbr.h)
								.attr('r', 5);
						}
						
					});

					const drawProtoLine = d3.linkVertical()
						.x((d) => d.x)
						.y((d) => d.y);

					gProto
						.selectAll('.proto_path')
						.data(protoPathData).enter()
						.append('path')
						.attr('class', 'proto_path lv_' + lvData.idx + ' cl_' + cl.idx)
						.attr('d', drawProtoLine);
				}
			});
		}

		function renderUpperCls() {
			const topBar = d3.select('.g_level_' + lvData.idx).select('.level_bar_top');
			gBRSet = container
				.append('g')	
				.data([cls])
				.attr('class', 'g_bars upper lv_' + lvData.idx)
				.attr('transform', 'translate(' + 
					gLayout.getElLayout(topBar).x1 + 
					',' + 
					(gLayout.getGlobalElLayout(topBar).y1 - (lbr.h)) + ')'
				);
	
			gBRLowers = gBRSet
				.selectAll('.g_bar')
				.data(cls).enter()
				.append('g')
				.attr('class', cl => 'g_bar upper lv_' + lvData.idx + ' cl_' + cl.idx + ' bipartite_' + lvData.btnMode.bipartiteMode)
				.attr('transform', (cl, clIdx) => 'translate(' +
					(clScales[cl.idx].range()[0]) + // i*2 is cumulative margin
					',0)'
				);

			gBRLowers.each(function(cl, clIdx){
				const gBR = d3.select(this),
					clWidth = clScales[cl.idx].range()[1] - clScales[cl.idx].range()[0];
				const proto = cl.prototype;
				let gProto;
				let protoPathData = [], protoCircleData = [];

				gBR
					.append('rect')	
					.attr('class', 'bar_rect lv_' + lvData.idx)
					.attr('x', 0) 
					.attr('y', 0)
					.attr('width', clWidth)
					.attr('height', lbr.h);	

				gBR
					.append('text')
					.attr('class', 'cl_label')
					.attr('x', 0)
					.attr('y', 10)
					.text(cl.idx);

				// if (lvData.features.length > 1) {
				// 	gProto = container
				// 		.selectAll('.g_prototype.lv_' + lvData.idx + '.cl_' + cl.idx)
				// 		.data([proto]).enter()
				// 		.append('g')
				// 		.attr('class', 'g_prototype lv_' + lvData.idx + ' cl_' + cl.idx)
				// 		.attr('transform', 'translate(0,0)');

				// 	gProto
				// 		.append('circle')
				// 		.attr('class', 'proto_circle lv_' + lvData.idx + ' cl_' + cl.idx)
				// 		.attr('cx', gLayout.getGlobalElLayout(gBR).x1 + clWidth/2)
				// 		.attr('cy', gLayout.getGlobalElLayout(gBR).y1 + lbr.h)
				// 		.attr('r', 5);
					
				// 	// If the cluster is lower, start from the first feature, ..., then lastly the cluster
				// 	// If the cluster is upper, start from the cluster, then features
				// 	proto.features.forEach((featureObj, i) => {  // e.g., { Air Pollution: 0, Occupational Hazards: 0, idx: 0 }
				// 		if (i < proto.features.length-1) {
				// 			const currFeatureKey = proto.features[i]['name'],
				// 					nextFeatureKey = proto.features[i+1]['name'];
				// 			const currFeatureValue = proto.features[i]['value'],
				// 					nextFeatureValue = proto.features[i+1]['value'];

				// 			const currCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue)),
				// 					nextCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(nextFeatureKey) + '_' + nextFeatureValue));
				// 			if (i > 0) {
				// 				protoPathData.push({
				// 					source: { 
				// 						x: currCatEl.x1 + currCatEl.width/2, 
				// 						y: currCatEl.y1 + lwbr.h
				// 					},
				// 					target: { 
				// 						x: nextCatEl.x1 + nextCatEl.width/2, 
				// 						y: nextCatEl.y1 + lwbr.h
				// 					}
				// 				});
				// 			} else if (i === 0) {  // Add path (1) from cluster bar to first cat, (2) from first cat to second cat
				// 				protoPathData.push({
				// 					source: { 
				// 						x: gLayout.getGlobalElLayout(gBR).x1 + clWidth/2, 
				// 						y: gLayout.getGlobalElLayout(gBR).y1 + lwbr.h
				// 					},
				// 					target: { 
				// 						x: currCatEl.x1 + currCatEl.width/2, 
				// 						y: currCatEl.y1 + lwbr.h
				// 					}
				// 				});

				// 				protoPathData.push({
				// 					source: { 
				// 						x: currCatEl.x1 + currCatEl.width/2, 
				// 						y: currCatEl.y1 + lwbr.h
				// 					},
				// 					target: { 
				// 						x: nextCatEl.x1 + nextCatEl.width/2, 
				// 						y: nextCatEl.y1 + lwbr.h
				// 					}
				// 				});
				// 			}
				// 		}
				// 	});

				// 	const drawProtoLine = d3.linkVertical()
				// 		.x((d) => d.x)
				// 		.y((d) => d.y);

				// 	gProto
				// 		.selectAll('.proto_path')
				// 		.data(protoPathData).enter()
				// 		.append('path')
				// 		.attr('class', 'proto_path lv_' + lvData.idx + ' cl_' + cl.idx)
				// 		.attr('d', drawProtoLine);

				// 	gProto
				// 		.selectAll('.proto_circle cl_' + cl.idx)
				// 		.data(proto.features).enter()
				// 		.append('circle')
				// 		.attr('class', 'proto_circle lv_' + lvData.idx + ' cl_' + cl.idx)
				// 		.attr('cx', (d, i) => {
				// 			const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(d.name) + '_' + d.value));
				// 			return catEl.x1 + catEl.width/2;
				// 		})
				// 		.attr('cy', (d, i) => {
				// 			const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + data.convertStrToUnderbar(d.name) + '_' + d.value));
				// 			return catEl.y1 + lbr.h;
				// 		})
				// 		.attr('r', 5);
				// }
				
			});
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