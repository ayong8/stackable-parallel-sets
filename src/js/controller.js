import * as d3 from 'd3';

// Controller
export const controller = function(LVData) {
  $(document).ready(function(){
    // Adding divs based on the level data
    const lvDivs = d3.select('.level_list')
      .selectAll('.lv')
      .data(LVData).enter()
      .append('li')
      .attr('class', 'lv route')
    lvDivs
      .html((lvData, i) => addNewLVDivUnderLi(lvData.idx+1));

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
    d3.selectAll('.feature')
      .append('div')
      .attr('class', 'buttons')
      .html('<div class="coloring_button">c</div>')
      .on('click', function(d){

      });
  
    calcWidth($('#title0'));
    
    window.onresize = function(event) {
      console.log("window resized");
  
      //method to execute one time after a timer
  
    };
    
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

    // Event on interface
    $('.add_button')
      .on('click', function(d, i) {
        const numLVs = $('.level_list').children('.lv').length + 1;
        console.log('numLVs: ', numLVs)
        
        $('#controller')
          .children('.level_list')
          .append(addNewLVDiv(numLVs))
          .addClass('selected' + numLVs);
  
        calcWidth($('#title0'));
        sorting();
      });

    $('.coloring_button')
      .on('click', function(d, i) {
        console.log('LVData on click coloring: ', LVData);
      })

    function addNewLVDiv(cumlativeNumLVs) {
      return  `<li class="route">
          <div class="title" id="title` + cumlativeNumLVs + `">` +
        'Level ' + cumlativeNumLVs +
        `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space` + cumlativeNumLVs + `"></ul>
        </li>`;
    }

    function addNewLVDivUnderLi(cumlativeNumLVs) {
      return  `<div class="title" id="title` + cumlativeNumLVs + `">` +
        'Level ' + cumlativeNumLVs +
        `</div>
          <span class="ui-icon ui-icon-grip-solid-horizontal"></span>
          <ul class="space ui-sortable" id="space` + cumlativeNumLVs + `"></ul>`;
    }

    function addNewFeatureDivUnderLi(feature) {
      return  `<div class="title" id="title` + feature.idx + `">` +
        feature.name +
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
          console.log('dddd')
          console.log($(this).siblings('.title'))
          calcWidth($(this).siblings('.title'));
        },
      });
      
      $('.space').disableSelection();
    }
    
    
    });
}
