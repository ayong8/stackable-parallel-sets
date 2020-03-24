import * as d3 from 'd3';

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
  wForLabel:80
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
  h: 15,
  m: {
    btn: 10
  }
}

export const lwbr = {
  h: 15,
  m: {
    btn: 10
  }
}

export const gLayout = {}

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

gLayout.getGlobalElLayout = function(el) {
  const containerEl = d3.select('.container').node();
  const l = el.node().getBoundingClientRect(),
        container = containerEl.getBoundingClientRect();
  
  return {
    x1: l.left - container.left,
    x2: l.x + l.width,
    y1: l.top - container.top,
    y2: l.top - container.top + l.height,
    width: l.width,
    height: l.height
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

  fetchForOptimizingEdges();  

  // Detect outliers here
  async function fetchForOptimizingEdges (){
    const response = await fetch('/dataset/optimizeEdges/', {
      method: 'post',
      body: JSON.stringify({
        currNodesName: currFeature.name,
        nextNodesName: nextFeature.name,
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
      renderCatToCatLines(instancesBtnCats, lvData);
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
          console.log('no edges detected (source,target): ', sortedCatCurr.sortedIdx, sortedCatNext.sortedIdx)
          isEdgeOutlier = false;
        }
          
  
        instancesBtnCats.push({
          catCurr: catCurr,
          catNext: catNext,
          sortedCatCurr: sortedCatCurr.idx,
          sortedCatNext: sortedCatNext.idx,
          // groupRatio: libRatioFilteredInstances,
          numInstancesRatioInCurr: filteredInstances.length / instancesInCurr.length,
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

  function renderCatToCatLines(instancesBtnCats, lvData) {
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
      .attr('class', d => 'cat_line cat_line_' + d.sortedCatCurr + '_' + d.sortedCatNext)
      .attr('d', drawTweetLine)
      .style('fill', 'none')
      //.style('stroke-width', d => d.lineHeight)
      .style('stroke-width', d => d.lineWidth)
      .style('opacity', d => d.isOutlier === true ? 0 : 0.5);

    catLinesData
      .attr('d', drawTweetLine)
      .style('stroke-width', d => d.lineWidth);

    catLinesData.exit().remove();
  }
}

gLayout.renderClToClLines = function(selection, instances, gCurrLowerBars, gNextUpperBars, wholeWidth) {
  const currCls = gCurrLowerBars.datum(),
    nextCls = gNextUpperBars.datum();

  const clScalesForCurr = scales.calculateScalesForCls(instances, currCls, wholeWidth);
  const clScalesForNext = scales.calculateScalesForCls(instances, nextCls, wholeWidth);

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

  
  fetchForOptimizingEdges();  

  // Detect outliers here
  async function fetchForOptimizingEdges (){
    const response = await fetch('/dataset/optimizeEdges/', {
      method: 'post',
      body: JSON.stringify({
        currNodesName: currCls.length,
        nextNodesName: nextCls.length,
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
      prepareClData(currCls, nextCls);
      renderClToClLines(instancesBtnCls, gCurrLowerBars, gNextUpperBars);
    })
  }

  function prepareClData(currCls, nextCls) {
    // Adding sorted index after eigendecomposition

    //currCls.forEach((cl, clIdx) => cl.sortedIdx = sortedCurrNodesIdx[clIdx]);
    //nextCls.forEach((cl, clIdx) => cl.sortedIdx = sortedNextNodesIdx[clIdx]);

    // Prepare the btn-clustering instance data
    currCls.forEach((clCurr, idxCurr) => {
      nextCls.forEach((clNext, idxNext) => {
        const filteredInstances = _.intersectionBy(clCurr.instances, clNext.instances, 'idx');
        const edge = _.find(edgesWithOutlierInfo, {'source': clCurr.idx, 'target': clNext.idx})
        let isEdgeOutlier = false;
        if (typeof(edge) !== 'undefined')
          isEdgeOutlier = edge.isOutlier == 1 ? true: false;
        else
          isEdgeOutlier = false;

        instancesBtnCls.push({
          clCurrIdx: clCurr.idx,
          clNextIdx: clNext.idx,
          sortedClCurrIdx: clCurr.idx,
          sortedClNextIdx: clNext.idx,
          numInstancesRatioInCurr: filteredInstances.length / clCurr.instances.length,
          cumNumInstancesRatioInCurr: cumNumInstancesInCurr[clCurr.idx] / clCurr.instances.length,
          cumNumInstancesRatioInNext: cumNumInstancesInNext[clNext.idx] / clNext.instances.length,
          instancesInCurr: clCurr.instances,
          instancesClToCl: filteredInstances,
          isOutlier: isEdgeOutlier
        });

        cumNumInstancesInCurr[clCurr.idx] += filteredInstances.length;
        cumNumInstancesInNext[clNext.idx] += filteredInstances.length;
      });
    });
  }
  
  function renderClToClLines(instancesBtnCls, gCurrLowerBars, gNextUpperBars) {
    // Prepare the data to draw lines
    dataForClToClLines = instancesBtnCls.map((d, i) => {
      const widthForCurrCat = clScalesForCurr[d.clCurrIdx].range()[1] - clScalesForCurr[d.clCurrIdx].range()[0];
      const widthDecayingRatio = 0.25;
      const lineWidth = widthForCurrCat * d.numInstancesRatioInCurr * widthDecayingRatio;
      return {
        clCurrIdx: d.clCurrIdx,
        clNextIdx: d.clNextIdx,
        sortedClCurrIdx: d.sortedClCurrIdx,
        sortedClNextIdx: d.sortedClNextIdx,
        numInstancesRatioInCurr: d.numInstancesRatioInCurr,
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
          y: gLayout.getGlobalElLayout(gNextUpperBars).y1 - gLayout.getGlobalElLayout(gCurrLowerBars).y2 + 5
        },
        isOutlier: d.isOutlier
      };
    });

    const drawTweetLine = d3
      .linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    const clLines = selection
      .selectAll('.cl_line')
      .data(dataForClToClLines)
      .enter()
      .append('path')
      .attr('class', d => 'cl_line cl_' + d.sortedClCurrIdx + ' cl_' + d.sortedClNextIdx)
      .attr('d', drawTweetLine)
      .style('fill', 'none')
      //.style('stroke-width', d => d.lineHeight)
      .style('stroke-width', d => d.lineWidth)
      .style('opacity', d => d.isOutlier ? 0 : 0.5);

    clLines
      .on('mouseover', function(d){

      });
  }
  
}
