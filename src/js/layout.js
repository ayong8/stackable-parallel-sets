import * as d3 from 'd3';
import d3tooltip from 'd3-tooltip';
import { data } from './data';

export const gColors = {
  system: 'mediumpurple',
  group: {
    lib: 'darkblue',
    con: 'crimson',
    wrong: {
      lib: 'rosybrown',
      con: '#8eabd0'
    }
  },
  groups: [
    {name: 'con', color: 'rgb(255, 34, 34)', colorForWrong: 'rosybrown'},
    {name: 'lib', color: 'rgb(25, 12, 226)', colorForWrong: '#8eabd0'}
  ],
  feature: '#00ffa8',
  userFeature: 'LIGHTSEAGREEN',
  stroke: '#585858'
};

export const l = {
  w: 1100,
  h: 500,
  sm: 10,
  mm: 10,
  lm: 15,
  textHeight: 10,
  textHeight2: 15,
  wForLabel:80,
  container: {
    global: {
      t: null,
      l: null
    },
    local: {
      p: {
        l: 0,
        t: 0
      }
    }
  }
};

export const llv = {
  w: l.w * 0.4,
  h: 150,
  hPerLv: [],
  maxH: 200,
  maxNumFeatures: 10,
  minFeatureAreaRatio: 0.7,
  maxFeatureAreaRatio: 0.9,
  m: {
    t: 5,
    b: 5,
    l: 10,
    r: 40
  },
  p: {
    b: 30
  },
  bar: {
    h: 10
  }
}

export const lBtn = {
  h: 100
}

export const lbl = {
  s: llv.w * 0.1,
  h: 50,
  maxS: llv.h * 0.3,
  t: (llv.h - llv.h * 0.1) / 2,
  m: {
    btn: 10
  },
}

export const lbr = {
  h: 20,
  m: {
    btn: 5
  }
}

export const lwbr = {
  h: 15,
  m: {
    btn: 10
  }
}

export const gLayout = {}

const tooltip = d3tooltip(d3);

llv.getT = function(idx) {
  return this.h * idx + lBtn.h * idx;
}

llv.setM = function(LVWForFeatures) {
  // this.m.l = (this.w - LVWForFeatures) / 2;
  // this.m.r = (this.w - LVWForFeatures) / 2;
  this.m.l = 15
  this.m.r = 40
}

llv.setH = function(numFeatures) {
  return this.h + (this.h*0.1 + (numFeatures - 2)) // Increase the level height proportional to # of features
}

lbl.setS = function(LVWForFeatures, numFeatures) {
  this.s = Math.min(this.maxS, (LVWForFeatures * 0.7) / numFeatures);
  // this.m.btn = (LVWForFeatures * 0.3) / numFeatures;
},
lbl.getX = function(idx) {
  return this.s * idx + this.m.btn * idx;
}
lbl.getY = function(LVLayout, numFeatures, idx) {
  const mainRegionInLV = LVLayout.height - llv.m.t - llv.m.b,
      BLHRegion = mainRegionInLV * 0.5,
      BTNMRegion = mainRegionInLV * 0.5;

  const height = BLHRegion / numFeatures,
        btnMargin = BLHRegion / (numFeatures - 1);

  const y = llv.m.t + (height * idx) + (btnMargin * idx) - 5  

  return y;
}

l.setContainerBoundingClientRect = function(gContainer) {
  const svgL = d3.select('svg').node().getBoundingClientRect();
  this.container.global.l = svgL.left + l.container.local.p.l;
  this.container.global.t = svgL.top;
}

gLayout.getCssVar = function(cssVar) {
  return getComputedStyle(document.documentElement)
            .getPropertyValue(cssVar).trim();
}

gLayout.getTranslation = function(selection) {
  return {
    x: selection.node().transform.baseVal[0].matrix.e,
    y: selection.node().transform.baseVal[0].matrix.f
  }
}

gLayout.getElLayout = function(el) {
  const l = el.node().getBBox();
  const y2 = l.y + l.height;	
  const x2 = l.x + l.width;
  
  return {
    x1: l.x,
    x2: x2,
    y1: l.y,
    y2: y2,
    width: l.width,
    height: l.height
  }
}

