import * as d3 from 'd3';
import skmeans from 'skmeans';
import d3tooltip from 'd3-tooltip';
import { globalScales, scales } from './scale';
import { gLayout, l, ll, lbr, lCom } from './layout';
import { data } from './data';

import Container from './container';
import { controller } from './controller';
import Level from './level';
import Block from './block';
import BarTreemap from './bar-treemap';

import '../css/bootstrap_submenu.css';
import "../css/index.css";

const container = d3.select('#container');
const tooltip = d3tooltip(d3);

let LVData = [];
let numAllInstances = 0;
let selectedGroups = [null, null];
let clSortingOpt = [];
const featuresForSorting = {
  'cancer': ['QOL'],
  'demoemo': ['life_satisfaction']
}

clSortingOpt = 'layout_optimization'
renderInterface();
renderRun();
fetchForInitialLoad(clSortingOpt);

function fetchForInitialLoad(sortClsBy) {
  fetch('/dataset/loadData/', {
    method: 'get'
  })
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    const datasetAbbr = response.datasetAbbr,
          rawData = JSON.parse(response.dataset),
          rawDataForBp = JSON.parse(response.datasetForBp), // bp = bipartite
          features = response.features,
          instances = JSON.parse(response.instances);
  
    LVData = data.mapLevelToFeatures(datasetAbbr, features, rawDataForBp);
    // updateLVData();
    controller(LVData, features);
    //data.mapLevelToFeatures(datasetAbbr, features, rawDataForBp);
    l.h = LVData.length * 250;

    // Render the levels given clustering result
    return fetch('/dataset/hClusteringForAllLVs/', {
      method: 'post',
      body: JSON.stringify({
        data: LVData,
        instances: instances,
        sortClsBy: sortClsBy
      })
    }).then((response) => {
      return response.json();
    }).then((response) => {
      const clResult = response.clResult,
        sortedCatsIdxForLvs = response.sortedCatsIdxForLvs,
        dominantClsForLvs = response.dominantClsForLvs,
        pairwiseCorrs = response.pairwiseCorrs,
        totalFreqsForLvs = response.totalFreqsForLvs,
        bipartiteMat = response.bipartiteMat;

      LVData.forEach((lvData, lvIdx) => {
        // Assign data to sort clusters
        const sortedCls = _.sortBy(clResult[lvIdx], ['sortedIdx']);
        

        lvData.pairwiseCorrs = pairwiseCorrs[lvIdx];
        lvData.dominantCl = dominantClsForLvs[lvIdx];
        lvData.btnMode.totalFreqCnt = totalFreqsForLvs[lvIdx];

        lvData.cls = sortedCls;
        if (lvData.btnMode.bipartiteMode == 0) {
          lvData.clScales = scales.calculateScalesForCls(lvData.btnMode.bipartiteMode, sortedCls, llv.w, rawData.length);
          lvData.btnMode.bipartiteMat = bipartiteMat;
        }
        else if (lvData.btnMode.bipartiteMode == 1) {
          lvData.clScales = scales.calculateScalesForCls(lvData.btnMode.bipartiteMode, sortedCls, llv.w, lvData.btnMode.totalFreqCnt);
          lvData.btnMode.bipartiteMat = bipartiteMat;
        }
        
          // Assign dominant cluster information
        lvData.cls.forEach((cl) => (cl.idx === dominantClsForLvs[lvIdx]) 
          ? cl.isDominant = true
          : cl.isDominant = false 
        );
  
        // Assign data to sort categories
        lvData.features.forEach((feature, featureIdx) => {
          const numCats = feature.domain.length;
          feature.sortedInstances = [];
          feature.cats = [];
          // Determine to sort or not sort
          // feature.sortedIdx = sortedCatsIdxForLvs[lvIdx][featureIdx];
          feature.sortedIdx = feature.domain;
          
          feature.instances.forEach((instanceSet, i) => {
            feature.sortedInstances[feature.sortedIdx[i]] = instanceSet;
          });
  
          for(let i=0; i<numCats; i++) {
            feature.cats[i] = {
              idx: feature.sortedIdx[i],
              sortedIdx: i,
              label: feature.labels[feature.sortedIdx[i]],
              instances: feature.sortedInstances[i]
            };
          }
  
          const { scale, catScales } = scales.setScaleToFeature(rawData, feature, llv.w);
          feature.scale = scale;
          feature.catScales = catScales;
        })
      });
        
      // userid,tweet,relationship,iq,gender,age,political,optimism,children,religion,race,income,education,life_satisfaction
      const svg = container
        .append('svg')
        .attr('width', l.w)
        .attr('height', l.h)
        .attr('class', 'svg');
      const container1 = Container();
  
      svg.call(
        container1
          .data([
            rawData,
            LVData,
            instances
          ])
      );

      //**** Events
      d3.selectAll('.cat_rect')
          .on('click', function(d) {
          })
          .on('mouseover', function(d) {
            const featureName = d3.select(this).attr('class').split(' ')[1].split('_')[2];

            d3.select(this).classed('cat_rect_mouseovered', true);
            const catToCatLineHtml =
              '<div style="font-weight: 600">' +
              'Instances: ' +
              d.instances.length +
              '</br>' +
              '</div>';

            tooltip.html(catToCatLineHtml);
            tooltip.show();

            d3.selectAll('.cat_line' + '.feature_' + featureName + '_cat_' + d.sortedIdx)
                .classed('cat_line_mouseovered', true);
          })
          .on('mouseout', function(d) {
            const featureName = d3.select(this).attr('class').split(' ')[1].split('_')[2];
            d3.select(this).classed('cat_rect_mouseovered', false);
            tooltip.hide();

            d3.selectAll('.cat_line' + '.feature_' + featureName + '_cat_' + d.sortedIdx)
                .classed('cat_line_mouseovered', false);
          });

      //*** Select a subgroup
      d3.selectAll('.bar_rect')
          .on('click', function(selectedCl) {
            const selectedBar = d3.select(this), 
                selectedLV = selectedCl.lvIdx,   
                selectedClIdx = selectedCl.idx;
            const selectedInstancesIdx = selectedCl.instances.map(d => d.idx);
            const dominantClsForSubgroup1 = [
              // { lv: 0, cl: 2 },
            ],
              dominantClsForSubgroup2 = [];

            const isSelected = selectedBar.classed('bar_rect_selected') || selectedBar.classed('bar_rect_selected2');
            const isFirstSelected = d3.select('.bar_rect_selected'),
              isSecondSelected = d3.select('.bar_rect_selected2');
            let mode = null;
            // Select the color scale to color other levels (to determine two-groups or one-group based coloring),
            let selectedClColorScale = null;
            let selectedCatColorScale = null;
            let selectedInGroupRatioFunc = null;

            // Register the selections
            if (isSelected == false) {
              if (LVData[selectedLV].mode.folded == true) {
                changeClassed([
                  { selectedTreemapLabels: d3.select(this.parentNode.parentNode).selectAll('.treemap_label.cl_' + selectedClIdx), 
                    class: 'treemap_label_for_selected', 
                    classed: true 
                  }
                ]);
              }

              if (isFirstSelected.empty() && isSecondSelected.empty()) { // Both wasn't selected
                mode = 'first';
                selectedBar.classed('bar_rect_selected', true); // Put in the first one
                
                // Color by one group
                selectedClColorScale = scales.colorClOnSelectScale;
                selectedCatColorScale = scales.colorCatOnSelectScale;
                selectedInGroupRatioFunc = calculateInGroupRatio;
              } else if (!isFirstSelected.empty() && isSecondSelected.empty()) { // First one was selected
                mode = 'both';
                selectedBar.classed('bar_rect_selected2', true); // Put in the second one
                
                // Color by two groups
                selectedClColorScale = scales.colorClOnSelectTwoGroupsScale;
                selectedCatColorScale = scales.colorCatOnSelectTwoGroupsScale;
                selectedInGroupRatioFunc = calculateInGroupRatioForTwoGroups;
              } else if (isFirstSelected.empty() && !isSecondSelected.empty()) { // Second one was selected
                mode = 'both'
                selectedBar.classed('bar_rect_selected', true); // Put in the first one
                selectedClColorScale = scales.colorClOnSelectTwoGroupsScale;
                selectedCatColorScale = scales.colorCatOnSelectTwoGroupsScale;
                selectedInGroupRatioFunc = calculateInGroupRatioForTwoGroups;
              } else { // Both are selected
                mode = 'both'
                isSecondSelected.classed('bar_rect_selected2', false); // cancel the current second one
                selectedBar.classed('bar_rect_selected2', true); // Put in the second one
                selectedClColorScale = scales.colorClOnSelectTwoGroupsScale;
                selectedCatColorScale = scales.colorCatOnSelectTwoGroupsScale;
                selectedInGroupRatioFunc = calculateInGroupRatioForTwoGroups;
              }
              // cancelSelection(selectedClColorScale);
              colorByTwoGroups(mode, selectedClColorScale, selectedCatColorScale, selectedInGroupRatioFunc);
            }
            else {  // if the bar was already selected
              if (LVData[selectedLV].mode.folded == true) {
                changeClassed([
                  { selectedTreemapLabels: d3.select(this.parentNode.parentNode).selectAll('.treemap_label.cl_' + selectedClIdx), 
                    class: 'treemap_label_for_selected', 
                    classed: false 
                  }
                ]);
              }

              if (!isFirstSelected.empty() && isSecondSelected.empty()) {
                selectedBar.classed('bar_rect_selected', false);
                // Come back to initial color
                d3.selectAll('.cl_line')
                  .style('stroke', '');
                d3.selectAll('.cat_line')
                  .style('stroke', '');
                d3.selectAll('.cat_rect')
                  .style('fill', '')
                  .style('fill-opacity', '');
                d3.selectAll('.bar_rect')
                  .style('fill', '')
                  .style('fill-opacity', '');
                d3.selectAll('.g_block_icons')
                  .style('opacity', '');

                changeClassed([
                  { class: 'proto_dominant_circle',  classed: false },
                  { class: 'proto_dominant',  classed: false },
                  { class: 'cat_line_dominant_for_all', classed: true }
                ]);
              } else if (isFirstSelected.empty() && !isSecondSelected.empty()) {
                selectedBar.classed('bar_rect_selected2', false);
                d3.selectAll('.cl_line')
                  .style('stroke', '');
                d3.selectAll('.cat_line')
                  .style('stroke', '');
                d3.selectAll('.cat_rect')
                  .style('fill', '')
                  .style('fill-opacity', '');
                d3.selectAll('.bar_rect')
                  .style('fill', '')
                  .style('fill-opacity', '');
                d3.selectAll('.g_block_icons')
                  .style('opacity', '');

                changeClassed([
                  { class: 'proto_dominant_circle2',  classed: false },
                  { class: 'proto_dominant2',  classed: false },
                  { class: 'cat_line_dominant_for_all', classed: true }
                ]);
              } else if (!isFirstSelected.empty() && !isSecondSelected.empty()) {
                mode = 'first'
                selectedBar.classed('bar_rect_selected2', false);
                isSecondSelected.classed('bar_rect_selected2', false); // cancel the current second one
                // cancelSelection(selectedClColorScale);
                selectedClColorScale = scales.colorClOnSelectScale;
                selectedCatColorScale = scales.colorCatOnSelectScale;
                selectedInGroupRatioFunc = calculateInGroupRatioForTwoGroups;

                changeClassed([
                  { class: 'proto_dominant_circle',  classed: false },
                  { class: 'proto_dominant_circle2',  classed: false },
                  { class: 'proto_dominant',  classed: false },
                  { class: 'proto_dominant2',  classed: false }
                ]);
                colorByTwoGroups(mode, selectedClColorScale, selectedCatColorScale, selectedInGroupRatioFunc);
              }
            }

            function changeClassed(changeArr) {
              const protoCircles = d3.selectAll('.proto_circle'),
                protoPaths = d3.selectAll('.proto_path'),
                dominantCatLines = d3.selectAll('.cat_line')
                    .filter(d => d.isOutlier == false);

              changeArr.forEach(d => {
                switch(d.class) {
                  case 'proto_dominant_circle':
                    protoCircles
                      .classed('proto_dominant_circle', d.classed);
                    break;
                  case 'proto_dominant_circle2':
                    protoCircles
                      .classed('proto_dominant_circle2', d.classed);
                    break;
                  case 'proto_dominant':
                    protoPaths
                      .classed('proto_dominant', d.classed);
                    break;
                  case 'proto_dominant2':
                    protoPaths
                      .classed('proto_dominant2', d.classed);
                    break;
                  case 'cat_line_dominant_for_all':
                    dominantCatLines
                      .classed('cat_line_dominant_for_all', d.classed);
                  case 'treemap_label_for_selected':
                    const selectedTreemapLabels = d.selectedTreemapLabels;
                    selectedTreemapLabels
                      .classed('treemap_label_for_selected', d.classed);
                }
              });
            }
            
            function colorByTwoGroups(mode, selectedClColorScale, selectedCatColorScale, selectedInGroupRatioFunc) {
              // other bars in the same level
              d3.selectAll('.bar_rect_lv_2')  
                .filter((cl) => cl.idx !== selectedClIdx)
                .classed('not_selected', true);

              // Hide all proto circles but corresponding circles
              d3.selectAll('.proto_circle')
                .classed('proto_circle_hidden', true);
              d3.selectAll('.proto_circle' + '.lv_' + selectedLV + '.cl_' + selectedClIdx)
                .classed('proto_circle_hidden', false)
                .attr('r', function(d){
                  const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === d.value)
                  return scales.protoCircleRScale(selectedInGroupRatioFunc(false, instancesInSelectedCat, selectedCl.instances))
                });

              // Color other bars, wtn-lines and btn-lines
              // Go over other levels
              const inGroupRatioThreshold = 0.2;
              LVData.forEach((lvData, lvIdx) => {
                // Go over calculated ratios and pick the best one -- to 'dominantClsForSubgroup'                
                if (selectedLV < LVData.length) {
                  // Calculate dominant clusters
                  // If two groups are selected, 
                    // the higher the inGroupRatio, more dominant by first group
                    // the lower the inGroupRatio, more dominant by second group
                  let maxInGroupRatioForClLine = 0;
                  let minInGroupRatio = 1;
                  let clLineIdxWithMax = null;
                  let clLineIdxWithMin = null;
                  let dominantPrototype = null;
                  let clIdxWithMaxGroupRatio = 0;
                  let clIdxWithMinGroupRatio = 0;
                  let maxInGroupRatioForCl = 0;
                  let minInGroupRatioForCl = 1;

                  const clLinesBtnLvs = d3.select('.g_btn_lvs' + '.lv_' + lvIdx)
                      .selectAll('.cl_line')
                      .style('stroke', clToCl => {
                        if (mode == 'both') {
                          return selectedClColorScale(selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, clToCl.instancesClToCl, selectedCl.instances));
                        } else {
                          return selectedClColorScale(selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, clToCl.instancesClToCl, selectedCl.instances));
                        }
                      });

                  clLinesBtnLvs
                    .style('opacity', 0);
                    
                  // The most dominant cl_line for the first group
                  console.log('lvIdx: ', lvIdx)
                  const dominantClInLv = d3.select('.g_bars.lv_' + lvIdx)
                    .selectAll('.bar_rect')
                    .each((cl) => {
                      if (lvData.btnMode.bipartiteMode == 1) {
                        selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, cl.instances, selectedCl.instances);
                      }
                      const inGroupRatio = selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, cl.instances, selectedCl.instances);
                        
                      if (inGroupRatio > maxInGroupRatioForCl) {
                        clIdxWithMaxGroupRatio = cl.idx;
                        maxInGroupRatioForCl = inGroupRatio;
                      }
                    });

                  dominantClsForSubgroup1.push({
                    lv: lvIdx,
                    cl: clIdxWithMaxGroupRatio
                  });
                      
                  const dominantClLine = clLinesBtnLvs 
                    .each((clToCl, i) => {
                      const inGroupRatio = selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, clToCl.instancesClToCl, selectedCl.instances);
                      // Identify the element with max inGroupRatio
                      if (inGroupRatio >= maxInGroupRatioForClLine) {
                        maxInGroupRatioForClLine = inGroupRatio;
                        clLineIdxWithMax = i;
                      }
                    })
                    .filter((clToCl, i) => i === clLineIdxWithMax)
                    .classed('cl_line_dominant', true);

                  // Color prototypes of dominant clusters
                  // dominantClLine
                  //   .each(function(clToCl) {
                  //     const dominantCl = clToCl.clCurrIdx;
                  //     d3.selectAll('.g_prototype.lv_' + lvIdx + '.cl_' + dominantCl + '> path')
                  //       .classed('proto_dominant', true);
                  //     d3.selectAll('.g_prototype.lv_' + lvIdx + '.cl_' + dominantCl + '> circle')
                  //       .classed('proto_dominant_circle', true);
                  //   });

                  // Do the same thing for the second group when two groups are selected
                  if (mode == 'both') {
                    const dominantClInLv = d3.select('.g_bars.lv_' + lvIdx)
                      .selectAll('.bar_rect')
                      .each((cl) => {
                        if (lvData.btnMode.bipartiteMode == 1) {

                        }
                        const inGroupRatio = selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, cl.instances, selectedCl.instances);

                        if (inGroupRatio <= minInGroupRatioForCl) {
                          clIdxWithMinGroupRatio = cl.idx;
                          minInGroupRatioForCl = inGroupRatio;
                        }
                      });

                    dominantClsForSubgroup2.push({
                      lv: lvIdx,
                      cl: clIdxWithMinGroupRatio
                    });

                    const dominantClLineBySecond = clLinesBtnLvs // The most dominant cl_line for the first group
                      .each((clToCl, i) => {
                        const inGroupRatio = selectedInGroupRatioFunc(lvData.btnMode.bipartiteMode, clToCl.instancesClToCl, selectedCl.instances);
                        // Identify the element with max inGroupRatio
                        if (inGroupRatio <= minInGroupRatio) {
                          minInGroupRatio = inGroupRatio;
                          clLineIdxWithMin = i;
                        }
                      })
                      .filter((clToCl, i) => i === clLineIdxWithMin)
                      .classed('cl_line_dominant', true);

                    // Color prototypes of dominant clusters
                    // dominantClLineBySecond
                    //   .each(function(clToCl) {
                    //     const dominantCl = clToCl.clCurrIdx;
                    //     d3.selectAll('.g_prototype.lv_' + lvIdx + '.cl_' + dominantCl + '> path')
                    //       .classed('proto_dominant2', true);
                    //     d3.selectAll('.g_prototype.lv_' + lvIdx + '.cl_' + dominantCl + '> circle')
                    //       .classed('proto_dominant_circle2', true);
                    //   });
                  }
                }

                // Color all within-edges
                // lvData.features.forEach(function(feature, featureIdx) {
                //   let maxInGroupRatio = 0;
                //   let minInGroupRatio = 1;
                //   let catLineIdxWithMax = null;
                //   let catLineIdxWithMin = null;

                //   if (featureIdx < lvData.features.length) {

                //     const catLinesBtnLvs = d3.select('.g_btn_bls' + '.bl_' + feature.id)
                //       .selectAll('.cat_line')
                //       .style('stroke', catToCat => {
                //         calculateInGroupRatioForTwoGroups
                //         if (mode == 'both') {
                //           return selectedClColorScale(selectedInGroupRatioFunc(catToCat.instancesInCatToCat, selectedCl.instances));
                //         } else {
                //           return selectedClColorScale(selectedInGroupRatioFunc(catToCat.instancesInCatToCat, selectedCl.instances));
                //         }
                //       });

                //     catLinesBtnLvs
                //       .each((catToCat, i) => {
                //         const inGroupRatio = selectedInGroupRatioFunc(catToCat.instancesInCatToCat, selectedCl.instances);
                //         // Identify the element with max inGroupRatio
                //         if (inGroupRatio >= maxInGroupRatio) {
                //           minInGroupRatio = inGroupRatio;
                //           catLineIdxWithMax = i;
                //         }
                //       })
                //       .filter((catToCat, i) => i === catLineIdxWithMax)
                //       .classed('cat_line_dominant', true);
                //   }
                // })
              });

              d3.selectAll('.cat_line')
                .classed('cat_line_dominant_for_all', false);

              // Highlight dominant clusters
              console.log('dominantClsForSubgroup: ', dominantClsForSubgroup1);
              dominantClsForSubgroup1.forEach(function(d) {
                d3.selectAll('.proto_path' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_dominant', true)
                  .style('stroke-width', function(e){
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === e.value)
                    return scales.protoPathScale(selectedInGroupRatioFunc(LVData[d.lv].btnMode.bipartiteMode, instancesInSelectedCat, selectedCl.instances));
                  })
                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_dominant_circle', true);

                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_circle_hidden', false);
              });

              dominantClsForSubgroup2.forEach(function(d) {
                d3.selectAll('.proto_path' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_dominant2', true)
                  .style('stroke-width', function(e){
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[e.name] === e.value)
                    return scales.protoPathScale(selectedInGroupRatioFunc(LVData[d.lv].btnMode.bipartiteMode, instancesInSelectedCat, selectedCl.instances));
                  })
                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_dominant_circle2', true);

                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_circle_hidden', false);
              });

              // Color cluster bars
              d3.selectAll('.bar_rect')  // 
                .filter(function(cl) {
                  return cl.lvIdx !== selectedLV
                })
                .style('fill', function(cl){
                  return selectedClColorScale(selectedInGroupRatioFunc(LVData[cl.lvIdx].btnMode.bipartiteMode, cl.instances, selectedCl.instances));
                });

              d3.selectAll('.secondary_instance_circle')  // 
                .filter(function(item) {
                  return item.lvIdx !== selectedLV
                })
                .style('fill', function(item){
                  return selectedClColorScale(selectedInGroupRatioFunc(LVData[item.lvIdx].btnMode.bipartiteMode, item.instances, selectedCl.instances));
                });

              // Highlight the protos
              d3.selectAll('.proto_path' + '.lv_' + selectedLV + '.cl_' + selectedClIdx)
                .classed('proto_path_selected', true);
              d3.selectAll('.proto_circle' + '.lv_' + selectedLV + '.cl_' + selectedClIdx)
                .classed('proto_circle_selected', true);

              // Color cat bars
              d3.selectAll('.cat_rect')
                .style('fill', function(cat){
                  return selectedClColorScale(selectedInGroupRatioFunc(false, cat.instances, selectedCl.instances));
                });

              // Hide the block icons
              d3.selectAll('.g_block_icons')
                .style('opacity', 0);
            }

          })
          .on('mouseover', function(d) {
            console.log('d on bar_rect: ', d);
            if (LVData[d.lvIdx].mode.folded == true) {
              d3.select(this.parentNode.parentNode) // g_bars
                .selectAll('.treemap_label.cl_' + d.idx)
                .classed('treemp_label_mouseovered', true);

              d3.selectAll('.cl_line' + '.from_lv_' + d.lvIdx + '_cl_' + d.idx)
                .classed('cl_line_mouseovered', true);
            } else {
              d3.select(this).classed('bar_rect_mouseovered', true);
              d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
                .classed('proto_circle_mouseovered', true)
                .classed('proto_circle_hidden', false);
              d3.selectAll('.proto_path.lv_' + d.lvIdx + '.cl_' + d.idx)
                .classed('proto_path_mouseovered', true);
            }
            d3.selectAll('.cl_line' + '.from_lv_' + d.lvIdx + '_cl_' + d.idx)
                .classed('cl_line_mouseovered', true);
            d3.selectAll('.cl_line' + '.to_lv_' + d.lvIdx + '_cl_' + d.idx)
                .classed('cl_line_mouseovered', true);
          })
          .on('mouseout', function(d) {
            if (LVData[d.lvIdx].mode.folded == true) {
              d3.select(this.parentNode.parentNode) // g_bars
                .selectAll('.treemap_label.cl_' + d.idx)
                .classed('treemp_label_mouseovered', false);
            } else {
              d3.select(this).classed('bar_rect_mouseovered', false);
              d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
                .classed('proto_circle_mouseovered', false)
                .classed('proto_circle_hidden', true);
              d3.selectAll('.proto_path.lv_' + d.lvIdx + '.cl_' + d.idx)
                .classed('proto_path_mouseovered', false)
                .classed('proto_path_selected', false);
            }
            d3.selectAll('.cl_line' + '.from_lv_' + d.lvIdx + '_cl_' + d.idx)
                .classed('cl_line_mouseovered', false);
            d3.selectAll('.cl_line' + '.to_lv_' + d.lvIdx + '_cl_' + d.idx)
                .classed('cl_line_mouseovered', false);
          });

      d3.selectAll('.proto_circle')
          .on('mouseover', function(d) { 
            const gProto = d3.select(this.parentNode);
            const lvIdx = d3.select(this.parentNode).attr('class').split(' ')[1].split('_')[1],
              clIdx = d3.select(this.parentNode).attr('class').split(' ')[2].split('_')[1];

            d3.selectAll('.proto_circle.lv_' + lvIdx + '.cl_' + clIdx)
              .classed('proto_circle_hidden', false);
            d3.selectAll('.proto_path.lv_' + lvIdx + '.cl_' + clIdx)
              .classed('proto_path_mouseovered', true);
            gProto.selectAll('.proto_circle')
              .classed('proto_circle_selected', true);
            
          })
          .on('mouseout', function(d) {
            const gProto = d3.select(this.parentNode);
            const lvIdx = d3.select(this.parentNode).attr('class').split(' ')[1].split('_')[1],
              clIdx = d3.select(this.parentNode).attr('class').split(' ')[2].split('_')[1];

            d3.selectAll('.proto_path.lv_' + lvIdx + '.cl_' + clIdx)
              .classed('proto_path_mouseovered', false);
            d3.selectAll('.proto_path.lv_' + lvIdx + '.cl_' + clIdx)
              .style('stroke-width', '');
            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_selected', false);
            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_hidden', true);
            
          })
          .on('click', function(d) {
            const gProto = d3.select(this.parentNode);
            const selectedProto = d3.select(this);

            if (selectedProto.classed('proto_path_selected')) {
              selectedProto.classed('proto_path_selected', false);
              gProto.selectAll('.proto_path')
                .classed('proto_path_selected', false);
            } else {
              selectedProto.classed('proto_path_selected', true);
              gProto.selectAll('.proto_path')
                .classed('proto_path_selected', true);
            }
            
          });

      d3.selectAll('.block_icon')
          .on('click', function(feature){
            const blIcon = d3.select(this);

            if (blIcon.classed('feature_selected') == false) {
              blIcon.classed('feature_selected', true);
              // Rerun the cluster
              

              // const numCats = feature.cats.length,
              //   cForCats = ['red', 'blue'];

              // const colorBtnRatiosScale = d3.scaleLinear()
              //   .domain([0, 0.5, 1])
              //   .range(['red', 'whitesmoke', 'blue']);
              
              // const selectedCat1 = feature.cats[0],
              //   selectedCat2 = feature.cats[1];
              
              // d3.selectAll('.cat_rect')
              //   .style('fill', function(cat){
              //     const inGroupRatio1 = calculateInGroupRatio(cat.instances, selectedCat1.instances),
              //       inGroupRatio2 = calculateInGroupRatio(cat.instances, selectedCat2.instances);

              //     const groupRatio1 = calculateGroupRatio(cat.instances, selectedCat1.instances),
              //       groupRatio2 = calculateGroupRatio(cat.instances, selectedCat2.instances);
              //     const ratioBtnInGroupRatio = inGroupRatio1 / (inGroupRatio1 + inGroupRatio2);
              //     const ratioBtnTwoGroups = groupRatio1 / (groupRatio1 + groupRatio2);
              //     console.log('ratioBtnInGroupRatio: ', ratioBtnInGroupRatio, colorBtnRatiosScale(ratioBtnInGroupRatio));
              //     console.log('ratioBtnTwoGroups: ', ratioBtnTwoGroups, colorBtnRatiosScale(ratioBtnTwoGroups));
                  
              //     return colorBtnRatiosScale(ratioBtnInGroupRatio);
              //   })
              //   .style('fill-opacity', 0.9);
            } else {
              blIcon.classed('feature_selected', false);
              d3.selectAll('.cat_rect')
                .style('fill', '');
            }
            
          });

      d3.selectAll('.level_fold_button')
          .on('click', function(lvData){
            // Calculate the y-coord difference between two level bars
            const gSelectedLv = d3.select('.g_level_' + lvData.idx);
            const yDiff = lvData.mode.height + 10; // 10 == level_bar_width

            if (lvData.mode.folded === false) {
              LVData[lvData.idx].mode.folded = true;
              foldOnClickButton(true, yDiff);
            } else if (lvData.mode.folded === true) {
              LVData[lvData.idx].mode.folded = false;
              foldOnClickButton(false, yDiff);
            }

            function foldOnClickButton(folded, yDiff) {
              let add5 = 5;
              let minus5 = -5;
              let minus10 = -10;
              if (folded === false){
                yDiff = -yDiff;
                add5 = -add5;
                minus5 = -minus5;
                minus10 = -minus10;
              }

              const gBarsLowerSelected = d3.selectAll('.g_bars.lower' + '.lv_' + lvData.idx),
                gBarsUpperSelected = d3.selectAll('.g_bars.upper' + '.lv_' + lvData.idx),
                gBtnLvsSelected = d3.selectAll('.g_btn_lvs' + '.lv_' + lvData.idx);
              const bottomBar = d3.select('.g_level_' + lvData.idx + ' > .level_bar_bottom'),
                topBar = d3.select('.g_level_' + lvData.idx + ' > .level_bar_top'),
                foldButton = d3.select('.g_level_' + lvData.idx + ' > .level_fold_button'),
                lvLabel = d3.select('.g_level_' + lvData.idx + ' > .level_label');
              const gTreemapsInUpperBars = d3.selectAll('.g_bar.upper' + '.lv_' + lvData.idx).selectAll('.g_treemaps'),
                gTreemapsInLowerBars = d3.selectAll('.g_bar.lower' + '.lv_' + lvData.idx).selectAll('.g_treemaps'),
                gLabelsInUpperBars = gBarsUpperSelected.select('.g_labels'),
                gLabelsInLowerBars = gBarsLowerSelected.select('.g_labels');


              const Treemap = BarTreemap();
              
              // make within-level transparent or back to it
              d3.selectAll('.g_level_' + lvData.idx + ' > *')
                .filter(function(d) {
                  return (d3.select(this).attr('class') != null) && 
                    ((d3.select(this).attr('class').split(' ')[0] != 'level_bar') &&
                    (d3.select(this).attr('class').split(' ')[0] != 'level_label') &&
                    (d3.select(this).attr('class').split(' ')[0] != 'level_fold_button'))
                })
                .classed('level_folded', folded); // 'true' == make it transparent because it was folded
              d3.selectAll('.g_prototype' + '.lv_' + lvData.idx)
                .classed('level_folded', folded);
              d3.selectAll('.g_prototype' + '.lv_' + lvData.idx)
                .classed('level_folded', folded);

              // Adjust the layout for the selected level
              repositionEl(bottomBar, yDiff);
              repositionEl(foldButton, yDiff);
              repositionEl(lvLabel, yDiff);
              if (folded == true){
                repositionEl(gBarsLowerSelected, yDiff);
                repositionEl(gBtnLvsSelected, yDiff);

                // Hide the gBars and create treemap
                if (lvData.idx === 0) {
                  gBarsUpperSelected
                    .selectAll('.bar_rect')
                    .attr('height', lbr.h*2);
                  topBar.style('opacity', 0);
                  bottomBar.style('opacity', 0);

                  gBarsLowerSelected
                    .call(
                      Treemap
                      .data(lvData)
                    );
                } else {
                  gBarsUpperSelected
                    .selectAll('.bar_rect')
                    .attr('height', lbr.h*2);
                  gBarsLowerSelected.style('opacity', 0);
                  bottomBar.style('opacity', 0);
                  topBar.style('opacity', 0);

                  gBarsUpperSelected
                    .call(
                      Treemap
                      .data(lvData)
                    );
                }
              } else if (folded == false) {
                repositionEl(gBarsLowerSelected, yDiff);
                repositionEl(gBtnLvsSelected, yDiff);

                gBarsUpperSelected
                  .selectAll('.bar_rect')
                  .attr('height', lbr.h);
                gBarsLowerSelected.style('opacity', '');
                bottomBar.style('opacity', '');
                topBar.style('opacity', '');

                gTreemapsInUpperBars.remove();
                gLabelsInUpperBars.remove();
              }

              // Adjust all components below the selected level
              LVData.slice(lvData.idx+1).forEach(function(d){
                repositionEl(d3.select('.g_level_' + d.idx), yDiff);
                repositionEl(d3.selectAll('.g_bars' + '.lv_' + d.idx), yDiff);
                if (d.idx <= LVData.length-2) {
                  repositionEl(d3.selectAll('.g_btn_lvs' + '.lv_' + d.idx), yDiff);
                }
                if (d.features.length > 1) { // A level with only one feature doesn't have proto components
                  repositionEl(d3.selectAll('.proto_circle' + '.lv_' + d.idx), yDiff);
                  repositionEl(d3.selectAll('.proto_path' + '.lv_' + d.idx), yDiff);
                }
              });
            }
          });
      // Compute repositioning
      function repositionG(selection, yDiff) {
        return selection
                .attr('transform', function(e) {
                  return 'translate(' + 0 + ',' + (gLayout.getGlobalElLayout(d3.select(this)).y1-yDiff) + ')'
                });
      }

      function repositionEl(selection, yDiff) {
        if (selection.attr('transform') === null)
          return selection
                  .attr('transform', function(e) {
                    return 'translate(' + 0 + ',' + (-yDiff) + ')'
                  });
        else
          return selection
                  .attr('transform', function(e) {
                    return 'translate(' + 0 + ',' + (gLayout.getTranslation(d3.select(this)).y-yDiff) + ')'
                  });
      }

      // Compute event-related measures
      function calculateInGroupRatio(bipartiteModeInOther, instancesInOther, instancesInSelection) {
        let instancesIdx;
        if (bipartiteModeInOther == false)
          instancesIdx = instancesInOther.map(d => d.idx);
        else
          instancesIdx = Object.keys(instancesInOther[0])
              .filter(instanceIdx => instancesInOther[0][instanceIdx] !== 0)
              .map(d => parseInt(d)); // instanncesIdxForBipartite

        const selectedInstancesIdx = instancesInSelection.map(d => d.idx);
        const overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

        return overlappedIdx.length / selectedInstancesIdx.length;
      }

      function calculateInGroupRatioForTwoGroups(bipartiteModeInOther, instancesInOther, instancesInSelection) {
        let instancesIdx;
        if (bipartiteModeInOther == false)
          instancesIdx = instancesInOther.map(d => d.idx);
        else
          instancesIdx = Object.keys(instancesInOther[0])
              .filter(instanceIdx => instancesInOther[0][instanceIdx] !== 0)
              .map(d => parseInt(d)); // instanncesIdxForBipartite

        const firstCl = d3.select('.bar_rect_selected'),
              secondCl = d3.select('.bar_rect_selected2');
        let instancesIdxInSelection1 = [],
          instancesIdxInSelection2 = [];
        let overlappedIdx1 = [],
          overlappedIdx2 = [];
        let inGroupRatio1 = 0,
          inGroupRatio2 = 0;
        if (!firstCl.empty() && secondCl.empty()) {
          instancesIdxInSelection1 = firstCl.data()[0].instances.map(d => d.idx);
          overlappedIdx1 = _.intersection(instancesIdx, instancesIdxInSelection1);

          return overlappedIdx1.length / instancesIdxInSelection1.length;

        } else if (firstCl.empty() && !secondCl.empty()) {
          instancesIdxInSelection2 = secondCl.data()[0].instances.map(d => d.idx);
          overlappedIdx2 = _.intersection(instancesIdx, instancesIdxInSelection1);

          return overlappedIdx2.length / instancesIdxInSelection2.length;

        } else if (!firstCl.empty() && !secondCl.empty()) {
          instancesIdxInSelection1 = firstCl.data()[0].instances.map(d => d.idx);
          instancesIdxInSelection2 = secondCl.data()[0].instances.map(d => d.idx);

          overlappedIdx1 = _.intersection(instancesIdx, instancesIdxInSelection1),
          overlappedIdx2 = _.intersection(instancesIdx, instancesIdxInSelection2);
          
          inGroupRatio1 = overlappedIdx1.length / instancesIdxInSelection1.length,
          inGroupRatio2 = overlappedIdx2.length / instancesIdxInSelection2.length;

          return inGroupRatio1 - inGroupRatio2;
        }
      }

      function calculateGroupRatio(instancesInOther, instancesInSelection) {
        const instancesIdx = instancesInOther.map(d => d.idx),
        selectedInstancesIdx = instancesInSelection.map(d => d.idx),
        overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

        return overlappedIdx.length / instancesIdx.length;
      }
    });
  });
}

