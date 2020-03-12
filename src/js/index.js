import * as d3 from 'd3';
import skmeans from 'skmeans';
import { globalScales, scales } from './scale';
import { gLayout, l, ll, lCom } from './layout';
import { dataMapping } from './dataMapping';

import Container from './container';
import { controller } from './controller';
import Level from './level';
import Block from './block';

import '../css/bootstrap_submenu.css';
import "../css/index.css";

const data = require('./dataMapping');
const container = d3.select('#container');

let LVData = [];

fetchForInitialLoad('layout_optimization');

function fetchForInitialLoad(sortClsBy) {
  fetch('/dataset/loadData/', {
    method: 'get'
  })
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    const rawData = JSON.parse(response.dataset),
          features = response.features,
          instances = JSON.parse(response.instances);
  
    LVData = dataMapping.mapLevelToFeatures('cancer', features);
    controller(LVData);
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
        pairwiseCorrs = response.pairwiseCorrs;
  
      console.log('sortedCatsIdxForLvs: ', sortedCatsIdxForLvs);
      console.log('clResults: ', clResult);
      console.log('LVData: ', LVData);
      console.log('pairwiseCorrs: ', pairwiseCorrs);
      LVData.forEach((lvData, lvIdx) => {
        // Assign data to sort clusters
        const sortedCls = _.sortBy(clResult[lvIdx], ['sortedIdx']);
        lvData.cls = sortedCls;
        lvData.clScales = scales.calculateScalesForCls(rawData, sortedCls, llv.w);
        lvData.pairwiseCorrs = pairwiseCorrs[lvIdx];
        console.log('lvData.clScales: ', lvData.clScales);
  
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
            console.log('dddd: ', d);
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
              { lv: 0, cl: 1 },
              { lv: 1, cl: 1 },
              { lv: 2, cl: 1 },
              { lv: 3, cl: 1 }
            ]
            
            const isSelected = selectedBar.classed('bar_rect_selected');
            if (isSelected == false) {
              selectedBar.classed('bar_rect_selected', true);
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
                // go over calculated ratios and pick the best one -- to 'dominantClsForSubgroup'                
                if (selectedLV < LVData.length) {
                  d3.select('.g_btn_lvs' + '.lv_' + lvIdx)
                    .selectAll('.cl_line')
                    .style('stroke', function(clToCl) {
                      return scales.colorOnSelectScale(calculateInGroupRatio(clToCl.instancesClToCl, selectedCl.instances));
                    })
                    .filter(clToCl => {
                      const inGroupRatio = calculateInGroupRatio(clToCl.instancesClToCl, selectedCl.instances)
                      console.log('inGroupRatio: ', inGroupRatio, inGroupRatioThreshold);
                      return inGroupRatio < inGroupRatioThreshold;
                    })
                    .classed('cl_line_filtered', true);
                }

                // // Go over 
                // lvData.features.forEach(function(feature, featureIdx) {
                //   if (featureIdx < lvData.features.length) {
                //     d3.select('.g_btn_bls' + '.bl_' + feature.id)
                //       .selectAll('.cat_line')
                //       .style('stroke', function(catToCat) {
                //         return scales.colorOnSelectScale(calculateInGroupRatio(catToCat.instancesInCatToCat, selectedCl.instances));
                //       })
                //       .filter(catToCat => {
                //         const inGroupRatio = calculateInGroupRatio(catToCat.instancesInCatToCat, selectedCl.instances)
                //         console.log('inGroupRatio: ', inGroupRatio);
                //         return inGroupRatio < inGroupRatioThreshold;
                //       })
                //       .style('opacity', 0);
                //   }
                // })
              });

              dominantClsForSubgroup.forEach(function(d) {
                d3.selectAll('.proto_path' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_path_for_bar_selected', true)
                  .style('stroke-width', function(d){
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === d.value)
                    return scales.protoPathScale(calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances));
                  })
                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_circle_for_bar_selected', true);
                console.log('class check - before: ', d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl).attr('class'));
                d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl)
                  .classed('proto_circle_hidden', false)
                  .attr('r', function(d){
                    const instancesInSelectedCat = selectedCl.instances.filter(instance => instance[d.name] === d.value)
                    return scales.protoCircleRScale(calculateInGroupRatio(instancesInSelectedCat, selectedCl.instances));
                  });
                console.log('class check - after: ', d3.selectAll('.proto_circle' + '.lv_' + d.lv + '.cl_' + d.cl).attr('class'));
              });

              // Highlight a path between cls from one level to another level
              d3.selectAll('.bar_rect')
                .each(function(d) {

                });
              d3.selectAll('.bar_rect')  // 
                .filter(function(cl) {
                  return cl.lvIdx !== selectedLV
                })
                .style('fill', function(cl){
                  const instancesIdx = cl.instances.map(d => d.idx),
                    overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

                  const inGroupRatio = overlappedIdx.length / selectedInstancesIdx.length;

                  return scales.colorOnSelectScale(inGroupRatio);
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
                  console.log('color check: ', calculateInGroupRatio(cat.instances, selectedCl.instances))
                  return scales.colorCatOnSelectScale(calculateInGroupRatio(cat.instances, selectedCl.instances));
                })
                .style('fill-opacity', 0.9);

              // Hide the block icons
              d3.selectAll('.g_block_icons')
                .style('opacity', 0);
            } else {
              selectedBar.classed('bar_rect_selected', false);
              // Highlight the protos
              d3.selectAll('.proto_path')
                .classed('proto_path_selected', false)
                .classed('proto_path_for_bar_selected', false);
              d3.selectAll('.proto_circle')
                .classed('proto_circle_selected', false)
                .classed('proto_circle_for_bar_selected', false);
              d3.selectAll('.proto_circle')
                .classed('proto_circle_hidden', false);
              d3.selectAll('.cl_line')
                .classed('cl_line_filtered', false);

              d3.selectAll('.bar_rect')
                .style('fill', '');
              d3.selectAll('.cl_line')
                .style('stroke', '');
              d3.selectAll('.cat_rect')
                .style('fill', '');
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
              .classed('proto_circle_hidden', false);
            d3.selectAll('.proto_circle.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_circle_hidden', true);
            d3.selectAll('.proto_path.lv_' + d.lvIdx + '.cl_' + d.idx)
              .classed('proto_path_mouseovered', false);
          });

      d3.selectAll('.proto_circle')
          .on('mouseover', function(d) {
            console.log('proto mouseovered: ', d);  
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
            gProto.selectAll('.proto_path')
              .classed('proto_path_mouseovered', false);
            gProto.selectAll('.proto_circle')
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

      // Compute event-related measures
      function calculateInGroupRatio(instancesInOther, instancesInSelection) {
        const instancesIdx = instancesInOther.map(d => d.idx),
        selectedInstancesIdx = instancesInSelection.map(d => d.idx),
        overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

        return overlappedIdx.length / selectedInstancesIdx.length;
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
  console.log(e.target.text);
  const sortingOption = e.target.text
  if (sortingOption === 'Layout optimized') {

  } else { // sort by variable
    $('.dropdown_sorting_clusters').text(sortingOption);
    d3.select('.svg').remove();
    fetchForInitialLoad('QOL');
  }
});

$(".dropdown-item.cat").on('click', function (e) {
  console.log(e.target.text);
  const sortingOption = e.target.text
  if (sortingOption === 'Layout optimized') {

  } else { // sort by variable
    $('.dropdown_sorting_cats').text(sortingOption);
    fetchForInitialLoad('QOL');
  }
});





