console.log('index in: ');

import * as d3 from 'd3';
import skmeans from 'skmeans';
import { globalScales, scales } from './scale';
import { l, ll, lCom } from './style';
import {
  renderClBars,
  renderClRectsBtnLv,
  renderControlRect,
  drawLinesFromClsToCls
} from './render';

import Container from './block';
import Level1Plot from './Level1Plot';
import Level2Plot from './Level2Plot';
import Level3Plot from './Level3Plot';

import "../css/index.css";

const data = require('./data');

const {
  demoData,
  featureLevelData,
  tweets,
  features, 
  goals, 
  words, 
  groups, 
  maxFreqCorr, 
  maxFreqWrong,
  pdpValues,
  pdpValuesForGroups,
  tweetsCorrPred,
  tweetsWrongPred,
  tweetsConWrongPred,
  tweetsLibWrongPred,
  dataBinCorrPredTweets,
  dataBinWrongPredTweets,
  dataBinWrongPredTweetsForGroups,
  dataBinCorrPredTweetsForGroups,
  cooc
} = data.data;

const {
  xFeatureScale,
  groupColorScale,
  groupColorScales,
  groupWrongColorScale,
  groupRatioScale,
  xGoalScale,
  xClusterPerGoalScale,
  xOutputProbHistScale,
  yOutputProbScale,
  yGroupScale,
  yOutputProbHistScale,
  xWordScale
} = scales;

// var view = [layout.width / 2, layout.height / 2, layout.height / 2];
const container = d3.select('#container'),
  svg = container
    .append('svg')
    .attr('width', l.w)
    .attr('height', l.h)
    .attr('class', 'svg');

//* Containers
const gHPlot = svg
  .append('g')
  .attr('class', 'g_h_plot')
  .attr('transform', 'translate(' + lCom.hPlot.l + ',' + lCom.hPlot.t + ')');

const gLevel1 = gHPlot
    .append('g')
    .attr('class', 'g_level1 level')
    .attr('transform', 'translate(' + 0 + ',' + ll.l1.t + ')'),
  gL1ToL2 = gHPlot
    .append('g')
    .attr('class', 'g_l1_to_l2 level')
    .attr('transform', 'translate(' + 0 + ',' + ll.l1ToL2.t + ')'),
  gLevel2 = gHPlot
    .append('g')
    .attr('class', 'g_level2 level')
    .attr('transform', 'translate(' + 0 + ',' + ll.l2.t + ')'),
  gL2ToL3 = gHPlot
    .append('g')
    .attr('class', 'g_l2_to_l3 level')
    .attr('transform', 'translate(' + 0 + ',' + ll.l2ToL3.t + ')'),
  gLevel3 = gHPlot
      .append('g')
      .attr('class', 'g_level3')
      .attr('transform', 'translate(' + 0 + ',' + ll.l3.t + ')');

const goalPlot = Level1Plot();
const featurePlot = Level2Plot();
const wordPlot = Level3Plot();

let featuresForL1 = ['valence'];
let featureForL2 = ['valence', 'arousal'];

let dataClsForL1 = clusterBy(tweets, 'valence');
let dataClsForL2 = clusterBy(tweets, 'dominance');
let dataClsForL3 = clusterBy(tweets, 'valence');

// Mockup data for now
dataClsForL1 = [
  { cl: 0, idx: [1,2,3], countRatio: 0.3, groupRatio: 0.2 },
  { cl: 1, idx: [4,5], countRatio: 0.2, groupRatio: 0.4 },
  { cl: 2, idx: [6], countRatio: 0.1, groupRatio: 0.8 },
  { cl: 3, idx: [7,8,9,0], countRatio: 0.4, groupRatio: 0.1 }
];

dataClsForL2 = [
  { cl: 0, idx: [1,2,3,4], countRatio: 0.4, groupRatio: 0.2 },
  { cl: 1, idx: [5], countRatio: 0.1, groupRatio: 0.4 },
  { cl: 2, idx: [6,7,8,9], countRatio: 0.4, groupRatio: 0.8 },
  { cl: 3, idx: [0], countRatio: 0.1, groupRatio: 0.1 }
];

dataClsForL3 = [
  { cl: 0, idx: [1], countRatio: 0.1, groupRatio: 0.2 },
  { cl: 1, idx: [2,3], countRatio: 0.2, groupRatio: 0.4 },
  { cl: 2, idx: [4,5,6,7,8,9], countRatio: 0.6, groupRatio: 0.8 },
  { cl: 3, idx: [0], countRatio: 0.1, groupRatio: 0.1 }
];