function renderRun() {
  $(document).ready(function(){
    $('.run_button').on('click', function(e) {
      fetchForInitialLoad(clSortingOpt);
      d3.select('.svg')
        .remove();
    });
  });
}

function renderInterface() {
  $(document).ready(function(){
    ['life_satisfaction', 'optimism'].forEach((sortingOpt) => {
      $(".dropdown-menu.cluster")
        .append(`<a class="dropdown-item cluster" href="#">` +
          sortingOpt +
          `</a>`);
    });

    $(".dropdown-item.cluster").on('click', function (e) {
      const sortingOpt = e.target.text
      if (sortingOpt === 'Layout optimized') {
        $('.dropdown_sorting_clusters').text('Layout optimized');
        d3.select('.svg').remove();
        fetchForInitialLoad('layout_optimization');
      } else { // sort by variable
        $('.dropdown_sorting_clusters').text(sortingOpt);
        d3.select('.svg').remove();
        fetchForInitialLoad(sortingOpt);
      }
    });

    $(".dropdown-item.cat").on('click', function (e) {
      const sortingOpt = e.target.text
      if (sortingOpt === 'Layout optimized') {
    
      } else { // sort by variable
        $('.dropdown_sorting_cats').text(sortingOpt);
        fetchForInitialLoad(sortingOpt);
      }
    });
  });
}