gLayout.getGlobalElLayout = function(el, parentEl) {
  const thisL = el.node().getBoundingClientRect();

  if (typeof(parentEl) !== 'undefined') {
    const parentL = parentEl.node().getBoundingClientRect();
    return {
      x1: thisL.left - l.container.global.l,
      x2: thisL.left - l.container.global.l + thisL.width,
      y1: thisL.top - l.container.global.t + parentL.top,
      y2: thisL.top - l.container.global.t + thisL.height,
      width: thisL.width,
      height: thisL.height
    }
  } else {
    return {
      x1: thisL.left - l.container.global.l,
      x2: thisL.left - l.container.global.l + thisL.width,
      y1: thisL.top - l.container.global.t,
      y2: thisL.top - l.container.global.t + thisL.height,
      width: thisL.width,
      height: thisL.height
    }
  }
}

gLayout.getGlobalElLayoutTest = function(el, parentEl) {
  const thisL = el.node().getBoundingClientRect();

  return {
    x1: thisL.left - l.container.global.l,
    x2: thisL.left - l.container.global.l + thisL.width,
    y1: thisL.top - l.container.global.t,
    y2: thisL.top - l.container.global.t + thisL.height,
    width: thisL.width,
    height: thisL.height
  }
}

gLayout.getGlobalElLayoutTest2 = function(el, parentEl) {
  const thisL = el.node().getBoundingClientRect();
  const parentL = parentEl.node().getBoundingClientRect();

  return {
    x1: thisL.left - parentL.left,
    x2: thisL.left - parentL.left + thisL.width,
    y1: thisL.top - parentL.top,
    y2: thisL.top - parentL.top + thisL.height,
    width: thisL.width,
    height: thisL.height
  }
}

gLayout.addAxis = function(el, idx, direction, scale) {
  let gAxis;
  let axisSetting;

  axisSetting = d3
    .axisLeft(scale)
    .tickSize(0);
  
  gAxis = el
    .append('g')
    .attr('class', function(d) {
      return 'g_axis g_feature_axis g_feature_axis_';
    })
    .call(axisSetting);
}

// feature categories to feature categories, clusters to clusters
gLayout.renderCatBars = function(instances, catFeature, catScales, direction) {  // auxilary axis on the left? or right?
  const instancesGrpByFeature = _.groupBy(instances, d => d[catFeature.key]);
  const catsInFeature = catFeature.domain;

  gFeaturePlot
    .selectAll('.aux_axis_for_cat_features')
    .data(catsInFeature)
    .enter()
    .append('rect')
    .attr('class', cat => 'aux_axis_for_cat_features_' + catFeature.key + '_' + cat)
    .attr('x', direction === 'right' 
                ? xFeatureScale(catFeature.key) - lCom.hPlot.featurePlot.axis.cat.m - 1
                : xFeatureScale(catFeature.key) - xFeatureScale.bandwidth() + lCom.hPlot.featurePlot.axis.w + lCom.hPlot.featurePlot.axis.cat.m - 5 - 1)
    .attr('y', (cat, i) => catScales[cat].range()[0] - i*2)
    .attr('width', 5)
    .attr('height', cat => catScales[cat].range()[1] - catScales[cat].range()[0])
    .style('fill', cat => {
      const numInstancesInCat = instancesGrpByFeature[cat].length;
      const instancesGrpByGrp = _.groupBy(instancesGrpByFeature[cat], d => d.group);
      const numLibInstancesInCat = instancesGrpByGrp[1].length; // 0 = liberal

      return groupRatioScale(numLibInstancesInCat / numInstancesInCat);
    })
    .style('fill-opacity', 0.5)
    .style('stroke', cat => {
      const numInstancesInCat = instancesGrpByFeature[cat].length;
      const instancesGrpByGrp = _.groupBy(instancesGrpByFeature[cat], d => d.group);
      const numLibInstancesInCat = instancesGrpByGrp[1].length; // 0 = liberal

      return d3.rgb(groupRatioScale(numLibInstancesInCat / numInstancesInCat)).darker();
    })
    .style('stroke-width', 2);
}

