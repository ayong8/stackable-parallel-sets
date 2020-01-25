import * as d3 from 'd3';
import {l, ll, lCom, globalColors} from './style';

const data = require('./data');
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
} = data.data;
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
  .range(globalColors.groups.map(d => d.color));

const groupColorScales = groups.map((group, group_idx) => {
  return d3
    .scaleLinear()
    .domain([0, 1])
    .range(['whitesmoke', globalColors.groups[group_idx].color]);
});

const groupWrongColorScale = d3
  .scaleOrdinal()
  .domain([1, 0])
  .range(['gray', globalColors.group.wrong.con]);

const groupRatioScale = d3
  .scaleLinear()
  .domain([0, 0.5, 1])
  .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib]);

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
    .range(globalColors.groups.map(d => d.color)),

  groupColorScales: [],

  groupWrongColorScale: d3
    .scaleOrdinal()
    .domain([1, 0])
    .range(['gray', globalColors.group.wrong.con]),

  groupRatioScale: d3
    .scaleLinear()
    .domain([0, 0.5, 1])
    .range([globalColors.group.con, 'whitesmoke', globalColors.group.lib])
};

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
  xWordScale: xWordScale
};
