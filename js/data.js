console.log('data in');

import * as d3 from 'd3';
import _ from 'lodash';

import {l, ll, lCom} from './style';

import tweets from '../data/tweets';
import groups from '../data/groups';
import words from '../data/words';
import goals from '../data/goals';
import features from '../data/features';
import pdpValues from '../data/pdpValues';
import pdpValuesForGroups from '../data/pdpValuesForGroups';
import cooc from '../data/cooc';

// feature-level data
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

fetch('http://localhost:8000/dataset/loadData/', {
  method: 'get'
})
.then((response) => {
  console.log('test get');
  return response.json();
})
.then((response) => {
  console.log('response: ', response);
});

const tweetsCorrPred = tweets.filter(d => d.group === d.pred),
  tweetsWrongPred = tweets.filter(d => d.group !== d.pred);

const tweetsConWrongPred = tweets.filter(d => d.group !== d.pred && d.group === '0'),
  tweetsLibWrongPred = tweets.filter(d => d.group !== d.pred && d.group === '1');

const dataBinCorrPredTweets = d3
    .histogram()
    .domain([0, 1])
    .value(d => d.prob)
    .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
  dataBinWrongPredTweets = d3
    .histogram()
    .domain([0, 1])
    .value(d => d.prob)
    .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

// For histogram scale
const maxFreqCorr = _.max(dataBinCorrPredTweets.map(d => d.length)),
  maxFreqWrong = _.max(dataBinWrongPredTweets.map(d => d.length));

let dataBinWrongPredTweetsForGroups = [];
let dataBinCorrPredTweetsForGroups = [];

groups.forEach((group, groupIdx) => {
  const tweetsCorrPred = tweets.filter(d => d.group === d.pred && d.group === groupIdx.toString()),
    tweetsWrongPred = tweets.filter(d => d.group !== d.pred && d.group === groupIdx.toString()),
    dataBinCorrPredTweets = d3
      .histogram()
      .domain([0, 1])
      .value(d => d.prob)
      .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
    dataBinWrongPredTweets = d3
      .histogram()
      .domain([0, 1])
      .value(d => d.prob)
      .thresholds(d3.range(0, 1, 0.05))(tweetsWrongPred);

  dataBinCorrPredTweetsForGroups.push(dataBinCorrPredTweets);
  dataBinWrongPredTweetsForGroups.push(dataBinWrongPredTweets);
});

features.forEach(feature => {
  if (feature.type == 'continuous') {
    feature.scale = d3.scaleLinear();
    feature.pdScale = d3.scaleLinear();

    feature.scale
      .domain(feature.domain)
      .range([lCom.hPlot.featurePlot.featureRect.h - lCom.hPlot.featurePlot.featureRect.m, lCom.hPlot.featurePlot.featureRect.m]);
    feature.pdScale
      .domain([0, 1])
      .range([0, lCom.hPlot.featurePlot.pdp.w]);
  } else if (feature.type == 'categorical') {
    feature.scale = d3.scaleBand();
    feature.pdScale = d3.scaleLinear();

    // rangeList = d3.range(numCategory).map(
    //   idx => height - (height / (numCategory - 1)) * idx // e.g., 100 - (100/3) * 1 - when there are 4 categories
    // );

    feature.scale
      .domain(feature.domain)
      .range([lCom.hPlot.featurePlot.featureRect.h, 0]);
    feature.pdScale
      .domain([0, 1])
      .range([lCom.hPlot.featurePlot.featureRect.m, lCom.hPlot.featurePlot.pdp.w - lCom.hPlot.featurePlot.featureRect.m]);
  }
});

export const data = {
  featureLevelData: featureLevelData,
  tweets: tweets,
  groups: groups,
  words: words,
  goals: goals,
  features: features,
  pdpValues: pdpValues,
  pdpValuesForGroups: pdpValuesForGroups,
  tweetsCorrPred: tweetsCorrPred,
  tweetsWrongPred: tweetsWrongPred,
  tweetsConWrongPred: tweetsConWrongPred,
  tweetsLibWrongPred: tweetsLibWrongPred,
  dataBinCorrPredTweets: dataBinCorrPredTweets,
  dataBinWrongPredTweets: dataBinWrongPredTweets,
  dataBinWrongPredTweetsForGroups: dataBinWrongPredTweetsForGroups,
  dataBinCorrPredTweetsForGroups: dataBinCorrPredTweetsForGroups,
  maxFreqCorr: maxFreqCorr,
  maxFreqWrong: maxFreqWrong,
  cooc: cooc
};
