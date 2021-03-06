import * as d3 from 'd3';
import _ from 'lodash';

// Controller
export const controller = function(LVData, features) {
  $(document).ready(function(){
    // Adding divs based on the level data
    const lvDivs = d3.select('.level_list')
      .selectAll('.lv')
      .data(LVData).enter()
      .append('li')
      .attr('class', 'lv route');
      
    const selectedFeatures = _.flatten(LVData.map(d => d.features));
    const notSelectedFeatures = features.filter(b => selectedFeatures.every(a => a.name !== b.name));

    const featureDivs = d3.select('.feature_list')
      .selectAll('.feature')
      .data(notSelectedFeatures).enter()
      .append('li')
      .attr('class', 'feature route')
      .html((feature, i) => addNewFeatureDivUnderLi(feature));

    lvDivs
      .html((lvData, i) => {
        let aggr_mode = '';
        if (lvData.idx == 0)
          aggr_mode = 'B';
        else
          aggr_mode = 'C';
        return addNewLVDivUnderLi(lvData.idx+1, aggr_mode)
      })

    lvDivs
      .each(function(lvData) {
        const lvDiv = d3.select(this);

        lvDiv.select('.space') // inner ul
          .selectAll('.feature')
          .data(lvData.features).enter()
          .append('li')
          .attr('class', 'feature route')
          .html((feature, i) => addNewFeatureDivUnderLi(feature));
      })

    // Adding buttons to feature divs
    // d3.selectAll('.feature')
    //   .append('div')
    //   .attr('class', 'buttons')
    //   .html('<div class="coloring_button"></div>')
    //   .on('click', function(d){

    //   });
  
    calcWidth($('#title0'));
    
    //recursively calculate the Width all titles
    function calcWidth(obj){
      
      var titles = $(obj).siblings('.space').children('.route').children('.title');
      
      $(titles).each(function(index, element){
        var pTitleWidth = parseInt($(obj).css('width'));
        var leftOffset = parseInt($(obj).siblings('.space').css('margin-left'));
        
        var newWidth = pTitleWidth - leftOffset;
        
        if ($(obj).attr('id') == 'title0'){
          newWidth = newWidth - 10;
      }
      
      $(element).css({
        'width': newWidth,
      })
      
      calcWidth(element);
      });
    
      sorting();
    }

    // Add the feature list
    // features.forEach(function(feature){
    //   $('.feature_list')
    //     .append(addNewFeatureDiv(feature))
    // });


    // Event on interface
    d3.select('.add_button')
      .on('click', function(d, i) {
        const numLVs = $('.level_list').children('.lv').length + 1;
        
        $('#controller')
          .children('.level_list')
          .append(addNewLVDiv(numLVs))
          .addClass('selected' + numLVs);

        // Provoke the click function to newly added LV div
        d3.selectAll('.aggr_button')
          .on('click', clickAggrButton);
        
        calcWidth($('#title0'));
        sorting();
      });

    d3.selectAll('.aggr_button')
      .on('click', clickAggrButton);

    // $('.clustering_button')
    // .on('mouseover', function(d, i) {
    //   console.log('mouseoverred')
    //   $(this).parent().parent()
    //     .append('div')
      
    //   // $('#controller')
    //   //   .children('.level_list')
    //   //   .append(addNewLVDiv(numLVs))
    //   //   .addClass('selected' + numLVs);

    //   // calcWidth($('#title0'));
    //   // sorting();
    // });

    $('.coloring_button')
      .on('click', function(d, i) {
      });
    //   return  `<li class="lv route">
    //   <div class="title" id="title` + cumlativeNumLVs + `">` +
    //     `<div class="lv_info_wrapper">` +
    //       `<div>` + 'Level ' + cumlativeNumLVs + `</div>` +
    //     `</div>
    //       <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
    //       <ul class="space ui-sortable" id="space` + cumlativeNumLVs + `"></ul>` +

    //     `<div class="aggr_button_wrapper">` +
    //       `<div class="clustering_button aggr_button">` + "C" + `</div>` +
    //       `<div class="binning_button aggr_button">` + "B" + `</div>` +
    //     `</div>` +
    //   `</div>` +
    // `</li>`;

    function clickAggrButton(d, i) {
      const _thisButton = d3.select(this);
        const _buttonWrapper = d3.select(this.parentNode);
        // $(this).parent().parent()
        //   .append('div');

        _buttonWrapper.selectAll('.aggr_button').classed('aggr_selected', false);

        if (_thisButton.classed('aggr_selected')) {
          _thisButton
            .classed('aggr_selected', false);
        } else {
          _thisButton
            .classed('aggr_selected', true);
        }
    }

    function addNewLVDiv(cumlativeNumLVs) {
      return  `<li class="lv route">
          <div class="title" id="title` + cumlativeNumLVs + `">` +    
            `<div class="lv_info_wrapper">` +
              `<div class="lv_title">` + 'Level ' + cumlativeNumLVs + `</div>` +
            `</div>` +
            `<div class="lv_aggr_button_wrapper">` +
              `<div class="clustering lv_clustering_button aggr_button aggr_selected">` + "C" + `</div>` +
              `<div class="binning lv_binning_button aggr_button">` + "B" + `</div>` +
            `</div>` +
          `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space` + cumlativeNumLVs + `"></ul>
        </li>`;
    }

    function addNewFeatureDiv(feature) {
      return  `<li class="route">
          <div class="title" id="title` + feature.idx + `">` +
        feature.name +
        `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space"></ul>
        </li>`;
    }

    function addNewLVDivUnderLi(cumlativeNumLVs, aggr_mode) {
      let aggr_mode_div = '';
      if (aggr_mode == 'B')
        aggr_mode_div = `<div class="lv_aggr_button_wrapper">` +
              `<div class="clustering lv_clustering_button aggr_button">` + "C" + `</div>` +
              `<div class="binning lv_binning_button aggr_button aggr_selected">` + "B" + `</div>` +
            `</div>`;
      else
        aggr_mode_div = `<div class="lv_aggr_button_wrapper">` +
                `<div class="clustering lv_clustering_button aggr_button aggr_selected">` + "C" + `</div>` +
                `<div class="binning lv_binning_button aggr_button">` + "B" + `</div>` +
              `</div>`;

      return  `<div class="title" id="title` + cumlativeNumLVs + `">` +
              `<div class="lv_info_wrapper">` +
              `<div class="lv_title">` + 'Level ' + cumlativeNumLVs + `</div>` +
            `</div>` +
            aggr_mode_div +
          `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space` + cumlativeNumLVs + `"></ul>`;
    }

    function addNewFeatureDivUnderLi(feature) {
      return  `<div class="title" id="title ` + feature.id + `">` +
        `<div class="feature_info_wrapper">` +
          `<div>` + feature.name + `</div>` +
        `</div>` +
        `<div class="feature_aggr_button_wrapper">` +
          `<div class="feature_type">` + (feature.type == 'categorical' ? 'cat' : 'cont') + `</div>` +
          `<div class="clustering feature_clustering_button aggr_button">` + "C" + `</div>` +
          `<div class="binning feature_binning_button aggr_button aggr_selected">` + "B" + `</div>` +
        `</div>` +
        `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space` + feature.idx + `"></ul>`;
    }
    
    function sorting() {
      $('.space').sortable({
        connectWith:'.space',
        // handle:'.title',
        // placeholder: ....,
        tolerance:'intersect',
        over: function(event,ui){
        },
        receive: function(event, ui){
          calcWidth($(this).siblings('.title'));
        },
      });
      
      $('.space').disableSelection();
    }
    });
}
