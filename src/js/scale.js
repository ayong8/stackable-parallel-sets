import * as d3 from 'd3';
import { gLayout, gColors, l, ll, lbl, llv, lbr, lCom} from './layout';

const data = require('./dataMapping');
const {
  features, 
  goals, 
  words, 
  groups, 
  maxFreqCorr, 
  maxFreqWrong,
  pdpValues,
  dataBinCorrPredTweets,
  dataBinWrongPredTweets,
  dataBinWrongPredTweetsForGroups,
  dataBinCorrPredTweetsForGroups
} = data.dataMapping;
console.log('scale in: ');
console.log('data in scale: ', data);

//* Scales
const xFeatureScale = d3
  .scalePoint()
  .domain(features.map(({key}) => key))
  .range([50, lCom.hPlot.w - 50]);

const groupColorScale = d3
  .scaleOrdinal()
  .domain([0, 1])
  .range(gColors.groups.map(d => d.color));

const groupColorScales = groups.map((group, group_idx) => {
  return d3
    .scaleLinear()
    .domain([0, 1])
    .range(['whitesmoke', gColors.groups[group_idx].color]);
});

const groupWrongColorScale = d3
  .scaleOrdinal()
  .domain([1, 0])
  .range(['gray', gColors.group.wrong.con]);

const groupRatioScale = d3
  .scaleLinear()
  .domain([0, 0.5, 1])
  .range([gColors.group.con, 'whitesmoke', gColors.group.lib]);

// For level 1
const xGoalScale = d3
  .scaleBand()
  .domain(goals)
  .range([0, lCom.hPlot.w + lCom.hPlot.featurePlot.featureRect.w]);

const xClusterPerGoalScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, xGoalScale.bandwidth()]);

// For level 2
const xOutputProbHistScale = d3
  .scaleLinear()
  .domain([0, maxFreqCorr])
  .range([0, lCom.outputProbPlot.w / 2]);

const yOutputProbScale = d3
  .scaleLinear()
  .domain([1, 0])
  .range([0, lCom.outputProbPlot.h]);

const yGroupScale = d3 // Vertical position of outputProbPlot per group
  .scaleBand()
  .domain([0, 1])
  .range([0, lCom.outputProbPlot.h]);

const yOutputProbHistScale = d3
  .scaleBand()
  .domain(dataBinCorrPredTweets.map(d => d.x0).reverse()) // From 1 to 0
  .range([0, lCom.outputProbPlot.h / 2 - 15]);

// For level 3
const xWordScale = d3
  .scaleBand()
  .domain(words.map(d => d.word))
  .range([0, lCom.hPlot.w]);

export const globalScales = {
  groupColorScale: d3
    .scaleOrdinal()
    .domain([1, 0])
    .range(gColors.groups.map(d => d.color)),

  groupColorScales: [],

  groupWrongColorScale: d3
    .scaleOrdinal()
    .domain([1, 0])
    .range(['gray', gColors.group.wrong.con]),

  groupRatioScale: d3
    .scaleLinear()
    .domain([0, 0.5, 1])
    .range([gColors.group.con, 'whitesmoke', gColors.group.lib])
};

// For new

const catWidthScale = d3
    .scaleLinear()
    .domain([0, 2000]) // size of whole instances
    .range([llv.m.l, llv.w]); // from llv.x1 to llv.x2

export const scales = {
  xFeatureScale: xFeatureScale,
  groupColorScale: groupColorScale,
  groupColorScales: groupColorScales,
  groupWrongColorScale: groupWrongColorScale,
  groupRatioScale: groupRatioScale,
  xGoalScale: xGoalScale,
  xClusterPerGoalScale: xClusterPerGoalScale,
  xOutputProbHistScale: xOutputProbHistScale,
  yOutputProbScale: yOutputProbScale,
  yGroupScale: yGroupScale,
  yOutputProbHistScale: yOutputProbHistScale,
  xWordScale: xWordScale,
  // For new
  catWidthScale: catWidthScale,
  yLvsScale: d3.scalePoint()
};

scales.colorOnSelectScale = d3.scaleLinear()
  .domain([0, 1])
  .range(['gray', 'blue']);

scales.calculateYLevelScale = function(LVData) {
  const numLevels = LVData.length;

  this.yLvsScale = d3.scaleBand()
    .domain(d3.range(numLevels))
    .range([l.sm+l.sm, l.h - (l.sm+l.sm)]);
}

scales.calculateYBlockScale = function(lvData) {
  const mainRegionHeightInLV = (llv.h),
      numFeatures = lvData.features.length;

  return d3.scalePoint()
    .domain(d3.range(numFeatures))
    .range([llv.m.t+llv.m.b, mainRegionHeightInLV - (llv.p.b)]);
}

scales.calculateScalesForCats = function(feature, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const catsInFeature = feature.domain;
  const sortedCatsInFeature = feature.sortedIdx;
  const instancesGrpByFeature = _.groupBy(feature.instances);
  const catScales = {};
  const numAllInstances = feature.featureValues.length;
  console.log('sortedCatsInFeature: ', sortedCatsInFeature)
  console.log('feature.instances: ', feature.instances)

  // Define the scales of categorical axis for heights
  const catWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([60, wholeWidth]);

  let cumulativeCatWidth = 0;
  const widthDecayingRatio = 0.6;
  const sumCatWidths = catWidthScale(1) * widthDecayingRatio; // ratio==1; all instances
  lbl.m.btn = (wholeWidth - sumCatWidths) / (catsInFeature.length-1) // btnInterval
  sortedCatsInFeature.forEach((cat, i) => {
    const numInstancesInCat = feature.instances[cat].length, 
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

scales.calculateScalesForCls = function(rawData, sortedCls, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const clScales = {};

  // Define the scales of categorical axis for heights
  const barWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([50, wholeWidth]);

  let cumulativeClWidth = 0;
  const widthDecayingRatio = 0.6;
  const sumClWidths = barWidthScale(1) * widthDecayingRatio; // ratio==1; all instances
  lbr.m.btn = (wholeWidth - sumClWidths) / (sortedCls.length-1) // btnInterval
  sortedCls.forEach((cl, clIdx) => {
    const numTweetRatioPerCl = cl.instances.length / rawData.length,
      clWidth = barWidthScale(numTweetRatioPerCl) * widthDecayingRatio,
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

scales.addScaleToFeature = function(rawData, feature, wholeWidth) {  
  console.log('featurere: ', feature)
  return {
    'scale': d3.scaleOrdinal().domain([0, 1]),
    'catScales': scales.calculateScalesForCats(feature, wholeWidth)
  }
}
