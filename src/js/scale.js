import * as d3 from 'd3';
import { gLayout, gColors, l, ll, lbl, llv, lbr, lCom} from './layout';

const data = require('./dataMapping');


const catWidthScale = d3
    .scaleLinear()
    .domain([0, 2000]) // size of whole instances
    .range([llv.m.l, llv.w]); // from llv.x1 to llv.x2

export const scales = {
  catWidthScale: catWidthScale,
  yLvsScale: d3.scalePoint(),
  colorOnSelectScale: d3.scaleLinear(),
  colorOnCatOnSelectScale: d3.scaleLinear()
};

scales.calculateColorOnSelectScale = function(cssVar) {
  this.colorOnSelectScale = d3.scaleLinear()
    .domain([0, 1])
    .range(['lightgray', gLayout.getCssVar(cssVar)]);
}

scales.calculateColorCatOnSelectScale = function(cssVar) {
  this.colorCatOnSelectScale = d3.scaleLinear()
    .domain([0, 1])
    .range(['whitesmoke', gLayout.getCssVar(cssVar)]);
}

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
  const catScales = {};
  const sortedCats = feature.cats;
  const numAllInstances = feature.featureValues.length;

  // Define the scales of categorical axis for heights
  const catWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, wholeWidth-20]);

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

scales.calculateScalesForCls = function(rawData, sortedCls, wholeWidth) { //feature
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const clScales = {};

  // Define the scales of categorical axis for heights
  const barWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, wholeWidth-20]);

  let cumulativeClWidth = 0;
  const widthDecayingRatio = 1;
  const sumClWidths = barWidthScale(1) * widthDecayingRatio; // ratio==1; all instances
  // lbr.m.btn = (wholeWidth - sumClWidths) / (sortedCls.length-1) // btnInterval
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

scales.setScaleToFeature = function(rawData, feature, wholeWidth) {  
  console.log('featurere: ', feature)
  return {
    'scale': d3.scaleOrdinal().domain([0, 1]),
    'catScales': scales.calculateScalesForCats(feature, wholeWidth)
  }
}
