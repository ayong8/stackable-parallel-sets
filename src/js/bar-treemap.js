import * as d3 from 'd3';
import _ from 'lodash';
import { layoutTextLabel, layoutGreedy,
	layoutLabel, layoutRemoveOverlaps } from 'd3fc-label-layout';

import {gColors, l, llv, lbl, lbr, lwbr, gLayout} from './layout';
import {dataMapping} from './dataMapping';

import "../css/index.css";

function BarTreemap() {
	let idx, lvIdx;
	let lvData = {};
	let axis = {
			right: null,
			left: null
	}

	function _bar(container) {
		const selectedLvIdx = lvData.idx;
		const cls = lvData.cls,
			numFeatures = lvData.features.length;
		const featureNames = lvData.features.map(d => d.labels);
		let dataTreemapCatLabelsForCls = [];

		cls.forEach(function(cl){
			// Build up a data
			let dataTreemapsForCl = [];
			const rectWidth = container
				.select('.g_bar.cl_' + cl.idx).select('.bar_rect').attr('width');
			const numClInstances = cl.instances.length;
			const treemapsXScale = d3.scaleBand()
				.domain(d3.range(numFeatures))
				.range([10, rectWidth]);

			lvData.features.forEach(function(feature, featureIdx){
				const featureName = feature.name;

				let dataTreemapForFeature = {};
				dataTreemapForFeature.clIdx = cl.idx;
				dataTreemapForFeature.featureIdx = featureIdx;
				dataTreemapForFeature.x = treemapsXScale(featureIdx);
				if (featureIdx == lvData.features.length-1) {
					dataTreemapForFeature.width = treemapsXScale.range()[1]-treemapsXScale(featureIdx);	
				} else {
					dataTreemapForFeature.width = treemapsXScale(featureIdx+1)-treemapsXScale(featureIdx);	
				}

				dataTreemapForFeature.name = feature.name;
				dataTreemapForFeature.children = [];
				dataTreemapForFeature.ratio = 0;
				console.log('cl.dominantCats[featureName]: ', cl.dominantCats[featureName])
				console.log('cl.instances: ', cl.instances);
				// Determine the most dominant one
				let maxRatioCat = null,
					maxRatio = 0;
				feature.domain.forEach((featureValue) => {
					const instancesForCat = cl.instances.filter(d => d[feature.name] === featureValue),
						catRatio = instancesForCat.length / numClInstances;
					if (maxRatio < catRatio) {
						maxRatioCat = featureValue;
						maxRatio = catRatio;
					}
				});

				// Store all information for each treemap
				feature.domain.forEach((featureValue, i) => {
					const numInstancesForCat = cl.instances.filter(d => d[feature.name] === featureValue).length;
					console.log('calculate: ', cl.idx, feature.name, feature.labels[i], numInstancesForCat / numClInstances)
					const dataTreemapForCat = {
						clIdx: cl.idx,
						featureIdx: featureIdx,
						name: featureValue,
						ratio: numInstancesForCat / numClInstances,
						isDominant: (featureValue === maxRatioCat) ? true : false // (featureValue == cl.dominantCats[featureName]) ? true : false
					}
					dataTreemapForFeature.children.push(dataTreemapForCat);
					dataTreemapCatLabelsForCls.push(dataTreemapForCat);
				});
				dataTreemapsForCl.push(dataTreemapForFeature);
			});
			
			container
				.select('.g_bar.cl_' + cl.idx)
				.selectAll('.g_treemaps')
				.data(dataTreemapsForCl)
				.enter()
				.append('g')
				.attr('class', (d, i) => 'g_treemaps cl_' + d.clIdx + ' feature_' + d.featureIdx)
				.attr('transform', (d, i) => {
					console.log('treemapsXScale(i): ', treemapsXScale(i))
					return 'translate(' + treemapsXScale(i) + ',' + 3 + ')'})
				.each(renderTreemaps);
		});

		console.log('dataTreemapCatLabelsForCls: ', dataTreemapCatLabelsForCls);

		// Collecting all label data and put into the labeling layout at once
		renderLabels(container, selectedLvIdx, dataTreemapCatLabelsForCls, featureNames);

		function renderTreemaps(d, i) {
			const rectForCl = d3.select(this.parentNode).select('.bar_rect').node(),
				rectHeight = gLayout.getElLayout(d3.select(this.parentNode).select('.bar_rect')).height - 6;
			const colorScaleForTreemap = scales.treemapColorScales[i];

			const rootNode = d3.hierarchy(d)
				rootNode.sum(function(d) {
					return d.ratio;
				});

			const treemapLayout = d3.treemap()
				.size([d.width, rectHeight])
				.paddingOuter(2);
			
			treemapLayout.tile(d3['treemapSlice']);
			treemapLayout(rootNode);
		
			const nodes = d3.select(this)
				.selectAll('g')
				.data(rootNode.descendants())
				.enter()
				.append('g')
				.attr('transform', function(d, i) {
					return 'translate(' + [d.x0, d.y0] + ')'
				});
		
			nodes
				.append('rect')
				.attr('class', d => (typeof(d.children) == 'undefined') 
							? 'treemap_rect cl_' + d.data.clIdx + ' feature_' + d.data.featureIdx + ' cat_' + d.data.name 
							: 'treemap_rect cl_' + d.data.clIdx + ' feature_' + d.data.name
				)
				.attr('width', function(d) { return d.x1 - d.x0; })
				.attr('height', function(d) { return d.y1 - d.y0; })
				.style('fill', d => {
					return colorScaleForTreemap(d.data.ratio)
				})
				.style('stroke', d => (typeof(d.children) == 'undefined') ? 'white' : 'transparent')
				.style('stroke-width', d => (typeof(d.children) == 'undefined') ? '1px' : '3px')
				.on('mouseover', d => console.log(gLayout.getGlobalElLayout(d3.select(this))));
		}

		function renderLabels(container, selectedLvIdx, dataTreemapCatLabelsForCls, featureNames) {
			// the component used to render each label
			const labelPadding = 2;
			const labelTopSpacing = 20;
			const textLabel = layoutTextLabel()
				.padding(labelPadding)
				.value(function(d) { 
					return featureNames[d.featureIdx][d.name]; 
				});

			// a strategy that combines simulated annealing with removal
			// of overlapping labels
			const strategy = layoutRemoveOverlaps(layoutGreedy());

			// create the layout that positions the labels
			const labels = layoutLabel(strategy)
					.size(function(d, i, g) {
							// measure the label and add the required padding
							var textSize = d3.select(g[i])
									.select('text')
									.attr('class', d => 'treemap_label cl_' + d.clIdx + ' cat_' + d.name)
									.node()
									.getBBox();
							
							d3.select(g[i])
								.select('rect')
								.attr('class', d => 'treemap_rect cl_' + d.clIdx + ' cat_' + d.name)
								.style('fill', d => {
									console.log('label rect fill: ', d.ratio)
									return scales.treemapColorScales[d.featureIdx](d.ratio)
								});
							return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
					})
					.position(function(d) {
						return [
							gLayout.getGlobalElLayout(container.select('.g_treemaps.cl_' + d.clIdx + '.feature_' + 0)).x1, 
							gLayout.getElLayout(container.select('.g_treemaps.cl_' + d.clIdx + '.feature_' + d.featureIdx)).y1 - labelTopSpacing*(d.featureIdx+1)
						]; 
					})
					.component(textLabel);

			// g_bars element to put all labels of clusters at once
			let gBarSelection = (lvData.idx == 0) 
						? d3.select('.g_bars.lower.lv_' + lvData.idx)
						: d3.select('.g_bars.upper.lv_' + lvData.idx);

			gBarSelection
				.append('g')
				.attr('class', 'g_labels')
				.datum(
					dataTreemapCatLabelsForCls
						.filter(d => {
							return d.isDominant
						})
					)
					.call(labels);

			d3.selectAll('.label > rect')
				.each(function(d){
					const catLabel = d3.select(this);
					// Select the corresponding cat rect in treemap
					const gBars = d3.select('.g_bars.upper.lv_' + selectedLvIdx);
					const treemapForFeature = gBars
							.select('.g_treemaps.cl_' + d.clIdx + '.feature_' + d.featureIdx);
					const catRect = treemapForFeature
							.select('.treemap_rect.cat_' + d.name);	

					// console.log('selected .g_bars: ', d3.select('.g_bars.upper.lv_' + selectedLvIdx).attr('class'));
					// console.log('catRect: ', catRect.attr('class'));
					// console.log('cat Rect position: ', gLayout.getGlobalElLayout(catRect))
					// d3.select('.container')
					// 	.append('line')
					// 	.attr('class', 'treemap_line_label_to_cat' + ' cl_' + d.clIdx + ' feature_' + d.featureIdx + ' cat_' + d.name)
					// 	.attr('x1', function(d){ 
					// 		return gLayout.getGlobalElLayout(catLabel).x1 + gLayout.getGlobalElLayout(catLabel).width/2
					// 	})
					// 	.attr('x2', function(d){ 
					// 		return gLayout.getGlobalElLayout(catRect).x1 + gLayout.getGlobalElLayout(catRect).width/2
					// 	})
					// 	.attr('y1', function(d){ 
					// 		return gLayout.getGlobalElLayout(catLabel).y2
					// 	})
					// 	.attr('y2', function(d){ 
					// 		return gLayout.getGlobalElLayout(catRect).y1
					// 	});

				})
				.on('mouseover', d => console.log(d));

			d3.selectAll('.label > text')
			.on('mouseover', function(d) { console.log(gLayout.getGlobalElLayout(d3.select(this)))});
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

export default BarTreemap;