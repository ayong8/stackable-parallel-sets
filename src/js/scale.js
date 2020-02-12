import * as d3 from 'd3';
import { gLayout, gColors, l, ll, lbl, llv, lCom} from './layout';

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
  catWidthScale: catWidthScale
};

scales.calculateScalesForCats = function(rawData, feature, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const catsInFeature = feature.domain;
  const instancesGrpByFeature = _.groupBy(feature.instances);
  const catScales = {};

  // Define the scales of categorical axis for heights
  const catWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, wholeWidth]);

  let cumulativeCatHeight = 0;
  catsInFeature.forEach(cat => {
    console.log('calculateScalesForCats: ', feature, instancesGrpByFeature, cat, instancesGrpByFeature[cat]);
    const numInstancesInCat = instancesGrpByFeature[cat].length, 
      numTweetRatioPerCat = numInstancesInCat / rawData.length,
      catWidth = catWidthScale(numTweetRatioPerCat),
      catStartY = cumulativeCatHeight,
      catEndY = cumulativeCatHeight + catWidth;
    cumulativeCatHeight += catWidth; // Reflect it for the next loop

    const yWithinCatScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([catStartY, catEndY]);

    catScales[cat] = yWithinCatScale;
  });

  return catScales;
}

scales.calculateScalesForCls = function(rawData, cls, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const clScales = {};

  // Define the scales of categorical axis for heights
  const barWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, wholeWidth]);

  let cumulativeCatWidth = 0;
  cls.forEach((cl, clIdx) => {
    const numTweetRatioPerCl = cl.length / rawData.length,
      catWidth = barWidthScale(numTweetRatioPerCl),
      clStartY = wholeWidth - cumulativeCatWidth,
      clEndY = wholeWidth - (cumulativeCatWidth + catWidth);
    cumulativeCatWidth += catWidth; // Reflect it for the next loop

    const yWithinClScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([clEndY, clStartY]);

    clScales[clIdx] = yWithinClScale;
  });

  return clScales;
}

scales.addScaleToFeatures = function(rawData, features, wholeWidth) {
  features.forEach(function(feature) {
    feature.scale = d3.scaleOrdinal()
                    .domain([0, 1]);

    feature.catScales = scales.calculateScalesForCats(rawData, feature, wholeWidth);
  });
  
  return features;
}
