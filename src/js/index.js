import * as d3 from 'd3';
import skmeans from 'skmeans';
import { globalScales, scales } from './scale';
import { gLayout, l, ll, lbr, lCom } from './layout';
import { dataMapping } from './dataMapping';

import Container from './container';
import { controller } from './controller';
import Level from './level';
import Block from './block';
import BarTreemap from './bar-treemap';

import '../css/bootstrap_submenu.css';
import "../css/index.css";

const data = require('./dataMapping');
const container = d3.select('#container');

let LVData = [];
let selectedGroups = [null, null];

fetchForInitialLoad('layout_optimization');

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
  
    LVData = dataMapping.mapLevelToFeatures(datasetAbbr, features);
    controller(LVData, features);
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
        dominantClsForLvs = response.outlierClsForLvs,
        pairwiseCorrs = response.pairwiseCorrs;

      LVData.forEach((lvData, lvIdx) => {
        // Assign data to sort clusters
        const sortedCls = _.sortBy(clResult[lvIdx], ['sortedIdx']);
        lvData.cls = sortedCls;
        lvData.clScales = scales.calculateScalesForCls(rawData, sortedCls, llv.w);
        lvData.pairwiseCorrs = pairwiseCorrs[lvIdx];
  
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

      // Events
      d3.selectAll('.cat_rect')
          .on('click', function(d) {
          })
          .on('mouseover', function(d) {
            d3.select(this).classed('cat_rect_mouseovered', true);
          })
          .on('mouseout', function(d) {
            d3.select(this).classed('cat_rect_mouseovered', false);
          });

      // Select a subgroup
      d3.selectAll('.bar_rect')
          .on('click', function(selectedCl) {
            const selectedBar = d3.select(this), 
                selectedLV = selectedCl.lvIdx,   
                selectedClIdx = selectedCl.idx;
            const selectedInstancesIdx = selectedCl.instances.map(d => d.idx);
            const dominantClsForSubgroup = [
              { lv: 0, cl: 2 },
              { lv: 1, cl: 5 },
              { lv: 2, cl: 3 },
              // { lv: 3, cl: 0 }
            ]

            const isSelected = selectedBar.classed('bar_rect_selected');
            const isFirstSelected = d3.select('.bar_rect_selected'),
              isSecondSelected = d3.select('.bar_rect_selected2');
            // Select the color scale to color other levels (not selected),
            let selectedClColorScale = null;
            let selectedCatColorScale = null;

            // Register the selections
            if (isSelected == false) {
              if (isFirstSelected.empty() && isSecondSelected.empty()) { // Both wasn't selected
                console.log('XX: ');
                selectedBar.classed('bar_rect_selected', true); // Put in the first one
                selectedClColorScale = scales.colorClOnSelectScale;
                selectedCatColorScale = scales.colorCatOnSelectScale;
              } else if (!isFirstSelected.empty() && isSecondSelected.empty()) { // First one was
                console.log('OX: ');
                selectedBar.classed('bar_rect_selected2', true); // Put in the second one
                selectedClColorScale = scales.colorClOnSelectTwoGroupsScale;
                selectedCatColorScale = scales.colorCatOnSelectTwoGroupsScale;
              } else if (isFirstSelected.empty() && !isSecondSelected.empty()) { // One of them
                console.log('XO: ');
                selectedBar.classed('bar_rect_selected2', true); // Put in the second one
              } else { // Both are selected
                isSecondSelected.classed('bar_rect_selected2', false); // cancel the current second one
                selectedBar.classed('bar_rect_selected2', true); // Put in the second one
              }
              // cancelSelection(selectedClColorScale);
              colorByTwoGroups(selectedClColorScale, selectedCatColorScale);
            }
            else {  // if the bar was already selected
              if (!isFirstSelected.empty() && isSecondSelected.empty()) {
                selectedBar.classed('bar_rect_selected', false);
                colorByTwoGroups(selectedClColorScale, selectedCatColorScale);
              } else if (isFirstSelected.empty() && !isSecondSelected.empty()) {
                selectedBar.classed('bar_rect_selected2', false);
                colorByTwoGroups(selectedClColorScale, selectedCatColorScale);
              } else if (isFirstSelected.empty() && isSecondSelected.empty()) {
                selectedBar.classed('bar_rect_selected2', false);
                cancelSelection(selectedClColorScale);
                colorByTwoGroups(selectedClColorScale, selectedCatColorScale);
              }
            }
            
            function colorByTwoGroups(selectedClColorScale, selectedCatColorScale) {
              // selectedBar.classed('bar_rect_selected', true);
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
                  return scales.protoCircleRScale(calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances))
                });
              // Color other bars, wtn-lines and btn-lines
              // go over other levels
              const inGroupRatioThreshold = 0.2;
              LVData.forEach((lvData, lvIdx) => {
                if (lvIdx !== selectedLV) {
                  // look at bars per level
                  d3.selectAll('.g_bars.lv_' + lvIdx)
                    .selectAll('.g_bars')
                    .each(function(cl) {
                      //calculateInGroupRatio(clToCl.instancesClToCl, selectedCl.instances)
                      
                    })
                }
                // Go over calculated ratios and pick the best one -- to 'dominantClsForSubgroup'                
                if (selectedLV < LVData.length) {
                  d3.select('.g_btn_lvs' + '.lv_' + lvIdx)
                    .selectAll('.cl_line')
                    .style('stroke', function(clToCl) {
                      return selectedClColorScale(calculateInGroupRatio(clToCl.instancesClToCl, selectedCl.instances));
                    })
                    .filter(clToCl => {
                      const inGroupRatio = calculateInGroupRatio(clToCl.instancesClToCl, selectedCl.instances)
                      return inGroupRatio < inGroupRatioThreshold;
                    })
                    .classed('cl_line_filtered', true);
                }

                // Color all within-edges
                lvData.features.forEach(function(feature, featureIdx) {
                  if (featureIdx < lvData.features.length) {
                    d3.select('.g_btn_bls' + '.bl_' + feature.id)
                      .selectAll('.cat_line')
                      .style('stroke', function(catToCat) {
                        return scales.colorCatOnSelectScale(calculateInGroupRatio(catToCat.instancesInCatToCat, selectedCl.instances));
                      })
                      .filter(catToCat => {
                        const inGroupRatio = calculateInGroupRatio(catToCat.instancesInCatToCat, selectedCl.instances)
                        return inGroupRatio < inGroupRatioThreshold;
                      })
                      .style('opacity', 0);
                  }
                })
              });

              // Highlight dominant clusters
              dominantClsForSubgroup.forEach(function(d) {
                d3.selectAll('.proto_path' + '.lv_' + d.lv + '.cl_' + d.dominantCl)
                  .classed('proto_path_for_bar_selected', true)
                  .style('stroke-width', function(d){
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === d.value)
                    return scales.protoPathScale(calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances));
                  })
                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.dominantCl)
                  .classed('proto_circle_for_bar_selected', true);

                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.dominantCl)
                  .classed('proto_circle_hidden', false)
                  .attr('r', function(d){
                    
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === d.value)
                    // console.log('r check: ', d, calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances));
                    return scales.protoCircleRScale(calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances));
                  });
              });

              // Color cluster bars
              d3.selectAll('.bar_rect')  // 
                .filter(function(cl) {
                  return cl.lvIdx !== selectedLV
                })
                .style('fill', function(cl){
                  return selectedClColorScale(calculateInGroupRatioForTwoGroups(cl.instances, selectedCl.instances));
                })
                .style('fill-opacity', 0.9);
              // Highlight the protos
              d3.selectAll('.proto_path' + '.lv_' + selectedLV + '.cl_' + selectedClIdx)
                .classed('proto_path_selected', true);
              d3.selectAll('.proto_circle' + '.lv_' + selectedLV + '.cl_' + selectedClIdx)
                .classed('proto_circle_selected', true);

              // Color cat bars
              d3.selectAll('.cat_rect')
                .style('fill', function(cat){
                  return scales.colorCatOnSelectScale(calculateInGroupRatio(cat.instances, selectedCl.instances));
                })
                .style('fill-opacity', 0.9);

              // Hide the block icons
              d3.selectAll('.g_block_icons')
                .style('opacity', 0);
            }

            function cancelSelection() {
              selectedBar.classed('bar_rect_selected', false);
              // Highlight the protos
              d3.selectAll('.proto_path')
                .classed('proto_path_selected', false)
                .classed('proto_path_for_bar_selected', false);
              d3.selectAll('.proto_circle')
                .classed('proto_circle_selected', false)
                .classed('proto_circle_for_bar_selected', false)
                .classed('proto_circle_hidden', false)
                .attr('r', 4);
              d3.selectAll('.cl_line')
                .classed('cl_line_filtered', false);

              d3.selectAll('.bar_rect')
                .style('fill', '');
              d3.selectAll('.cat_rect')
                .style('fill', '');
              d3.selectAll('.cl_line')
                .style('stroke', '');
              d3.selectAll('.cat_line')
                .style('stroke', '');
              d3.selectAll('.g_block_icons')
                .style('opacity', '');
            }
          })
          .on('mouseover', function(d) {
            d3.select(this).classed('bar_rect_mouseovered', true);
            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_mouseovered', true)
              .classed('proto_circle_hidden', false);
            d3.selectAll('.proto_path.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_path_mouseovered', true);
          })
          .on('mouseout', function(d) {
            d3.select(this).classed('bar_rect_mouseovered', false);

            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_mouseovered', false)
              .classed('proto_circle_hidden', true);

            d3.selectAll('.proto_path.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_path_mouseovered', false)
              .classed('proto_path_selected', false);
          });

      d3.selectAll('.proto_circle')
          .on('mouseover', function(d) { 
            const gProto = d3.select(this.parentNode);
            const lvIdx = d3.select(this.parentNode).attr('class').split(' ')[1].split('_')[1],
              clIdx = d3.select(this.parentNode).attr('class').split(' ')[2].split('_')[1];

            d3.selectAll('.proto_path.lv_' + lvIdx + '.cl_' + clIdx)
              .classed('proto_path_mouseovered', true);
            gProto.selectAll('.proto_circle')
              .classed('proto_circle_selected', true);
            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_hidden', false);
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
              const numCats = feature.cats.length,
                cForCats = ['red', 'blue'];

              const colorBtnRatiosScale = d3.scaleLinear()
                .domain([0, 0.5, 1])
                .range(['red', 'whitesmoke', 'blue']);
              
              const selectedCat1 = feature.cats[0],
                selectedCat2 = feature.cats[1];
              
              d3.selectAll('.cat_rect')
                .style('fill', function(cat){
                  const inGroupRatio1 = calculateInGroupRatio(cat.instances, selectedCat1.instances),
                    inGroupRatio2 = calculateInGroupRatio(cat.instances, selectedCat2.instances);

                  const groupRatio1 = calculateGroupRatio(cat.instances, selectedCat1.instances),
                    groupRatio2 = calculateGroupRatio(cat.instances, selectedCat2.instances);
                  const ratioBtnInGroupRatio = inGroupRatio1 / (inGroupRatio1 + inGroupRatio2);
                  const ratioBtnTwoGroups = groupRatio1 / (groupRatio1 + groupRatio2);
                  console.log('ratioBtnInGroupRatio: ', ratioBtnInGroupRatio, colorBtnRatiosScale(ratioBtnInGroupRatio));
                  console.log('ratioBtnTwoGroups: ', ratioBtnTwoGroups, colorBtnRatiosScale(ratioBtnTwoGroups));
                  
                  return colorBtnRatiosScale(ratioBtnInGroupRatio);
                })
                .style('fill-opacity', 0.9);
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

                gBarsUpperSelected
                  .selectAll('.bar_rect')
                  .attr('height', lbr.h*2);
                gBarsLowerSelected.style('opacity', 0);
                bottomBar.style('opacity', 0);
                topBar.style('opacity', 0);

                // Create treemap
                if (lvData.idx === 0) {
                  gBarsLowerSelected
                    .call(
                      Treemap
                      .data(lvData)
                    );
                } else {
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
                gBarsLowerSelected.style('opacity', 0);
                bottomBar.style('opacity', '');
                topBar.style('opacity', '');
              }

              // Adjust all components below the selected level
              LVData.slice(lvData.idx+1).forEach(function(d){
                console.log('next level: ', '.g_level_' + d.idx, d, yDiff);
                console.log('next level g: ', d3.select('.g_level_' + d.idx));
                console.log('global: ', gLayout.getGlobalElLayout(d3.select('.g_level_' + d.idx)));
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
      function calculateInGroupRatio(instancesInOther, instancesInSelection) {
        const instancesIdx = instancesInOther.map(d => d.idx),
        selectedInstancesIdx = instancesInSelection.map(d => d.idx),
        overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

        return overlappedIdx.length / selectedInstancesIdx.length;
      }

      function calculateInGroupRatioForTwoGroups(instancesInOther, instancesInSelection) {
        const instancesIdx = instancesInOther.map(d => d.idx);
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

          console.log('OX: ', overlappedIdx1.length / instancesIdxInSelection1.length);
          return overlappedIdx1.length / instancesIdxInSelection1.length;
        } else if (firstCl.empty() && !secondCl.empty()) {
          instancesIdxInSelection2 = secondCl.data()[0].instances.map(d => d.idx);
          overlappedIdx2 = _.intersection(instancesIdx, instancesIdxInSelection1);

          console.log('XO: ', overlappedIdx2.length / instancesIdxInSelection2.length);
          return overlappedIdx2.length / instancesIdxInSelection2.length;
        } else if (!firstCl.empty() && !secondCl.empty()) {
          instancesIdxInSelection1 = firstCl.data()[0].instances.map(d => d.idx);
          instancesIdxInSelection2 = secondCl.data()[0].instances.map(d => d.idx);

          overlappedIdx1 = _.intersection(instancesIdx, instancesIdxInSelection1),
          overlappedIdx2 = _.intersection(instancesIdx, instancesIdxInSelection2);
          
          inGroupRatio1 = overlappedIdx1.length / instancesIdxInSelection1.length,
          inGroupRatio2 = overlappedIdx2.length / instancesIdxInSelection2.length;

          console.log('OO: ', inGroupRatio1 - inGroupRatio2);
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

// Dropdown menu for sorting
$(".dropdown-item.cluster").on('click', function (e) {
  const sortingOption = e.target.text
  if (sortingOption === 'Layout optimized') {

  } else { // sort by variable
    $('.dropdown_sorting_clusters').text(sortingOption);
    d3.select('.svg').remove();
    fetchForInitialLoad('QOL');
  }
});

$(".dropdown-item.cat").on('click', function (e) {
  const sortingOption = e.target.text
  if (sortingOption === 'Layout optimized') {

  } else { // sort by variable
    $('.dropdown_sorting_cats').text(sortingOption);
    fetchForInitialLoad('QOL');
  }
});





