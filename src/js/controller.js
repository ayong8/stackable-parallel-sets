// Controller
export const controller = function(LVData) {
  $(document).ready(function(){
  
    $('.level_list').children('.lv')
  
    $('.add_button')
      .on('click', function(d, i) {
        const numLVs = $('.level_list').children('.lv').length + 1;
        console.log('numLVs: ', numLVs)
        var newdiv1 = $( 
          `<li class="route">
            <h3 class="title" id="title` + numLVs + `">` +
          'Level ' + numLVs +
          `</h3>
            <span class="ui-icon ui-icon-arrow-4-diag"></span>
            <ul class="space ui-sortable" id="space` + numLVs + `"></ul>
          </li>`);
  
        $('#controller')
          .children('.level_list')
          .append(newdiv1)
          .addClass('selected' + numLVs);
  
        calcWidth($('#title0'));
        sorting();
      })
  
    calcWidth($('#title0'));
    
    window.onresize = function(event) {
      console.log("window resized");
  
      //method to execute one time after a timer
  
    };
    
    //recursively calculate the Width all titles
    function calcWidth(obj){
      console.log('---- calcWidth -----');
      
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
