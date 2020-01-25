import * as d3 from 'd3';
import _ from 'lodash';
import d3tooltip from 'd3-tooltip';

import {
  renderClBars,
  renderClRectsBtnLv
} from './render';

import Axes from './Axes';
import {globalColors, l, ll, lCom} from './style';
import {globalScales, scales} from './scale';

let layout = {
  featurePlot: {
    width: 450,
    height: 240
  },
  outputProbPlot: {
    width: 70,
    height: 240,
    leftMargin: 80,
    minRadius: 4,
    maxRadius: 10
  }
};

const tooltip = d3tooltip(d3);

function Level2Plot() {
  var width = 720,
    height = 80,
    rectWidth = 100;

  let dataLoader = [];

  let xOutputProbHistScale = '';
  let yOutputProbScale = '';
  let yGroupScale = '';
  let yOutputProbHistScale = '';
  let xFeatureScale = '';
  let groupColorScale = '';
  let groupRatioScale = '';

  function _level2Plot(selection) {
    const globalMode = 1;
    const [
      groups,
      tweets,
      features,
      pdpValues,
      pdpValuesForGroups,
      // dataBinCorrPredTweets,
      // dataBinCorrPredTweetsForGroups,
      // dataBinWrongPredTweetsForGroups,
      // dataBinConWrongPredTweets,
      // dataBinLibWrongPredTweets,
      tweetsCorrPred,
      tweetsConWrongPred,
      tweetsLibWrongPred
    ] = dataLoader;

    const xFeatureScaleBandwidth = xFeatureScale(features[1].key) - xFeatureScale(features[0].key);
    const axes = Axes();
    // const yOutputProbSetting = d3
    //   .axisLeft(yOutputProbScale)
    //   .tickValues([0, 0.5, 1])
    //   .tickSize(1);

    // Render level bars
    renderClBars(selection, 2);

    const gOutputProbPlot = selection
      .append('g')
      .attr('class', 'g_output_prob_plot')
      .attr(
        'transform',
        'translate(' +
          (layout.featurePlot.width + layout.outputProbPlot.leftMargin + layout.outputProbPlot.maxRadius * 2 + 40) +
          ',0)'
      );

    //* For the current version
    // groups.forEach((group, groupIdx) => {
    //   const gOutputProbPlot = selection
    //     .append('g')
    //     .attr('class', 'g_output_prob_plot')
    //     .attr('transform', 'translate(' + lCom.outputProbPlot.l + ',' + yGroupScale(groupIdx) + ')');

    //   gOutputProbPlot
    //     .append('text')
    //     .text(group.name === 'conservative' ? 'Red' : 'Blue')
    //     .attr('x', 20)
    //     .attr('y', -l.textHeight)
    //     .style('font-size', '0.8rem')
    //     .style('fill', 'gray');

    //   gOutputProbPlot
    //     .append('g')
    //     .call(yOutputProbSetting)
    //     .attr('class', 'g_output_prob_axis')
    //     .attr('transform', 'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')');

    //   // tweetHistForCorrectPred
    //   gOutputProbPlot
    //     .append('g')
    //     .attr('class', 'g_output_prob_for_corr_pred_' + group.abbr)
    //     .attr('transform', d => {
    //       return 'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')';
    //     })
    //     .selectAll('.rect_output_for_corr_' + group.abbr)
    //     .data(dataBinWrongPredTweetsForGroups[groupIdx])
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'rect_output_for_corr_' + group.abbr)
    //     .attr('x', 3)
    //     .attr('y', d => yOutputProbHistScale(d.x0))
    //     .attr('width', d => xOutputProbHistScale(d.length))
    //     .attr('height', yOutputProbHistScale.bandwidth() - 0.5)
    //     .style('fill', globalColors.groups[groupIdx].color)
    //     .style('opacity', 0.5);

    //   // tweetHistForWrongPred
    //   gOutputProbPlot
    //     .append('g')
    //     .attr('class', 'g_output_prob_for_wrong_pred_' + group.abbr)
    //     .attr('transform', d => {
    //       return 'translate(' + 0 + ',' + 0 + ')';
    //     })
    //     .selectAll('.rect_output_for_wrong_')
    //     .data(dataBinWrongPredTweetsForGroups[groupIdx])
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'rect_output_for_wrong_')
    //     .attr('x', d => lCom.outputProbPlot.w / 2 - 3 - xOutputProbHistScale(d.length))
    //     .attr('y', d => yOutputProbHistScale(d.x0))
    //     .attr('width', d => xOutputProbHistScale(d.length))
    //     .attr('height', yOutputProbHistScale.bandwidth() - 0.5)
    //     .style('fill', d => globalColors.groups[groupIdx].colorForWrong)
    //     .style('opacity', 0.5);
    // });

    //* For the previous version
    // Calculate the histogram data
    const dataBinCorrPredTweets = d3
        .histogram()
        .domain([0, 1])
        .value(d => d.prob)
        .thresholds(d3.range(0, 1, 0.05))(tweetsCorrPred),
      dataBinConWrongPredTweets = d3
        .histogram()
        .domain([0, 1])
        .value(d => d.prob)
        .thresholds(d3.range(0, 1, 0.05))(tweetsConWrongPred),
      dataBinLibWrongPredTweets = d3
        .histogram()
        .domain([0, 1])
        .value(d => d.prob)
        .thresholds(d3.range(0, 1, 0.05))(tweetsLibWrongPred);

    const maxFreq = _.max(dataBinCorrPredTweets.map(d => d.length)),
      maxFreqConWrong = _.max(dataBinConWrongPredTweets.map(d => d.length)),
      maxFreqLibWrong = _.max(dataBinLibWrongPredTweets.map(d => d.length));

    const xOutputProbCorrHistScale = d3
      .scaleLinear()
      .domain([0, maxFreq])
      .range([0, lCom.outputProbPlot.w / 2]);

    const xOutputProbWrongHistScale = d3
      .scaleLinear()
      .domain([0, _.max([maxFreqConWrong, maxFreqLibWrong])])
      .range([0, lCom.outputProbPlot.w / 2]);

    const yOutputProbScale = d3
      .scaleLinear()
      .domain([1, 0])
      .range([l.sm, lCom.outputProbPlot.h]);

    const yGroupScale = d3
      .scaleOrdinal()
      .domain([1, 0])
      .range([l.sm, lCom.outputProbPlot.h]);

    const yOutputProbHistBinScale = d3
      .scaleBand()
      .domain(dataBinCorrPredTweets.map(d => d.x0).reverse()) // From 1 to 0
      .range([l.sm, lCom.outputProbPlot.h]);

    const yOutputProbSetting = d3.axisLeft(yOutputProbScale).tickValues([0, 0.5, 1]);

    // gOutputProbPlot
    //   .append('g')
    //   .call(yOutputProbSetting)
    //   .attr('class', 'g_output_prob_axis')
    //   .attr('transform', 'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')');

    // // tweetHistForCorrectPred
    // gOutputProbPlot
    //   .append('g')
    //   .attr('class', 'g_output_prob_hist_for_correct_pred')
    //   .attr('transform', d => {
    //     return 'translate(' + lCom.outputProbPlot.w / 2 + ',' + 0 + ')';
    //   })
    //   .selectAll('.rect_output_prob_hist_for_correct_pred')
    //   .data(dataBinCorrPredTweets)
    //   .enter()
    //   .append('rect')
    //   .attr('class', 'rect_output_prob_hist_for_correct_pred')
    //   .attr('x', 3)
    //   .attr('y', d => yOutputProbHistBinScale(d.x0))
    //   .attr('width', d => xOutputProbCorrHistScale(d.length))
    //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
    //   .style('fill', d => (d.x0 >= 0.5 ? globalColors.group.lib : globalColors.group.con))
    //   .style('opacity', 0.5);

    // // tweetLibHistForWrongPred
    // gOutputProbPlot
    //   .append('g')
    //   .attr('class', 'g_output_prob_con_hist_for_lib_wrong_pred')
    //   .attr('transform', d => {
    //     return 'translate(' + 0 + ',' + 0 + ')';
    //   })
    //   .selectAll('.rect_output_prob_hist_for_lib_wrong_pred')
    //   .data(dataBinLibWrongPredTweets)
    //   .enter()
    //   .append('rect')
    //   .attr('class', 'rect_output_prob_hist_for_lib_wrong_pred')
    //   .attr('x', d => lCom.outputProbPlot.w / 2 - 3 - xOutputProbWrongHistScale(d.length))
    //   .attr('y', d => yOutputProbHistBinScale(d.x0))
    //   .attr('width', d => xOutputProbWrongHistScale(d.length))
    //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
    //   .style('fill', d => globalColors.group.wrong.lib)
    //   .style('opacity', 0.5);

    // // tweetLibHistForWrongPred
    // gOutputProbPlot
    //   .append('g')
    //   .attr('class', 'g_output_prob_con_hist_for_con_wrong_pred')
    //   .attr('transform', d => {
    //     return 'translate(' + 0 + ',' + 0 + ')';
    //   })
    //   .selectAll('.rect_output_prob_hist_for_con_wrong_pred')
    //   .data(dataBinConWrongPredTweets)
    //   .enter()
    //   .append('rect')
    //   .attr('class', 'rect_output_prob_hist_for_con_wrong_pred')
    //   .attr('x', d => lCom.outputProbPlot.w / 2 - 3 - xOutputProbWrongHistScale(d.length))
    //   .attr('y', d => yOutputProbHistBinScale(d.x0))
    //   .attr('width', d => xOutputProbWrongHistScale(d.length))
    //   .attr('height', yOutputProbHistBinScale.bandwidth() - 0.5)
    //   .style('fill', d => globalColors.group.wrong.con)
    //   .style('opacity', 0.5);

    // const gFeatureToOutputLines = svg
    //   .append('g')
    //   .attr('class', 'g_feature_to_output_paths')
    //   .attr('transform', 'translate(' + lCom.hPlot.featurePlot.w + ',0)');

    // const xFeatureToOutputScale = d3
    //   .scaleOrdinal()
    //   .domain([0, 1])
    //   .range([
    //     0,
    //     lCom.hPlot.featureToOutputLines.w +
    //       l.mm -
    //       20
    //   ]);

    // const featureToOutputLinesData = gFeatureToOutputLines
    //   .selectAll('.line_feature_to_output')
    //   .data(tweets);

    // featureToOutputLinesData
    //   .enter()
    //   .append('line')
    //   .attr(
    //     'class',
    //     d => 'line_feature_to_output line_feature_to_output_' + d.clusterId
    //   )
    //   .attr('x1', xFeatureToOutputScale(0))
    //   .attr('y1', d => {
    //     const lastFeature = selectedFeatures[selectedFeatures.length - 1].key;
    //     return lastFeature === 'care'
    //       ? yCareScale(d[lastFeature])
    //       : lastFeature === 'fairness'
    //       ? yFairnessScale(d[lastFeature])
    //       : yVDScale(d[lastFeature]);
    //   })
    //   .attr('x2', d => xFeatureToOutputScale(1))
    //   .attr('y2', d =>
    //     globalMode === 0 ? yGroupScale(d.group) : yOutputProbScale(d.prob)
    //   )
    //   .style('stroke', d =>
    //     d.group === d.pred
    //       ? groupColorScale(d.group)
    //       : groupWrongColorScale(d.group)
    //   )
    //   // .style('stroke-dasharray', d => (d.group === d.pred ? 'none' : '4,5'))
    //   .style('stroke-width', 0.3)
    //   .style('opacity', d => 0.3);

    // featureToOutputLinesData
    //   .attr('x1', xFeatureToOutputScale(0))
    //   .attr('y1', d => {
    //     const lastFeature = selectedFeatures[selectedFeatures.length - 1].key;
    //     return lastFeature === 'care'
    //       ? yCareScale(d[lastFeature])
    //       : lastFeature === 'fairness'
    //       ? yFairnessScale(d[lastFeature])
    //       : yVDScale(d[lastFeature]);
    //   })
    //   .attr('x2', d => xFeatureToOutputScale(1))
    //   .attr('y2', d =>
    //     globalMode === 0 ? yGroupScale(d.group) : yOutputProbScale(d.prob)
    //   );

    // featureToOutputLinesData.exit().remove();

    //* FeaturePlot
    const gFeaturePlot = selection
      .append('g')
      .attr('class', 'g_feature_plot')
      .attr('transform', 'translate(0,' + (lCom.hPlot.cl.btn.rect.h + lCom.hPlot.cl.btn.m + 20) + ')');

    const featureTitleData = gFeaturePlot
      .selectAll('text')
      .data(features)
      .enter();

    // featureTitleData // feature title text
    //   .append('text')
    //   .text(d => d.abbr)
    //   .attr('x', (d, i) => xFeatureScale(d.key) - 10)
    //   .attr('y', (d, i) => 10)
    //   .style('font-size', '0.8rem');

    //* Render tweet lines
    const drawTweetLine = d3
      .linkHorizontal()
      .x(d => d.x)
      .y(d => d.y);

    const gTweetLinesForFeatures = gFeaturePlot
      .selectAll('.g_tweet_line')
      .data(features)
      .enter()
      .append('g')
      .attr('class', (d, i) => 'g_tweet_line g_tweet_line_' + i)
      .attr('transform', function(d, i) {
        return 'translate(' + (xFeatureScale(d.key) + lCom.hPlot.featurePlot.featureRect.w) + ')';
      });

    // Prepare data for linkHorizontal
    gTweetLinesForFeatures.each(function(feature, featureIdx) {
      if (featureIdx !== features.length - 1) {
        // Except for the last feature
        const gFeatureSelected = d3.select(this);
        const currFeature = feature,
          nextFeature = features[featureIdx + 1];
        const currentFeatureScale = feature.scale,
          nextFeatureScale = nextFeature.scale;

        if (currFeature.type == 'continuous' && nextFeature.type == 'continuous') drawLinesFromContToCont();
        else if (currFeature.type == 'continuous' && nextFeature.type == 'categorical') drawLinesFromContToCat();
        else if (currFeature.type == 'categorical' && nextFeature.type == 'continuous') drawLinesFromCatToCont();
        else if (currFeature.type == 'categorical' && nextFeature.type == 'categorical') drawLinesFromCatToCat();

        function drawLinesFromContToCat() {
          // Groupby data and Count the number of tweets in each feature

          // Go over categories in its expected order [3,0,1,2]
          const catsInFeature = nextFeature.domain,
            catScales = calculateScalesForCats(tweets, nextFeature);

          // Then each category areas should have their own scale
          const tweetsOrderByContFeatures = _.orderBy(tweets, tweet => tweet[currFeature.key], ['desc']);
          let dataForLines = [];
          catsInFeature.forEach(catNext => {
            const tweetsPerCat = tweetsOrderByContFeatures.filter(d => d[nextFeature.key] === catNext),
              numTweetsPerCat = tweetsPerCat.length;
            const catStartY = catScales[catNext].range()[0],
              catEndY = catScales[catNext].range()[1],
              catHeight = catEndY - catStartY;
            const dataForLinesForCat = tweetsPerCat.map((d, i) => ({
              group: d.group,
              tweetId: d.tweetId,
              source: {x: 0, y: currentFeatureScale(d[currFeature.key])},
              target: {
                x: xFeatureScaleBandwidth - lCom.hPlot.featurePlot.featureRect.w - lCom.hPlot.featurePlot.featureRect.cat.m - 2,
                y: catStartY + (catHeight / numTweetsPerCat) * i
              }
            }));
            dataForLines.push(...dataForLinesForCat);
          });

          // Add lines from previous feature to cat axes of next features
          gFeatureSelected
            .selectAll('.tweet_line')
            .data(dataForLines)
            .enter()
            .append('path')
            .attr('class', d => 'tweet_line tweet_line_' + d.tweetId)
            .attr('d', drawTweetLine)
            .style('fill', 'none')
            .style('stroke', d => groupColorScale(d.group))
            .style('opacity', 0.2)
            .on('click', function(d, i) {});

          const tweetsGrpByFeature = _.groupBy(tweets, d => d[nextFeature.key]);

          // Add lines for groups

          // Add auxilary axis
          gFeaturePlot
            .selectAll('.aux_axis_for_cat_features')
            .data(catsInFeature)
            .enter()
            .append('rect')
            .attr('class', cat => 'aux_axis_for_cat_features_' + nextFeature + '_' + cat)
            .attr('x', xFeatureScale(nextFeature.key) - lCom.hPlot.featurePlot.featureRect.cat.m)
            .attr('y', cat => catScales[cat].range()[0])
            .attr('width', 5)
            .attr('height', cat => catScales[cat].range()[1] - catScales[cat].range()[0])
            .style('fill', cat => {
              const numTweetsInCat = tweetsGrpByFeature[cat].length;
              const tweetsGrpByGrp = _.groupBy(tweetsGrpByFeature[cat], d => d.group);
              const numLibTweetsInCat = tweetsGrpByGrp[1].length; // 0 = liberal

              return groupRatioScale(numLibTweetsInCat / numTweetsInCat);
            })
            .style('fill-opacity', 0.5)
            .style('stroke', cat => {
              const numTweetsInCat = tweetsGrpByFeature[cat].length;
              const tweetsGrpByGrp = _.groupBy(tweetsGrpByFeature[cat], d => d.group);
              const numLibTweetsInCat = tweetsGrpByGrp[1].length; // 0 = liberal

              return d3.rgb(groupRatioScale(numLibTweetsInCat / numTweetsInCat)).darker();
            })
            .style('stroke-width', 2);
        }

        function drawLinesFromCatToCont() {}

        function drawLinesFromCatToCat() {
          const catsInCurrFeature = currFeature.domain,
            catsInNextFeature = nextFeature.domain;

          const catScalesForCurr = calculateScalesForCats(tweets, currFeature);
          const catScalesForNext = calculateScalesForCats(tweets, nextFeature);

          // { catInCurr: 0, catInNext: 0, catIdxInCurr: 0, catIdxInNext: 0, numTweets: 50 }
          let catIdxInCurr = 0;
          let catIdxInNext = 0;
          let tweetsCatToCat = [];
          let dataForCatToCatLines = [];
          let cumNumTweetsRatioInCurr = {},
            cumNumTweetsRatioInNext = {};
          for (const cat of catsInCurrFeature) {
            cumNumTweetsRatioInCurr[cat] = 0;
          }
          for (const cat of catsInNextFeature) {
            cumNumTweetsRatioInNext[cat] = 0;
          }

          catsInCurrFeature.forEach(catCurr => {
            catsInNextFeature.forEach(catNext => {
              const filteredTweets = tweets.filter(d => d[currFeature.key] == catCurr && d[nextFeature.key] == catNext);
              const tweetsInCurr = tweets.filter(d => d[currFeature.key] == catCurr);
              const numFilteredTweets = filteredTweets.length,
                numTweetsInCurr = tweetsInCurr.length,
                numTweetsInNext = tweets.filter(d => d[nextFeature.key] == catNext).length,
                numTweets = tweets.length;
              const libRatioFilteredTweets = filteredTweets.filter(d => d.group === '1').length / numFilteredTweets;

              tweetsCatToCat.push({
                catCurr: catCurr,
                catNext: catNext,
                groupRatio: libRatioFilteredTweets,
                numTweetsRatioInCurr: numFilteredTweets / numTweetsInCurr,
                cumNumTweetsRatioInCurr: cumNumTweetsRatioInCurr[catCurr] / numTweetsInCurr,
                cumNumTweetsRatioInNext: cumNumTweetsRatioInNext[catNext] / numTweetsInNext,
                tweetsInCurr: tweetsInCurr,
                tweetsInCatToCat: filteredTweets
              });

              cumNumTweetsRatioInCurr[catCurr] += numFilteredTweets;
              cumNumTweetsRatioInNext[catNext] += numFilteredTweets;
            });
          });

          dataForCatToCatLines = tweetsCatToCat.map((d, i) => {
            const heightForCurrCat = catScalesForCurr[d.catCurr].range()[1] - catScalesForCurr[d.catCurr].range()[0];
            const lineHeight = heightForCurrCat * d.numTweetsRatioInCurr;
            return {
              catCurr: d.catCurr,
              catNext: d.catNext,
              groupRatio: d.groupRatio,
              numTweetsRatio: d.numTweetsRatio,
              numTweetsRatioInCurr: d.numTweetsRatioInCurr,
              lineHeight: lineHeight,
              heightForCat: heightForCurrCat,
              tweetsInCurr: d.tweetsInCurr,
              tweetsInCatToCat: d.tweetsInCatToCat,
              source: {
                x: 0,
                y: catScalesForCurr[d.catCurr](d.cumNumTweetsRatioInCurr) + lineHeight / 2
              },
              target: {
                x: xFeatureScaleBandwidth - lCom.hPlot.featurePlot.featureRect.w,
                y: catScalesForNext[d.catNext](d.cumNumTweetsRatioInNext) + lineHeight / 2
              }
            };
          });

          gFeatureSelected
            .selectAll('.tweet_cat_line')
            .data(dataForCatToCatLines)
            .enter()
            .append('path')
            .attr('class', d => 'tweet_cat_line tweet_cat_line_' + d.catCurr + '_' + d.catNext)
            .attr('d', drawTweetLine)
            .style('fill', 'none')
            .style('stroke', d => groupRatioScale(d.groupRatio))
            .style('stroke-width', d => d.lineHeight)
            .style('opacity', 0.5)
            .on('mouseover', function(d, i) {
              d3.select(this).style('opacity', 0.8);
              const catToCatLineHtml =
                '<div style="font-weight: 600">' +
                'From: ' +
                d.catCurr +
                '</br>' +
                'To: ' +
                d.catNext +
                '</br>' +
                '# tweets: ' +
                d.numTweetsRatio +
                '</br>' +
                '</div>';

              tooltip.html(catToCatLineHtml);
              tooltip.show();
            })
            .on('mouseout', function(d, i) {
              d3.select(this).style('opacity', 0.5);
              tooltip.hide();
            });
        }

        function drawLinesFromContToCont() {
          const dataForLines = tweets.map(d => ({
            group: d.group,
            tweetId: d.tweetId,
            source: {x: 0, y: currentFeatureScale(d[currFeature.key])},
            target: {
              x: xFeatureScaleBandwidth - lCom.hPlot.featurePlot.featureRect.w,
              y: nextFeatureScale(d[nextFeature.key])
            }
          }));

          gFeatureSelected
            .selectAll('.tweet_line')
            .data(dataForLines)
            .enter()
            .append('path')
            .attr('class', d => 'tweet_line tweet_line_' + d.tweetId)
            .attr('d', drawTweetLine)
            .style('fill', 'none')
            .style('stroke', d => groupColorScale(d.group))
            .style('opacity', 0.2)
            .on('mouseover', function(d, i) {
              d3.select(this).style('opacity', 0.7);
              const catToCatLineHtml =
                '<div style="font-weight: 600">' + 'Tweet ID: ' + d.tweetId + '</br>' + 'Group: ' + d.group + '</div>';

              tooltip.html(catToCatLineHtml);
              tooltip.show();
            })
            .on('mouseout', function(d, i) {
              d3.select(this).style('opacity', 0.2);
              tooltip.hide();
            });
        }

        function calculateScalesForCats(tweets, catFeature) {
          // Get scales for each category
          // - get the height of each category
          // - get the cumulative height for y position
          const catsInFeature = catFeature.domain;
          const tweetsGrpByFeature = _.groupBy(tweets, d => d[catFeature.key]);
          const catScales = {};

          // Define the scales of categorical axis for heights
          const catHeightScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([0, lCom.hPlot.featurePlot.featureRect.h]);

          let cumulativeCatHeight = 0;
          catsInFeature.forEach(cat => {
            const numTweetsInCat = tweetsGrpByFeature[cat],
              numTweetRatioPerCat = numTweetsInCat.length / tweets.length,
              catHeight = catHeightScale(numTweetRatioPerCat),
              catStartY = lCom.hPlot.featurePlot.featureRect.h - cumulativeCatHeight - 1,
              catEndY = lCom.hPlot.featurePlot.featureRect.h - (cumulativeCatHeight + catHeight);
            cumulativeCatHeight += catHeight; // Reflect it for the next loop

            const yWithinCatScale = d3
              .scaleLinear()
              .domain([0, 1])
              .range([catEndY, catStartY]);

            catScales[cat] = yWithinCatScale;
          });

          return catScales;
        }
      }
    });

    //* Axes
    const axesData = gFeaturePlot
      .selectAll('.g_axis')
      .data(features)
      .call(
        axes
          .dataForFeatures(features)
          .dataForPdpValues(pdpValues)
          .dataForPdpValuesForGroups(pdpValuesForGroups)
          .xFeatureScale(xFeatureScale)
          .width(15)
      );
  }

  _level2Plot.dataLoader = function(value) {
    if (!arguments.length) return dataLoader;
    dataLoader = value;
    return _level2Plot;
  };

  _level2Plot.xOutputProbHistScale = function(value) {
    if (!arguments.length) return xOutputProbHistScale;
    xOutputProbHistScale = value;
    return _level2Plot;
  };

  _level2Plot.yOutputProbScale = function(value) {
    if (!arguments.length) return yOutputProbScale;
    yOutputProbScale = value;
    return _level2Plot;
  };

  _level2Plot.yGroupScale = function(value) {
    if (!arguments.length) return yGroupScale;
    yGroupScale = value;
    return _level2Plot;
  };

  _level2Plot.yOutputProbHistScale = function(value) {
    if (!arguments.length) return yOutputProbHistScale;
    yOutputProbHistScale = value;
    return _level2Plot;
  };

  _level2Plot.xFeatureScale = function(value) {
    if (!arguments.length) return xFeatureScale;
    xFeatureScale = value;
    return _level2Plot;
  };

  _level2Plot.groupColorScale = function(value) {
    if (!arguments.length) return groupColorScale;
    groupColorScale = value;
    return _level2Plot;
  };

  _level2Plot.groupRatioScale = function(value) {
    if (!arguments.length) return groupRatioScale;
    groupRatioScale = value;
    return _level2Plot;
  };

  return _level2Plot;
}

export default Level2Plot;
