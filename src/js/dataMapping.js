import * as d3 from 'd3';
import _ from 'lodash';

export const dataMapping = {};

dataMapping.mapLevelToFeatures = function(dataAbbr, features) {
  let levels = [];
  switch(dataAbbr) {
    case 'demoemo':
      return [
        { 
          idx: 0, 
          name: 'demographic',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'binning',  
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
          name: 'social_status',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          // btnMode: {
          //   mode: 'binning',  
          //   numBins: 4,
          //   featureForBinning: ['education']
          // },
          order: 'middle',
          features: [
            _.find(features, ['name', 'education']),
            _.find(features, ['name', 'income']),
            _.find(features, ['name', 'religion']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 2, 
          name: 'hashtags',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'clustering',
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
          idx: 3, 
          name: 'psychological',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'middle',
          features: [
            _.find(features, ['name', 'life_satisfaction']),
            _.find(features, ['name', 'optimism'])
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
        { 
          idx: 4, 
          name: 'hashtags',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'clustering',
            numCls: 4,  
            candidateKs: [4,5,6,7],
            featuresForClustering: []
          },
          order: 'last',
          features: [
            _.find(features, ['name', 'anger']),
            _.find(features, ['name', 'sad']),
            _.find(features, ['name', 'joy']),
            
          ],
          cls: [],
          clScales: [],
          blScale: d3.scalePoint()
        },
      ];
    case 'cancer':
      return [
        { 
          idx: 0, 
          name: 'diagnosis',
          mode: {
            folded: false,
            height: 0
          },
          btnMode: {
            mode: 'clustering',
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
            mode: 'clustering',
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
            mode: 'binning',
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
            mode: 'clustering',
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
            mode: 'clustering',
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
  }
}

dataMapping.convertStrToUnderbar = function(str) {
  // e.g., 'Air Pollution' to 'air_pollution'
  const strLower = str.toLowerCase()
  return strLower.split(' ').join('_')
}