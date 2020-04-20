import * as d3 from 'd3';
import { gLayout, gColors, l, ll, lbl, llv, lbr, lCom, lBtn} from './layout';

const catWidthScale = d3
    .scaleLinear()
    .domain([0, 2000]) // size of whole instances
    .range([llv.m.l, llv.w]); // from llv.x1 to llv.x2

const protoCircleRScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([4, 8]);

const protoPathScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([1, 4]);
  
let treemapColorScales = [
  d3.scaleLinear().domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar('--treemap-fill-cl-1')]),
  d3.scaleLinear().domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar('--treemap-fill-cl-2')]),
  d3.scaleLinear().domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar('--treemap-fill-cl-3')]),
  d3.scaleLinear().domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar('--treemap-fill-cl-4')]),
  d3.scaleLinear().domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar('--treemap-fill-cl-5')])
]

export const scales = {
  catWidthScale: catWidthScale,
  protoCircleRScale: protoCircleRScale,
  protoPathScale: protoPathScale,
  yLvsScale: d3.scalePoint(),
  colorClOnSelectScale: d3.scaleLinear(),
  colorClOnSelectTwoGroupsScale: d3.scaleLinear(),
  colorCatOnSelectScale: d3.scaleLinear(),
  treemapColorScales: []
};

scales.calculatecolorClOnSelectScale = function(cssVar) {
  this.colorClOnSelectScale = d3.scaleLinear()
    .domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar(cssVar)]);
}

scales.calculateColorCatOnSelectScale = function(cssVar) {
  this.colorCatOnSelectScale = d3.scaleLinear()
    .domain([0, 1]) 
    .range(['whitesmoke', gLayout.getCssVar(cssVar)]);
}

scales.calculateColorClOnSelectTwoGroupsScale = function(cssVarForFirstGroup, cssVarForSecondGroup) {
  this.colorClOnSelectTwoGroupsScale = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range([gLayout.getCssVar(cssVarForSecondGroup), 'whitesmoke', gLayout.getCssVar(cssVarForFirstGroup)]);
}

scales.calculateColorCatOnSelectTwoGroupsScale = function(cssVarForFirstGroup, cssVarForSecondGroup) {
  this.colorCatOnSelectTwoGroupsScale = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range([gLayout.getCssVar(cssVarForSecondGroup), 'lightgray', gLayout.getCssVar(cssVarForFirstGroup)]);
}

scales.calculateColorTreemapsScale = function(cssVar, i) {
  this.treemapColorScales.push(d3.scaleLinear()
    .domain([0, 1]) 
    .range(['whitesmoke', gLayout.getCssVar(cssVar)]));
}


scales.calculateYLevelScale = function(LVData) {
  const numLevels = LVData.length;
  const wholeHeight = l.h - (l.sm+l.sm);

  const heightPerFeature = lbl.h;
  let rangeForLvs = [];
  let cumulativeLvHeight = l.sm+l.sm;
  rangeForLvs.push(cumulativeLvHeight);
  LVData.forEach(function(lvData){
    if (lvData.mode.folded == true) {
      cumulativeLvHeight += 20 + lBtn.h;
    } else if (lvData.mode.folded == false) {
      cumulativeLvHeight += lvData.features.length * heightPerFeature + lBtn.h;
    }
    rangeForLvs.push(cumulativeLvHeight);
  });
  

  this.yLvsScale = d3.scaleOrdinal()
    .domain(d3.range(numLevels+1))
    .range(rangeForLvs);
}

scales.calculateYBlockScale = function(lvData) {
  const mainRegionHeightInLV = this.yLvsScale(lvData.idx+1) - this.yLvsScale(lvData.idx),
      numFeatures = lvData.features.length;

  return d3.scalePoint()
    .domain(d3.range(numFeatures))
    .range([llv.m.t+llv.m.b, mainRegionHeightInLV - (llv.p.b + lBtn.h)]);
}

scales.calculateScalesForCats = function(feature, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const catScales = {};
  const sortedCats = feature.cats;
  const numAllInstances = feature.featureValues.length;

  // Define the scales of categorical axis for heights
  const catWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, wholeWidth-llv.m.r]);

  let cumulativeCatWidth = 0;
  const widthDecayingRatio = 1;
  const sumCatWidths = catWidthScale(1) * widthDecayingRatio; // ratio==1; all instances
  // lbl.m.btn = (wholeWidth - sumCatWidths) / (catsInFeature.length-1) // btnInterval
  sortedCats.forEach((cat, i) => {
    const numInstancesInCat = cat.instances.length, 
      numTweetRatioPerCat = numInstancesInCat / numAllInstances,
      catWidth = catWidthScale(numTweetRatioPerCat) * widthDecayingRatio,
      catEndY = cumulativeCatWidth + catWidth;
    let catStartY = 0;
    if (i==0) catStartY = lbl.m.btn + cumulativeCatWidth;
    else catStartY = cumulativeCatWidth + lbl.m.btn;
    cumulativeCatWidth += catWidth; // Reflect it for the next loop

    const yWithinCatScale = d3
      .scaleLinear()
      .domain([0, 1]) 
      .range([catStartY, catEndY]);

    catScales[i] = yWithinCatScale;
  });

  return catScales;
}

scales.calculateScalesForCls = function(bipartiteMode, sortedCls, wholeWidth, totalCnt) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const clScales = {};

  // Define the scales of categorical axis for heights
  const barWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([10, wholeWidth-30]);

  let cumulativeClWidth = 0;
  const widthDecayingRatio = 0.9;
  const sumClWidths = barWidthScale(1) * widthDecayingRatio; // ratio==1; all instances
  // lbr.m.btn = (wholeWidth - sumClWidths) / (sortedCls.length-1) // btnInterval
  
  sortedCls.forEach((cl, clIdx) => {
    console.log('cl and total cnt: ', data.calculateClToClFreqForBipartite(cl.instances), totalCnt);
    let numInstancesRatioPerCl = 0;
    if (bipartiteMode == 0) 
      numInstancesRatioPerCl = cl.instances.length / totalCnt;
    else if (bipartiteMode == 1) 
      numInstancesRatioPerCl = data.calculateClToClFreqForBipartite(cl.instances) / totalCnt;
    const clWidth = barWidthScale(numInstancesRatioPerCl) * widthDecayingRatio,
      clEndY = cumulativeClWidth + clWidth;

    let clStartY = 0;
    if (cl.idx==0) clStartY = lbl.m.btn + cumulativeClWidth;
    else clStartY = cumulativeClWidth + lbr.m.btn;
    cumulativeClWidth += clWidth; // Reflect it for the next loop

    const yWithinClScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([clStartY, clEndY]);

    clScales[cl.idx] = yWithinClScale;
  });

  return clScales;
}

scales.setScaleToFeature = function(rawData, feature, wholeWidth) {  
  return {
    'scale': d3.scaleOrdinal().domain([0, 1]),
    'catScales': scales.calculateScalesForCats(feature, wholeWidth)
  }
}