const dataCl1ToCl2 = [
  { idx: 0, cl1: 3, cl2: 3 },
  { idx: 1, cl1: 0, cl2: 0 },
  { idx: 2, cl1: 0, cl2: 0 },
  { idx: 3, cl1: 0, cl2: 0 },
  { idx: 4, cl1: 1, cl2: 0 },
  { idx: 5, cl1: 1, cl2: 1 },
  { idx: 6, cl1: 2, cl2: 2 },
  { idx: 7, cl1: 3, cl2: 2 },
  { idx: 8, cl1: 3, cl2: 2 },
  { idx: 9, cl1: 3, cl2: 2 }
];

const dataCl2ToCl3   = [
  { idx: 0, cl1: 3, cl2: 3 },
  { idx: 1, cl1: 0, cl2: 0 },
  { idx: 2, cl1: 0, cl2: 1 },
  { idx: 3, cl1: 0, cl2: 1 },
  { idx: 4, cl1: 0, cl2: 2 },
  { idx: 5, cl1: 1, cl2: 2 },
  { idx: 6, cl1: 2, cl2: 2 },
  { idx: 7, cl1: 2, cl2: 2 },
  { idx: 8, cl1: 2, cl2: 2 },
  { idx: 9, cl1: 2, cl2: 2 }
]

//* Subcomponents
gLevel3.call(
        wordPlot
          .dataForWords(words)
          .dataForCooc(cooc)
          .xWordScale(xWordScale)
          .coocThreshold(0.2)
      );
      
gLevel2.call(
  featurePlot
    .dataLoader([
      groups,
      tweets,
      features,
      pdpValues,
      pdpValuesForGroups,
      // dataBinCorrPredTweets,
      // dataBinCorrPredTweetsForGroups,
      // dataBinWrongPredTweetsForGroups,
      tweetsCorrPred,
      tweetsConWrongPred,
      tweetsLibWrongPred
    ])
    .xFeatureScale(xFeatureScale)
    .xOutputProbHistScale(xOutputProbHistScale)
    .yOutputProbScale(yOutputProbScale)
    .yGroupScale(yGroupScale)
    .yOutputProbHistScale(yOutputProbHistScale)
    .groupColorScale(groupColorScale)
    .groupRatioScale(groupRatioScale)
);

gL1ToL2
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ll.l1ToL2.w)
    .attr('height', ll.l1ToL2.h)
    .style('fill', 'none');

gLevel1.call(
  goalPlot
    .dataForGoals(goals)
    //.dataForClusterForGoals(clustersForGoals)
    .dataForFeatures(features)
    .xGoalScale(xGoalScale)
    .xClusterPerGoalScale(xClusterPerGoalScale)
);

console.log('ll.l1.w: ', ll.l1.w)
renderClRectsBtnLv(dataClsForL1, gLevel1, 'bottom', ll.l1.w, ll.l1.h);
renderClRectsBtnLv(dataClsForL2, gLevel2, 'top', ll.l2.w, ll.l2.h);
renderClRectsBtnLv(dataClsForL2, gLevel2, 'bottom', ll.l2.w, ll.l2.h);
renderClRectsBtnLv(dataClsForL3, gLevel3, 'top', ll.l3.w, ll.l3.h);

renderControlRect(gLevel1, 'bottom', 1, 'emotion');
renderControlRect(gLevel2, 'top', 2, 'valence');
renderControlRect(gLevel2, 'bottom', 2, 'valence');
renderControlRect(gLevel3, 'top', 3, 'gun');

drawLinesFromClsToCls(gL1ToL2, dataClsForL1, dataClsForL2, dataCl1ToCl2);
drawLinesFromClsToCls(gL2ToL3, dataClsForL2, dataClsForL3, dataCl2ToCl3);

function clusterBy(tweets, feature) {
  const tweetsByF = tweets.map(d => d[feature])
  console.log('tweetsByF: ', tweetsByF);
  let clusters = skmeans(tweetsByF, 5);
  console.log('clusters: ', clusters);
  
  return clusters;
}


// For new codes
console.log('demoData: ', demoData);

fetch('/dataset/loadData', {
  method: 'get'
})
.then((response) => {
  return response.json();
})
.then((dataset) => {
  console.log('response in fetch index.js: ', dataset);

  // Structure of the dataset
  const featureLevelData = [
    { 
      lvId: 1, 
      lvName: 'demographic',
      features: [
        { 
          name: 'dd',
          type: 'categorical',
          clusters: []
        }
      ],
      cls: [
        {
          id: 1,
          size: 100
        },
        {
          id: 1,
          size: 200
        }
      ]
    }
  ];

  

  const svg2 = container
    .append('svg')
    .attr('width', l.w)
    .attr('height', l.h)
    .attr('class', 'svg2');
  const container1 = Container();

  svg2.call(
    container1
      .data(featureLevelData)
  );
})



