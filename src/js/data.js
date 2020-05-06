import * as d3 from 'd3';
import _ from 'lodash';

export const data = {};

data.mapLevelToFeatures = function(dataAbbr, features, rawDataForBp) {
  let levels = [];
  let LVData = [];
  switch(dataAbbr) {
    case 'demoemo':
      LVData = [
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
            _.find(features, ['name', 'gender']),
            _.find(features, ['name', 'race'])
            
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
            _.find(features, ['name', 'relationship']),
            _.find(features, ['name', 'children']),
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
            _.find(features, ['name', 'religion']),
            _.find(features, ['name', 'political']),
            _.find(features, ['name', 'life_satisfaction']),
            _.find(features, ['name', 'optimism'])
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
            _.find(features, ['name', 'emotion'])
            
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
            _.find(features, ['name', 'sentiment'])
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
      ];
      break;
    case 'cancer':
      LVData = [
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
            _.find(features, ['name', 'Level'])
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
            _.find(features, ['name', 'Passive Smoker']),
            _.find(features, ['name', 'Air Pollution']),
            _.find(features, ['name', 'Occupational Hazards']),
            
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
            _.find(features, ['name', 'Gender']),
            _.find(features, ['name', 'Smoking Binary']),
            
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
            _.find(features, ['name', 'Shortness of Breath']),
            _.find(features, ['name', 'Fatigue']),
            _.find(features, ['name', 'Weight Loss'])
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
            _.find(features, ['name', 'Swallowing Difficulty']),
            _.find(features, ['name', 'Coughing of Blood']),
            _.find(features, ['name', 'Dry Cough']),
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

  return LVData;
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