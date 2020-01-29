
import * as d3 from 'd3';
import { globalScales, scales, groupRatioScale } from './scale';
import { l, ll, lCom } from './style';

export function renderClBars(selection, lv) {
    const lvW = (lv == 1) ? lCom.hPlot.goalPlot.w
            : (lv == 2) ? lCom.hPlot.featurePlot.w
            : (lv == 3) ? lCom.hPlot.wordPlot.w
            : 200;
    const lvH = (lv == 1) ? lCom.hPlot.goalPlot.h
            : (lv == 2) ? lCom.hPlot.featurePlot.h
            : (lv == 3) ? lCom.hPlot.wordPlot.h
            : 200;
    
    const diagonalPattern = d3.select('.svg')
      .append('defs')
      .append('pattern')
      .attr('id', 'diagonalHatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 4)
      .attr('height', 4)
      .append('path')
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('stroke', 'lightgray')
      .attr('stroke-width', 0.5);

    // Level rect
    selection
      .append('rect')
      .attr('class', 'level_rect')
      .attr('x', 0)
      .attr('y', lCom.hPlot.cl.btn.rect.h + lCom.hPlot.cl.btn.m)
      .attr('width', lvW)
      .attr('height', lvH - (lCom.hPlot.cl.btn.m))
      .attr('fill', 'url(#diagonalHatch)');

    selection
      .append('text')
      .attr('x', 10)
      .attr('y', 30)
      .text('lv' + lv)
      .style('font-style', 'italic');

    // Render level bars
    selection
      .append('line')
      .attr('class', 'level_bar_top')
      .attr('x1', 0)
      .attr('y1', lCom.hPlot.cl.btn.m)
      .attr('x2', lvW)
      .attr('y2', lCom.hPlot.cl.btn.m)
      .style('stroke', 'gray')
      .style('stroke-width', 5);

    selection
      .append('line')
      .attr('class', 'level_bar_bottom')
      .attr('x1', 0)
      .attr('y1', lvH + lCom.hPlot.cl.btn.m)
      .attr('x2', lvW)
      .attr('y2', lvH + lCom.hPlot.cl.btn.m)
      .style('stroke', 'gray')
      .style('stroke-width', 5);
}

export function renderClRectsBtnLv(dataCls, selection, rectPos, lvW, lvH) {
  const rectScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, lvW]);

  const translate = (rectPos == 'top')
    ? '(0,' + -lCom.hPlot.cl.btn.rect.h + ')'
    : '(0,' + (lvH + lCom.hPlot.cl.btn.rect.h + lCom.hPlot.cl.btn.m) + ')'
    
  const gClLayer = selection
    .append('g')
    .attr('class', 'g_cl_rect')
    .attr('transform', 'translate' + translate);

  gClLayer
    .selectAll('.cl_rect')
    .data(dataCls)
    .enter()
    .append('rect')
    .attr('class', 'cl_rect')
    .attr('x', (d, i) => {
      console.log(d, i);
      let cumulativeXWidth = 0; // x coordinate is the cumulative width of previous rects

      if (i === 0) return 0;
      else {
        for (let j = i; j >= 1; j--) {
          cumulativeXWidth += rectScale(dataCls[j - 1].countRatio);
        }
        console.log('cumulativeXWidth: ', cumulativeXWidth)
        return cumulativeXWidth;
      }
    })
    .attr('y', 0)
    .attr('width', (d, i) => (i !== dataCls.length-1) ? rectScale(d.countRatio) - l.sm : rectScale(d.countRatio))
    .attr('height', 10)
    .attr('fill', d => globalScales.groupRatioScale(d.groupRatio))
    .style('opacity', 0.8)
    .style('rx', 3)
}

function calculateScalesForCls(cls) {
  // Get scales for each category
  // - get the height of each category
  // - get the cumulative height for y position
  const clScales = {};
  // Define the scales of categorical axis for heights
  const clWidthScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, ll.l1ToL2.w]);

  let cumulativeClWidth = 0;
  cls.forEach(cl => {
      const clWidth = clWidthScale(cl.countRatio),
      clStartX = cumulativeClWidth - 1,
      clEndX = cumulativeClWidth + clWidth - l.sm;
    cumulativeClWidth += clWidth; // Reflect it for the next loop

    const xWithinClScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([clStartX, clEndX]);

    clScales[cl.cl] = xWithinClScale;
  });

  return clScales;
}

