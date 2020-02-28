import * as d3 from 'd3';
import skmeans from 'skmeans';
import { globalScales, scales } from './scale';
import { gLayout, l, ll, lCom } from './layout';
import { dataMapping } from './dataMapping';

import Container from './container';
import { controller } from './controller';
import Level from './level';
import Block from './block';

import "../css/index.css";

const data = require('./dataMapping');


const container = d3.select('#container');

// For new codes
let LVData = [];

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
      data: LVData
    })
  }).then((response) => {
    return response.json();
  }).then((response) => {
    const clResult = response.clResult,
      sortedCatsIdxForLvs = response.sortedCatsIdxForLvs;

    console.log('sortedCatsIdxForLvs: ', sortedCatsIdxForLvs)
    console.log('clResults: ', clResult)
    LVData.forEach((lvData, lvIdx) => {
      const sortedCls = _.sortBy(clResult[lvIdx], ['sortedIdx']);
      lvData.cls = sortedCls;
      lvData.clScales = scales.calculateScalesForCls(rawData, sortedCls, llv.w);
      console.log('lvData.clScales: ', lvData.clScales);
      lvData.features.forEach((feature, featureIdx) => {
        const numCats = feature.domain.length;
        feature.sortedInstances = [];
        feature.cats = [];
        
        feature.sortedIdx = sortedCatsIdxForLvs[lvIdx][featureIdx];
        feature.instances.forEach((instanceSet, i) => {
          feature.sortedInstances[feature.sortedIdx[i]] = instanceSet;
        });

        for(let i=0; i<numCats; i++) {
          feature.cats[i] = {
            idx: feature.sortedIdx[i],
            instances: feature.sortedInstances[i]
          };
        }

        const { scale, catScales } = scales.setScaleToFeature(rawData, feature, llv.w);
        feature.scale = scale;
        feature.catScales = catScales;
      })
    });
      
    // userid,tweet,relationship,iq,gender,age,political,optimism,children,religion,race,income,education,life_satisfaction
    const svg2 = container
      .append('svg')
      .attr('width', l.w)
      .attr('height', l.h)
      .attr('class', 'svg2');
    const container1 = Container();

    

    svg2.call(
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

    d3.selectAll('.bar_rect')
      .on('click', function(cl) {
        const selectedBar = d3.select(this), 
            selectedLV = cl.lvIdx,   
            selectedClIdx = cl.idx;
        const selectedInstancesIdx = cl.instances.map(d => d.idx);
        console.log('dddd: ', cl);
        
        const isSelected = selectedBar.classed('bar_rect_selected');
        if (isSelected == false) {
          selectedBar.classed('bar_rect_selected', true);
          d3.selectAll('.bar_rect_lv_2')  // other bars in the same level
            .filter((cl) => cl.idx !== selectedClIdx)
            .classed('not_selected', true);
          // Color other bars 
          d3.selectAll('.bar_rect')
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
          // Color btn-lines
          d3.selectAll('.cl_line')
            .style('stroke', function(clToCl) {
              console.log('dd');
              const instancesIdx = clToCl.instancesClToCl.map(d => d.idx);
              const overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

              const inGroupRatio = overlappedIdx.length / selectedInstancesIdx.length;
              console.log('inGroupRatio: ', inGroupRatio)
              return scales.colorOnSelectScale(inGroupRatio);
            });
          // Color cat bars
          d3.selectAll('.cat_rect')
            .style('fill', function(cat){
              console.log('cat: ', cat);
              const instancesIdx = cat.instances.map(d => d.idx);
              const overlappedIdx = _.intersection(instancesIdx, selectedInstancesIdx);

              const inGroupRatio = overlappedIdx.length / selectedInstancesIdx.length;
              console.log('inGroupRatio: ', inGroupRatio)
              return scales.colorCatOnSelectScale(inGroupRatio);
            })
            .style('fill-opacity', 0.9);
        } else {
          selectedBar.classed('bar_rect_selected', false);

          d3.selectAll('.bar_rect')
            .style('fill', '');
          d3.selectAll('.cl_line')
            .style('stroke', '');
          d3.selectAll('.cat_rect')
            .style('fill', '');
        }
      })
      .on('mouseover', function(d) {
        d3.select(this).classed('bar_rect_mouseovered', true);
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('bar_rect_mouseovered', false);
      });

    d3.selectAll('.proto_circle')
      .on('mouseover', function(d) {
        const gProto = d3.select(this.parentNode);
        gProto.selectAll('.proto_path')
          .classed('proto_mouseovered', true);
      })
      .on('mouseout', function(d) {
        const gProto = d3.select(this.parentNode);
        gProto.selectAll('.proto_path')
          .classed('proto_mouseovered', false);
      })
      .on('click', function(d) {
        const gProto = d3.select(this.parentNode);
        const selectedProto = d3.select(this);

        if (selectedProto.classed('proto_selected')) {
          selectedProto.classed('proto_selected', false);
          gProto.selectAll('.proto_path')
            .classed('proto_selected', false);
        } else {
          selectedProto.classed('proto_selected', true);
          gProto.selectAll('.proto_path')
            .classed('proto_selected', true);
        }
        
      });



    
  });

  
});





