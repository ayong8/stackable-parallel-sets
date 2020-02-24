import * as d3 from 'd3';
import { globalScales, scales, groupRatioScale } from './scale';
import { l, ll, lCom } from './style';

d3.selectAll('.cat_rect')
  .on('click', function(d) {
    console.log('dddd: ', d);
  });