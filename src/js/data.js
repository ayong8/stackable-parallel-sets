import * as d3 from 'd3';
import _ from 'lodash';

export const data = {};

data.mapLevelToFeatures = function(dataAbbr, featuresData, rawDataForBp) {
  let levels = [];
  let LVData = [];

  const lvs = d3.selectAll('.lv');
  const numLvs = lvs.nodes().length;

  lvs.each(function(d, i) {
    const lv = d3.select(this);
    const lvTitle = lv.select('.lv_title').text();
    const aggrMode = lv  // Identify the activated aggregation button by selecting the class 'aggr_selected'
          .select('.lv_aggr_button_wrapper')
          .select('.aggr_selected')
          .attr('class').split(' ')[0]; // 'clustering' or 'binning'
    const features = lv.selectAll('.feature');
    const featuresDataForLv = [];
    
    features.each(function(d, i) {
      const feature = d3.select(this);
      const featureName = feature.select('.feature_info_wrapper').text();
      console.log('featureName: ', featureName);

      featuresDataForLv.push(_.find(featuresData, ['name', featureName]));
    });
    let lvOrder = '';
    if (i == 0) {
      lvOrder = 'first';
    } else if (i == numLvs-1) {
      lvOrder = 'last';
    } else {
      lvOrder = 'middle';
    }

    LVData.push({ 
      idx: i, 
      name: lvTitle,
      mode: {
        folded: false,
        height: 0
      },
      btnMode: {
        bipartiteMode: 0,
        totalFreqCnt: 0,
        bipartiteMat: [],
        aggrMode: aggrMode,  
        numBins: 4,
        featureForBinning: featuresDataForLv,
        featureForClustering: featuresDataForLv
      },
      order: lvOrder,
      features: featuresDataForLv,
      cls: [],
      clScales: [],
      blScale: d3.scalePoint()
    });
  });

  console.log('LVData: ', LVData);
  let LVDataBefore = [];
  switch(dataAbbr) {
    case 'demoemo':
      LVDataBefore = [
        { 
          idx: 0, 
          name: 'demographic',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'binning',  
            numBins: 4,
            featureForBinning: ['gender', 'race']
          },
          order: 'first',
          features: [
            _.find(featuresData, ['name', 'gender']),
            _.find(featuresData, ['name', 'race'])
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 1, 
          name: 'family_background',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          // btnMode: {
          //   aggrMode: 'binning',  
          //   numBins: 4,
          //   featureForBinning: ['education']
          // },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'relationship']),
            _.find(featuresData, ['name', 'children']),
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 2, 
          name: 'psychological',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'religion']),
            _.find(featuresData, ['name', 'political']),
            _.find(featuresData, ['name', 'optimism'])
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 3, 
          name: 'emotion',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'emotion'])
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 4, 
          name: 'sentiment',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'sentiment'])
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
      ];
      break;
    case 'cancer':
      LVDataBefore = [
        { 
          idx: 0, 
          name: 'diagnosis',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'first',
          features: [
            _.find(featuresData, ['name', 'Level'])
          ],
          cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 1, 
          name: 'environmental',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0, // sum of total frequency in users x hashtags matrix
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Passive Smoker']),
            _.find(featuresData, ['name', 'Air Pollution']),
            _.find(featuresData, ['name', 'Occupational Hazards']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 2, 
          name: 'demographic',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'binning',
            numBins: 4,
            featureForBinning: ['Gender', 'Smoking Binary']
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Gender']),
            _.find(featuresData, ['name', 'Smoking Binary']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 3, 
          name: 'symptom',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Shortness of Breath']),
            _.find(featuresData, ['name', 'Fatigue']),
            _.find(featuresData, ['name', 'Weight Loss'])
          ],
          cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 4, 
          name: 'symptom2',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'last',
          features: [
            _.find(featuresData, ['name', 'Swallowing Difficulty']),
            _.find(featuresData, ['name', 'Coughing of Blood']),
            _.find(featuresData, ['name', 'Dry Cough']),
          ],
          cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
          clScales: [],
          blScale: d3.scalePoint()
        }
      ];
      break;
    case 'como':
      LVDataBefore = [
        // { 
        //   idx: 0, 
        //   name: 'demographic',
        //   mode: {
        //     folded: false,
        //     height: 0
        //   },
        //   btnMode: {
        //     bipartiteMode: 0,
        //     totalFreqCnt: 0,
        //     bipartiteMat: [],
        //     aggrMode: 'clustering',
        //     numCls: 6,
        //     candidateKs: [4,5,6,7],
        //     featuresForClustering: []
        //   },
        //   order: 'first',
        //   features: [
        //     _.find(features, ['name', 'Level'])
        //   ],
        //   cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
        //   clScales: [],
        //   blScale: d3.scalePoint()
        // },
        { 
          idx: 0, 
          name: 'demographic',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0, // sum of total frequency in users x hashtags matrix
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'first',
          features: [
            _.find(featuresData, ['name', 'RUCC_2013']),
            _.find(featuresData, ['name', 'MaritalStatusatDXcode']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 1, 
          name: 'respiratory',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0, // sum of total frequency in users x hashtags matrix
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Respiratory system']),
            _.find(featuresData, ['name', 'Circulatory system']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 2, 
          name: 'gastrointestinal',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Digestive system']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 3, 
          name: 'pain',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(featuresData, ['name', 'Nervous system']),
            _.find(featuresData, ['name', 'Skin and subcutaeous']),
            _.find(featuresData, ['name', 'Musculoskeletal system and connective tissue'])
          ],
          cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 4, 
          name: 'diagnosis',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            bipartiteMode: 0,
            totalFreqCnt: 0,
            bipartiteMat: [],
            aggrMode: 'clustering',
            numCls: 6,
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'last',
          features: [
            _.find(featuresData, ['name', 'STAGE']),
            _.find(featuresData, ['name', 'CYTO']),
            _.find(featuresData, ['name', 'GRADE'])
          ],
          cls: [], // [ { idx: 0, sortedIdx: 0, instances: [ { idx: 0, Air Pollution: 1, ... } ], subcls: {} }, ... ]
          clScales: [],
          blScale: d3.scalePoint()
        }
      ];
      break;
  }

  if (Object.entries(rawDataForBp).length != 0)
    LVData.push({ 
        idx: 5, 
        name: 'words',
        mode: {
          folded: false,
          height: 0
        },
        btnMode: {
          bipartiteMode: 1,
          totalFreqCnt: 0,
          bipartiteMat: [],
          aggrMode: 'clustering',
          numCls: 4,  
            candidateKs: [4,5,6,7],
          featuresForClustering: []
        },
        order: 'last',
        features: [
        ],
        cls: [],
        clScales: [],
        blScale: d3.scalePoint()
      })

  console.log('LVData: ', LVData);
  return LVDataBefore;
}

data.convertStrToUnderbar = function(str) {
  // e.g., 'Air Pollution' to 'air_pollution'
  const strLower = str.toLowerCase()
  return strLower.split(' ').join('_')
}

data.calculateClToClFreqForBipartite = function(instances) {
  let sumFreq = 0;
  // Sum all frequencies except for idx
  instances.forEach(instance => {
    sumFreq += _.sum(_.values(_.omit(instance, 'idx')));
  });

  return sumFreq;
}