export function drawLinesFromClsToCls(selection, cls1, cls2, dataCl1ToCl2) { // cls1 == from upper level, cls2 == from lower level
  const clScales1 = calculateScalesForCls(cls1);
  const clScales2 = calculateScalesForCls(cls2);

  const drawTweetLine = d3
    .linkVertical()
    .x(d => d.x)
    .y(d => d.y);

  // { catInCurr: 0, catInNext: 0, catIdxInCurr: 0, catIdxInNext: 0, numTweets: 50 }
  let clIdx1 = cls1.map(d => d.cl);
  let clIdx2 = cls2.map(d => d.cl);

  let itemsClToCl = [];
  let dataForClToClLines = [];
  let cumNumItemsRatioInCl1 = {},
    cumNumItemsRatioInCl2 = {};
  for (const cl1 of clIdx1) {
    cumNumItemsRatioInCl1[cl1] = 0;
  }
  for (const cl2 of clIdx2) {
    cumNumItemsRatioInCl2[cl2] = 0;
  }

  clIdx1.forEach(cl1 => {
    clIdx2.forEach(cl2 => {
      const filteredItems = dataCl1ToCl2.filter(d => d.cl1 == cl1 && d.cl2 == cl2);
      const itemsInCl1 = dataCl1ToCl2.filter(d => d.cl1 == cl1);
      const numFilteredItems = filteredItems.length,
        numItemsInCl1 = itemsInCl1.length,
        numItemsInCl2 = dataCl1ToCl2.filter(d => d.cl2 == cl2).length,
        numItems = dataCl1ToCl2.length;
      //const libRatioFilteredTweets = filteredItems.filter(d => d.group === '1').length / numFilteredTweets;

      itemsClToCl.push({
        cl1: cl1,
        cl2: cl2,
        groupRatio: 0.2,
        numItemsRatioInCl1: numFilteredItems / numItemsInCl1,
        cumNumItemsRatioInCl1: cumNumItemsRatioInCl1[cl1] / numItemsInCl1,
        cumNumItemsRatioInCl2: cumNumItemsRatioInCl2[cl2] / numItemsInCl2,
        itemsInCl1: itemsInCl1,
        itemsInClToCl: filteredItems
      });

      cumNumItemsRatioInCl1[cl1] += numFilteredItems;
      cumNumItemsRatioInCl2[cl2] += numFilteredItems;
    });
  });

  dataForClToClLines = itemsClToCl.map((d, i) => {
    const heightForCl1 = clScales1[d.cl1].range()[1] - clScales1[d.cl1].range()[0];
    const lineHeight = heightForCl1 * d.numItemsRatioInCl1;
    return {
      cl1: d.cl1,
      cl2: d.cl2,
      groupRatio: d.groupRatio,
      numItemsRatio: d.numItemsRatio,
      numItemsRatioInCl1: d.numItemsRatioInCl1,
      lineHeight: lineHeight,
      heightForCl: heightForCl1,
      itemsInCl1: d.itemsInCl1,
      itemsInClToCl: d.itemsInClToCl,
      source: {
        x: clScales1[d.cl1](d.cumNumItemsRatioInCl1) + lineHeight / 2,
        y: 0
      },
      target: {
        x: clScales2[d.cl2](d.cumNumItemsRatioInCl2) + lineHeight / 2,
        y: ll.l1ToL2.h
      }
    };
  });

  selection
    .selectAll('.tweet_cat_line')
    .data(dataForClToClLines)
    .enter()
    .append('path')
    .attr('class', d => 'tweet_cat_line tweet_cat_line_' + d.cl1 + '_' + d.cl2)
    .attr('d', drawTweetLine)
    .style('fill', 'none')
    .style('stroke', d => 'gray')
    .style('stroke-width', d => d.lineHeight)
    .style('opacity', 0.5)
    .on('mouseover', function(d, i) {
      d3.select(this).style('opacity', 0.8);
      const clToClLineHtml =
        '<div style="font-weight: 600">' +
        'From: ' +
        d.cl1 +
        '</br>' +
        'To: ' +
        d.cl2 +
        '</br>' +
        '# tweets: ' +
        d.numItemsRatio +
        '</br>' +
        '</div>';

      tooltip.html(clToClLineHtml);
      tooltip.show();
    })
    .on('mouseout', function(d, i) {
      d3.select(this).style('opacity', 0.5);
      tooltip.hide();
    });
}

export function renderControlRect(selection, rectPos, lv, selectedFeature) {
  const lvW = (lv == 1) ? lCom.hPlot.goalPlot.w
          : (lv == 2) ? lCom.hPlot.featurePlot.w
          : (lv == 3) ? lCom.hPlot.wordPlot.w
          : 200;
  const lvH = (lv == 1) ? lCom.hPlot.goalPlot.h
          : (lv == 2) ? lCom.hPlot.featurePlot.h
          : (lv == 3) ? lCom.hPlot.wordPlot.h
          : 200;
  
  const translate = (rectPos == 'top')
    ? '(' + (lvW + 5) + ','+ -lCom.hPlot.cl.btn.rect.h + ')'
    : '(' + (lvW + 5) + ',' + (lvH + lCom.hPlot.cl.btn.rect.h + lCom.hPlot.cl.btn.m) + ')';
    
  const gClLayer = selection
    .append('g')
    .attr('class', 'g_control_rect')
    .attr('transform', 'translate' + translate);

  gClLayer
    .append('rect')
    .attr('class', 'control_rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'black')
    .style('opacity', 0.8)
    .style('rx', 3);

  gClLayer
    .append('text')
    .attr('x', 15)
    .attr('y', 10)
    .text(selectedFeature)
    .style('fill', 'gray')
    .style('font-size', '0.9rem')
    .style('font-weight', 600)
    .style('font-style', 'italic');
}