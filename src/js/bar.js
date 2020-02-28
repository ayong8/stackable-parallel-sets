import * as d3 from 'd3';
import _ from 'lodash';

import {gColors, l, llv, lbl, lbr, lwbr, gLayout} from './layout';
import {dataMapping} from './dataMapping';

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
		const LV = d3.select('.g_level_' + lvData.idx)
		let gBRSet, gBRs;

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
				renderLowerCls();
				renderUpperCls();
				break;
		}

		function renderLowerCls() {
			gBRSet = container
				.append('g')
				.data([cls])
				.attr('class', 'g_bars g_bars_lower g_bars_lv_' + lvData.idx + ' g_bars_lower_lv_' + lvData.idx)
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
				.attr('transform', (cl, clIdx) => 'translate(' +
					(clScales[cl.idx].range()[0]) + // i*2 is cumulative margin
					',0)'
				);

			gBRs.each(function(cl, clIdx){
				const gBR = d3.select(this),
					clWidth = clScales[cl.idx].range()[1] - clScales[cl.idx].range()[0];
				const proto = cl.prototype;
				let gProto;
				let protoPathData = [], protoCircleData = [];
				
				gBR
					.append('rect')	
					.attr('class', 'bar_rect bar_rect_lv_' + lvData.idx)
					.attr('x', 0) 
					.attr('y', 0)
					.attr('width', clWidth)
					.attr('height', lbr.h);
					
				gBR
					.append('text')
					.attr('class', 'cl_label')
					.attr('x', 0)
					.attr('y', 5)
					.text(cl.idx)

				gProto = container
					.selectAll('.g_prototype_lv_' + lvData.idx + '_cl_' + cl.idx)
					.data([proto]).enter()
					.append('g')
					.attr('class', 'g_prototype_cl_' + cl.idx)
					.attr('transform', 'translate(0,0)');

				gProto
					.append('circle')
					.attr('class', 'proto_circle proto_circle_lower_' + lvData.idx)
					.attr('cx', gLayout.getGlobalElLayout(gBR).x1 + clWidth/2)
					.attr('cy', gLayout.getGlobalElLayout(gBR).y1 + lbr.h)
					.attr('r', 5);
				
				// If the cluster is lower, start from the first feature, ..., then lastly the cluster
				// If the cluster is upper, start from the cluster, then features
				proto.features.forEach((featureObj, i) => {  // e.g., { Air Pollution: 0, Occupational Hazards: 0, idx: 0 }
					if (i < proto.features.length-1) {
						const currFeatureKey = proto.features[i]['name'],
								nextFeatureKey = proto.features[i+1]['name'];
						const currFeatureValue = proto.features[i]['value'],
								nextFeatureValue = proto.features[i+1]['value'];
						const currCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue)),
								nextCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(nextFeatureKey) + '_' + nextFeatureValue));

						protoPathData.push({
							source: { 
								x: currCatEl.x1 + currCatEl.width/2, 
								y: currCatEl.y1 + lwbr.h
							},
							target: { 
								x: nextCatEl.x1 + nextCatEl.width/2, 
								y: nextCatEl.y1 + lwbr.h
							}
						});
					} else if (i === proto.features.length-1) {
						const currFeatureKey = proto.features[i]['name'];
						const currFeatureValue = proto.features[i]['value'];
						const currCat = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue));

						protoPathData.push({
							source: { 
								x: currCat.x1 + currCat.width/2, 
								y: currCat.y1 + lwbr.h
							},
							target: { 
								x: gLayout.getGlobalElLayout(gBR).x1 + clWidth/2, 
								y: gLayout.getGlobalElLayout(gBR).y1 + lwbr.h
							}
						});
					}
					
				});

				const drawProtoLine = d3.linkVertical()
					.x((d) => d.x)
					.y((d) => d.y);

				gProto
					.selectAll('.proto_path_cl_' + cl.idx)
					.data(protoPathData).enter()
					.append('path')
					.attr('class', 'proto_path proto_path_cl_' + cl.idx)
					.attr('d', drawProtoLine);

				gProto
					.selectAll('.proto_circle_cl_' + cl.idx)
					.data(proto.features).enter()
					.append('circle')
					.attr('class', 'proto_circle proto_circle_cl_' + cl.idx)
					.attr('cx', (d, i) => {
						const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(d.name) + '_' + d.value));
						return catEl.x1 + catEl.width/2;
					})
					.attr('cy', (d, i) => {
						const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(d.name) + '_' + d.value));
						return catEl.y1 + lbr.h;
					})
					.attr('r', 5);

			});
		}

		function renderUpperCls() {
			gBRSet = container
				.append('g')	
				.data([cls])
				.attr('class', 'g_bars g_bars_upper g_bars_lv_' + lvData.idx + ' g_bars_upper_lv_' + lvData.idx)
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
				.attr('transform', (cl, clIdx) => 'translate(' +
					(clScales[cl.idx].range()[0]) + // i*2 is cumulative margin
					',0)'
				);

			gBRs.each(function(cl, clIdx){
				const gBR = d3.select(this),
					clWidth = clScales[cl.idx].range()[1] - clScales[cl.idx].range()[0];
				const proto = cl.prototype;
				let gProto;
				let protoPathData = [], protoCircleData = [];
				console.log('cl_idx: ', cl.idx, clIdx);
				console.log('proto: ', proto);
				gBR
					.append('rect')	
					.attr('class', 'bar_rect bar_rect_lv_' + lvData.idx)
					.attr('x', 0) 
					.attr('y', 0)
					.attr('width', clWidth)
					.attr('height', lbr.h);	

				gBR
					.append('text')
					.attr('class', 'cl_label')
					.attr('x', 0)
					.attr('y', 5)
					.text(cl.idx);

				if (lvData.features.length > 1) {
					gProto = container
						.selectAll('.g_prototype_lv_' + lvData.idx + '_cl_' + cl.idx)
						.data([proto]).enter()
						.append('g')
						.attr('class', 'g_prototype_cl_' + cl.idx)
						.attr('transform', 'translate(0,0)');

					gProto
						.append('circle')
						.attr('class', 'proto_circle proto_circle_upper_' + lvData.idx)
						.attr('cx', gLayout.getGlobalElLayout(gBR).x1 + clWidth/2)
						.attr('cy', gLayout.getGlobalElLayout(gBR).y1 + lbr.h)
						.attr('r', 5);
					
					// If the cluster is lower, start from the first feature, ..., then lastly the cluster
					// If the cluster is upper, start from the cluster, then features
					proto.features.forEach((featureObj, i) => {  // e.g., { Air Pollution: 0, Occupational Hazards: 0, idx: 0 }
						if ((i > 0) && (i < proto.features.length-1)) {
							const currFeatureKey = proto.features[i]['name'],
									nextFeatureKey = proto.features[i+1]['name'];
							const currFeatureValue = proto.features[i]['value'],
									nextFeatureValue = proto.features[i+1]['value'];
							const currCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue)),
									nextCatEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(nextFeatureKey) + '_' + nextFeatureValue));

							protoPathData.push({
								source: { 
									x: currCatEl.x1 + currCatEl.width/2, 
									y: currCatEl.y1 + lwbr.h
								},
								target: { 
									x: nextCatEl.x1 + nextCatEl.width/2, 
									y: nextCatEl.y1 + lwbr.h
								}
							});
						} else if (i === 0) {
							const currFeatureKey = proto.features[i]['name'];
							const currFeatureValue = proto.features[i]['value'];
							const currCat = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(currFeatureKey) + '_' + currFeatureValue));

							protoPathData.push({
								source: { 
									x: gLayout.getGlobalElLayout(gBR).x1 + clWidth/2, 
									y: gLayout.getGlobalElLayout(gBR).y1 + lwbr.h
								},
								target: { 
									x: currCat.x1 + currCat.width/2, 
									y: currCat.y1 + lwbr.h
								}
							});
						}
					});

					const drawProtoLine = d3.linkVertical()
						.x((d) => d.x)
						.y((d) => d.y);

					gProto
						.selectAll('.proto_path_cl_' + cl.idx)
						.data(protoPathData).enter()
						.append('path')
						.attr('class', 'proto_path proto_path_cl_' + cl.idx)
						.attr('d', drawProtoLine);

					gProto
						.selectAll('.proto_circle_cl_' + cl.idx)
						.data(proto.features).enter()
						.append('circle')
						.attr('class', 'proto_circle proto_circle_cl_' + cl.idx)
						.attr('cx', (d, i) => {
							const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(d.name) + '_' + d.value));
							return catEl.x1 + catEl.width/2;
						})
						.attr('cy', (d, i) => {
							const catEl = gLayout.getGlobalElLayout(d3.select('.cat_rect_' + dataMapping.convertStrToUnderbar(d.name) + '_' + d.value));
							return catEl.y1 + lbr.h;
						})
						.attr('r', 5);
				}
				
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