gLayout.renderCatToCatLines = function(selection, lvData, currFeature, nextFeature, nextFeatureIdx, wholeWidth) {
  const catsInCurrFeature = currFeature.domain,
      catsInNextFeature = nextFeature.domain;
  const sortedCatsInCurr = currFeature.cats,
      sortedCatsInNext = nextFeature.cats;

  const catScalesForCurr = scales.calculateScalesForCats(currFeature, wholeWidth);
  const catScalesForNext = scales.calculateScalesForCats(nextFeature, wholeWidth);

  // { catInCurr: 0, catInNext: 0, catIdxInCurr: 0, catIdxInNext: 0, numInstances: 50 }
  let instancesBtnCats = [];
  let sortedCurrNodesIdx, sortedNextNodesIdx, edgesWithOutlierInfo;  // For fetching results
  let dataForCatToCatLines = [];
  let cumNumInstancesRatioInCurr = {},
    cumNumInstancesRatioInNext = {};
  for (const cat of catsInCurrFeature) {
    cumNumInstancesRatioInCurr[cat] = 0;
  }
  for (const cat of catsInNextFeature) {
    cumNumInstancesRatioInNext[cat] = 0;
  }

  fetchForOptimizingEdgesForCats();  

  // Detect outliers here
  async function fetchForOptimizingEdgesForCats (){
    const response = await fetch('/dataset/optimizeEdgesForCats/', {
      method: 'post',
      body: JSON.stringify({
        currNodes: sortedCatsInCurr.map(d => d.instances),
        nextNodes: sortedCatsInNext.map(d => d.instances)
      })
    })
    .then((response) => response.json())
    .then((response) => {
      // sortedCurrNodesIdx = response.sortedCurrNodes;
      // sortedNextNodesIdx = response.sortedNextNodes;
      edgesWithOutlierInfo = response.edgesWithOutlierInfo;
      prepareCatData(sortedCatsInCurr, sortedCatsInNext);
      renderCatToCatLines(instancesBtnCats, lvData, currFeature, nextFeature);
    });
  } 

  function prepareCatData(sortedCatsInCurr, sortedCatsInNext) {
    sortedCatsInCurr.forEach((sortedCatCurr, catCurr) => { // [2,0,3,1]
      sortedCatsInNext.forEach((sortedCatNext, catNext) => {
        const instancesInCurr = sortedCatCurr.instances,
              instancesInNext = sortedCatNext.instances;
        const filteredInstances = _.intersectionBy(instancesInCurr, instancesInNext, 'idx');
        
        const edge = _.find(edgesWithOutlierInfo, {'source': sortedCatCurr.sortedIdx, 'target': sortedCatNext.sortedIdx})

        let isEdgeOutlier = false;
        if (typeof(edge) !== 'undefined')
          isEdgeOutlier = edge.isOutlier == 1 ? true: false;
        else {
          isEdgeOutlier = false;
        }
          
  
        instancesBtnCats.push({
          catCurr: catCurr,
          catNext: catNext,
          sortedCatCurr: sortedCatCurr.idx,
          sortedCatNext: sortedCatNext.idx,
          // groupRatio: libRatioFilteredInstances,
          numInstancesRatioInCurr: filteredInstances.length / instancesInCurr.length,
          numInstancesRatioInNext: filteredInstances.length / instancesInNext.length,
          cumNumInstancesRatioInCurr: cumNumInstancesRatioInCurr[sortedCatCurr.sortedIdx] / instancesInCurr.length,
          cumNumInstancesRatioInNext: cumNumInstancesRatioInNext[sortedCatNext.sortedIdx] / instancesInNext.length,
          instancesInCurr: instancesInCurr,
          instancesInCatToCat: filteredInstances,
          isOutlier: isEdgeOutlier
        });
  
        cumNumInstancesRatioInCurr[sortedCatCurr.sortedIdx] += filteredInstances.length;
        cumNumInstancesRatioInNext[sortedCatNext.sortedIdx] += filteredInstances.length;
      });
    });
  }

  function renderCatToCatLines(instancesBtnCats, lvData, currFeature, nextFeature) {
    dataForCatToCatLines = instancesBtnCats.map((d, i) => {
      const widthForCurrCat = catScalesForCurr[d.catCurr].range()[1] - catScalesForCurr[d.catCurr].range()[0];
      const widthDecayingRatio = 0.25;
      const lineWidth = widthForCurrCat * d.numInstancesRatioInCurr * widthDecayingRatio;
      return {
        idx: i,
        catCurr: d.catCurr,
        catNext: d.catNext,
        sortedCatCurr: d.sortedCatCurr,
        sortedCatNext: d.sortedCatNext,
        numInstancesRatioInCurr: d.numInstancesRatioInCurr,
        numInstancesRatioInNext: d.numInstancesRatioInNext,
        lineWidth: lineWidth,
        widthForCurrCat: widthForCurrCat,
        instancesInCurr: d.instancesInCurr,
        instancesInCatToCat: d.instancesInCatToCat,
        source: {
          x: catScalesForCurr[d.catCurr](d.cumNumInstancesRatioInCurr) + lineWidth / 2, // From the center (=widthForCurrCat/2), then go left a bit
          y: 0
        },
        target: {
          x: catScalesForNext[d.catNext](d.cumNumInstancesRatioInNext) + lineWidth / 2,
          y: lvData.blScale(nextFeatureIdx) - lvData.blScale(nextFeatureIdx-1) - lwbr.h
        },
        isOutlier: d.isOutlier
      };
    });
  
    const drawTweetLine = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);
    let catLinesData, catLines;
  
    catLinesData = selection
      .selectAll('.cat_line')
      .data(dataForCatToCatLines, d => d.idx);

    catLinesData
      .enter()
      .append('path')
      .attr('class', d => {
        return d.isOutlier == true
          ? 'cat_line' + ' feature_' + currFeature.name + '_cat_' + d.sortedCatCurr + ' cat_' + d.sortedCatCurr + ' feature_' + nextFeature.name + '_cat_' + d.sortedCatNext + ' cat_' + d.sortedCatNext
          : 'cat_line' + ' feature_' + currFeature.name + '_cat_' + d.sortedCatCurr + ' cat_' + d.sortedCatCurr + ' feature_' + nextFeature.name + '_cat_' + d.sortedCatNext + ' cat_' + d.sortedCatNext + ' cat_line_dominant_for_all'
      })
      .attr('d', drawTweetLine)
      .style('fill', 'none')
      //.style('stroke-width', d => d.lineHeight)
      .style('stroke-width', d => d.lineWidth)
      .style('opacity', d => 0)
      .on('mouseover', function(d) {
        d3.select(this).classed('cat_line_mouseovered', true);
        console.log('data: ', data);
        const catToCatLineHtml =
          '<div style="font-weight: 600">' +
          'Ratio: ' +
          (Math.ceil((d.instancesInCatToCat.length/data.numAllInstances)*100)/100) +
          '</br>' +
          'Ratio in upper category: ' +
          (Math.ceil((d.numInstancesRatioInCurr)*100)/100) +
          '</br>' +
          'Ratio in lower category: ' +
          (Math.ceil((d.numInstancesRatioInNext)*100)/100) +
          '</br>' +
          '</div>';

        tooltip.html(catToCatLineHtml);
        tooltip.show();
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('cat_line_mouseovered', false);
        tooltip.hide();
      });

    catLinesData
      .attr('d', drawTweetLine)
      .style('stroke-width', d => d.lineWidth);

    catLinesData.exit().remove();
  }
}

