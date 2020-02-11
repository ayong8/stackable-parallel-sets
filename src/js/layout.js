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
  userFeature: 'LIGHTSEAGREEN'
};

export const l = {
  w: 1100,
  h: 500,
  sm: 10,
  mm: 10,
  lm: 15,
  textHeight: 10,
  textHeight2: 15
};

export const llv = {
  w: l.w * 0.5,
  h: 100,
  maxH: 200,
  maxNumFeatures: 10,
  minFeatureAreaRatio: 0.7,
  maxFeatureAreaRatio: 0.9,
  m: {
    t: 5,
    b: 5,
    l: 10,
    r: 10
  }
}

export const lBtn = {
  h: llv.h * 0.8
}

export const lbl = {
  s: llv.w * 0.1,
  maxS: llv.h * 0.3,
  t: (llv.h - llv.h * 0.1) / 2,
  m: {
    btn: 10
  },
}

export const lbr = {
  h: 20
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
  console.log('this in llv: ', this);
  this.m.l = this.w - (LVWForFeatures * 2);
  this.m.r = this.w - (LVWForFeatures * 2);
}

lbl.setS = function(LVWForFeatures, numFeatures) {
  console.log(this);
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

  const y = llv.m.t + (height * idx) + (btnMargin * idx)

  return y;
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
gLayout.renderAuxAxisForCats = function(tweets, catFeature, catScales, direction) {  // auxilary axis on the left? or right?
  const tweetsGrpByFeature = _.groupBy(tweets, d => d[catFeature.key]);
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

gLayout.calculateScalesForCats = function(rawData, feature, wholeWidth) { //feature
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
    const numInstancesInCat = instancesGrpByFeature[cat],
      numTweetRatioPerCat = numInstancesInCat.length / rawData.length,
      catHeight = catWidthScale(numTweetRatioPerCat),
      catStartY = wholeWidth - cumulativeCatHeight,
      catEndY = wholeWidth - (cumulativeCatHeight + catHeight);
    cumulativeCatHeight += catHeight; // Reflect it for the next loop

    const yWithinCatScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([catEndY, catStartY]);

    catScales[cat] = yWithinCatScale;
  });

  return catScales;
}

export const ll = {
  l1: {
    t: 5,
    h: l.h * 0.1,
    l: 5,
    w: l.w * 0.5
  },
  l1ToL2: {
    t: l.h * 0.165,
    h: l.h * 0.17,
    w: l.w * 0.5
  },
  l2: {
    t: l.h * 0.35,
    h: l.h * 0.2,
    w: l.w * 0.5
  },
  l2ToL3: {
    t: l.h * 0.605,
    h: l.h * 0.1
  },
  l3: {
    t: l.h * 0.79,
    h: l.h * 0.175,
    w: l.w * 0.5
  }
};

export const lCom = {
  hIndicator: {
    // div
    t: 0,
    l: 5,
    w: 70,
    h: l.h * 0.9,
    textHeight: 10
  },
  hPlot: {
    // in the context of svg
    t: 0,
    l: 25,
    w: l.w * 0.45,
    h: l.h * 0.9,
    cl: {
      btn: {
        m: 10,
        rect: {
          h: 5
        }
      },
      wtn: {
        m: 10,
        rect: {
          w: 10
        }
      }
    },
    goalPlot: {
      w: l.w * 0.5,
      t: ll.l1.t,
      h: ll.l1.h,
      m: 20,
      featureRect: {
        t: ll.l1.t + 10,
        h: 5
      },
      goalTitle: {
        t: ll.l1.t,
        textHeight: 8
      }
    },
    featurePlotTitles: {
      t: ll.l2.t - 30,
      h: ll.l2.h
    },
    featurePlot: {
      w: l.w * 0.5,
      t: ll.l2.t,
      h: ll.l2.h,
      titles: {
        t: ll.l2.t - 15,
        h: ll.l2.h - 15,
        m: 15
      },
      featureRect: {
        w: 55,
        h: 55,
        m: 3,
        cat: {
          // Additional axis for categories
          m: 5
        }
      },
      pdp: {
        w: 20
      }
    },
    wordPlot: {
      w: l.w * 0.5,
      t: ll.l3.t,
      h: ll.l3.h,
      word: {
        w: 20,
        maxH: 10
      },
      featureRect: {
        w: 30,
        h: 50,
        maxH: 10,
        m: 10,
        cat: {
          // Additional axis for categories
          m: 20
        }
      }
    }
  },
  fromFtoO: {
    l: l.w * 0.48,
    w: l.w * 0.05
  },
  outputProbPlot: {
    t: ll.l2.t,
    h: ll.l2.h,
    l: l.w * 0.54,
    w: 80
  },
  clusterPlot: {
    t: l.h * 0.15,
    //h: ll.l1.h + ll.l2.h,
    h: ll.l2.h,
    l: l.w * 0.625,
    w: l.w * 0.325,
    m: 10,
    minR: 4,
    maxR: 15
  },
  pdpPlot: {
    t: ll.l2.t,
    h: ll.l2.h,
    l: l.w * 0.75,
    w: l.w * 0.1
  }
};