gLayout.renderClToClLines = function(selection, instances, currLvData, nextLvData, currLowerBar, nextUpperBar, wholeWidth) {
  const currCls = currLvData.cls, 
    nextCls = nextLvData.cls;
  const currLvBipartiteMode = currLvData.btnMode.bipartiteMode,
    nextLvBipartiteMode = nextLvData.btnMode.bipartiteMode;

  let totalCntForCurr = 0,
    totalCntForNext = 0;
  let bipartiteMat = [];
  if (currLvBipartiteMode == 1) {
    totalCntForCurr = currLvData.btnMode.totalFreqCnt;
    totalCntForNext = instances.length;
    bipartiteMat = currLvData.btnMode.bipartiteMat;
  } else if (nextLvBipartiteMode == 1) {
    totalCntForCurr = instances.length;
    totalCntForNext = nextLvData.btnMode.totalFreqCnt;
    bipartiteMat = nextLvData.btnMode.bipartiteMat;
  } else {
    totalCntForCurr = instances.length;
    totalCntForNext = instances.length;
  }

  const clScalesForCurr = scales.calculateScalesForCls(currLvBipartiteMode, currCls, wholeWidth, totalCntForCurr);
  const clScalesForNext = scales.calculateScalesForCls(nextLvBipartiteMode, nextCls, wholeWidth, totalCntForNext);

  // { catInCurr: 0, catInNext: 0, catIdxInCurr: 0, catIdxInNext: 0, numInstances: 50 }
  let instancesBtnCls = [];
  let sortedCurrNodesIdx, sortedNextNodesIdx, edgesWithOutlierInfo;  // For fetching results
  let dataForClToClLines = [];
  let cumNumInstancesInCurr = {},
    cumNumInstancesInNext = {};
  for (const clIdx of d3.range(currCls.length)) {
    cumNumInstancesInCurr[clIdx] = 0;
  }
  for (const clIdx of d3.range(nextCls.length)) {
    cumNumInstancesInNext[clIdx] = 0;
  }
  
  fetchForOptimizingEdgesForCls();  

  // Detect outliers here
  async function fetchForOptimizingEdgesForCls (){
    const response = await fetch('/dataset/optimizeEdgesForCls/', {
      method: 'post',
      body: JSON.stringify({
        currBipartiteMode: currLvBipartiteMode,
        nextBipartiteMode: nextLvBipartiteMode,
        bipartiteMat: bipartiteMat,
        currNodes: _.sortBy(currCls, ['idx']).map(d => d.instances),
        nextNodes: _.sortBy(nextCls, ['idx']).map(d => d.instances)
      })
    })
    .then((response) => response.json())
    .then((response) => {
      sortedCurrNodesIdx = response.sortedCurrNodes;
      sortedNextNodesIdx = response.sortedNextNodes;
      edgesWithOutlierInfo = response.edgesWithOutlierInfo;

      console.log('edgesWithOutlierInfo-ClToCl: ', edgesWithOutlierInfo.map(d => [d.source, d.target, d.weight, d.alpha, d.isOutlier]));
      prepareClData(currCls, nextCls, currLvBipartiteMode, nextLvBipartiteMode);
      renderClToClLines(instancesBtnCls, currLvData.idx, nextLvData.idx, currLowerBar, nextUpperBar);
    })
  }

  function prepareClData(currCls, nextCls, currLvBipartiteMode, nextLvBipartiteMode) {
    // Adding sorted index after eigendecomposition

    //currCls.forEach((cl, clIdx) => cl.sortedIdx = sortedCurrNodesIdx[clIdx]);
    //nextCls.forEach((cl, clIdx) => cl.sortedIdx = sortedNextNodesIdx[clIdx]);

    // Prepare the btn-clustering instance data
    currCls.forEach((clCurr, idxCurr) => {
      nextCls.forEach((clNext, idxNext) => {
        let filteredInstances = [],
          numFilteredInstances = 0,
          numInstancesRatioInCurr = 0,
          numInstancesRatioInNext = 0,
          cumNumInstancesRatioInCurr = 0,
          cumNumInstancesRatioInNext = 0;
        
        const edge = _.find(edgesWithOutlierInfo, {'source': clCurr.idx, 'target': clNext.idx})
        let isEdgeOutlier = false;
        if (typeof(edge) !== 'undefined')
          isEdgeOutlier = edge.isOutlier == 1 ? true: false;
        else
          isEdgeOutlier = false;

        if (currLvBipartiteMode == 1) {
          // Retrieve primary node clusters (users or patients)
          filteredInstances = [];
          numFilteredInstancesForCurr = data.calculateClToClFreqForBipartite(clCurr.instances);
          numInstancesRatioInCurr = numFilteredInstances / totalCntForCurr;
          numInstancesRatioInNext = numFilteredInstances / totalCntForNext;
          cumNumInstancesRatioInCurr = cumNumInstancesInCurr[clCurr.idx] / totalCntForCurr;
          cumNumInstancesRatioInNext = cumNumInstancesInNext[clNext.idx] / totalCntForCurr;
        } else if (nextLvBipartiteMode == 1) {
          filteredInstances = [];
          numFilteredInstances = data.calculateClToClFreqForBipartite(clNext.instances);
          numInstancesRatioInCurr = numFilteredInstances / totalCntForNext;
          numInstancesRatioInNext = numFilteredInstances / totalCntForNext;
          cumNumInstancesRatioInCurr = cumNumInstancesInCurr[clCurr.idx] / totalCntForNext;
          cumNumInstancesRatioInNext = cumNumInstancesInNext[clNext.idx] / totalCntForNext;
        } else {
          filteredInstances = _.intersectionBy(clCurr.instances, clNext.instances, 'idx');
          numFilteredInstances = filteredInstances.length;
          numInstancesRatioInCurr = numFilteredInstances / clCurr.instances.length;
          numInstancesRatioInNext = numFilteredInstances / totalCntForNext;
          cumNumInstancesRatioInCurr = cumNumInstancesInCurr[clCurr.idx] / clCurr.instances.length;
          cumNumInstancesRatioInNext = cumNumInstancesInNext[clNext.idx] / clNext.instances.length;
        }

        instancesBtnCls.push({
          clCurrIdx: clCurr.idx,
          clNextIdx: clNext.idx,
          sortedClCurrIdx: clCurr.idx,
          sortedClNextIdx: clNext.idx,
          numInstancesRatioInCurr: numInstancesRatioInCurr,
          numInstancesRatioInNext: numInstancesRatioInNext,
          cumNumInstancesRatioInCurr: cumNumInstancesRatioInCurr,
          cumNumInstancesRatioInNext: cumNumInstancesRatioInNext,
          instancesInCurr: clCurr.instances,
          instancesClToCl: filteredInstances,
          isOutlier: isEdgeOutlier
        });

        cumNumInstancesInCurr[clCurr.idx] += numFilteredInstances;
        cumNumInstancesInNext[clNext.idx] += numFilteredInstances;
      });
    });
  }
  
  function renderClToClLines(instancesBtnCls, currLvIdx, nextLvIdx, currLowerBar, nextUpperBar) {
    // Prepare the data to draw lines
    dataForClToClLines = instancesBtnCls.map((d, i) => {
      const widthForCurrCat = clScalesForCurr[d.clCurrIdx].range()[1] - clScalesForCurr[d.clCurrIdx].range()[0];
      const widthDecayingRatio = 0.15;
      const lineWidth = widthForCurrCat * d.numInstancesRatioInCurr * widthDecayingRatio;

      console.log('cl and cum: ', clScalesForNext[d.clNextIdx], d.cumNumInstancesRatioInNext)
      return {
        clCurrIdx: d.clCurrIdx,
        clNextIdx: d.clNextIdx,
        sortedClCurrIdx: d.sortedClCurrIdx,
        sortedClNextIdx: d.sortedClNextIdx,
        numInstancesRatioInCurr: d.numInstancesRatioInCurr,
        numInstancesRatioInNext: d.numInstancesRatioInNext,
        lineWidth: lineWidth,
        heightForCat: widthForCurrCat,
        instancesInCurr: d.instancesInCurr,
        instancesClToCl: d.instancesClToCl,
        source: {
          x: clScalesForCurr[d.clCurrIdx](d.cumNumInstancesRatioInCurr) + lineWidth / 2,
          y: 0
        },
        target: {
          x: clScalesForNext[d.clNextIdx](d.cumNumInstancesRatioInNext) + lineWidth / 2,
          y: (gLayout.getGlobalElLayout(nextUpperBar).y1) - (gLayout.getGlobalElLayout(currLowerBar).y2) - lbr.h*2
        },
        isOutlier: d.isOutlier
      };
    });

    console.log('dataForClToClLines: ', dataForClToClLines)

    const drawTweetLine = d3
      .linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    const clLines = selection
      .selectAll('.cl_line')
      .data(dataForClToClLines)
      .enter()
      .append('path')
      .attr('class', d => {
        return d.isOutlier 
          ? 'cl_line' + ' from_lv_' + currLvIdx + '_cl_' + d.sortedClCurrIdx + ' cl_' + d.sortedClCurrIdx + ' to_lv_' + nextLvIdx + '_cl_' + d.sortedClNextIdx + ' cl_' + d.sortedClNextIdx
          : 'cl_line' + ' from_lv_' + currLvIdx + '_cl_' + d.sortedClCurrIdx + ' cl_' + d.sortedClCurrIdx + ' to_lv_' + nextLvIdx + '_cl_' + d.sortedClNextIdx + ' cl_' + d.sortedClNextIdx + ' cl_line_dominant_for_all'
      })
      .attr('d', drawTweetLine)
      .style('fill', 'none')
      //.style('stroke-width', d => d.lineHeight)
      .style('stroke-width', d => d.lineWidth)
      .style('opacity', 0);
  }
  
}
