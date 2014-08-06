module.exports = function generateColorPalette (drawTool, $strokeBtn, $strokeColorBtns, $fillBtn, $fillColorBtns) {
  var $el = $('<div class="dt-colorPalette">');
    // .css('margin-top', '15px');

  // $('<div class="dt-btn-innerColor">').appendTo($strokeBtn);
  $('<div class="dt-btn-innerColor">').appendTo($fillBtn);

  $strokeBtn.appendTo($el);
  var $strokePalette = $('<div class="dt-toolpalette">').appendTo($el);
  $fillBtn.appendTo($el);
  var $fillPalette = $('<div class="dt-toolpalette">').appendTo($el);

  var i = 0;
  for(i = 0; i < $strokeColorBtns.length; i++) {
    $strokeColorBtns[i].appendTo($strokePalette);
  }
  for(i = 0; i < $fillColorBtns.length; i++) {
    $fillColorBtns[i].appendTo($fillPalette);
  }

  $strokePalette.css('display', 'block')
    .hide();
  $fillPalette.css('display', 'block')
    .hide();

  $strokeBtn.on('click touchstart', function () {
    // $strokeBtn.hide(100);
    $fillPalette.hide(100);
    $strokePalette.toggle(100);
    // $fillBtn.show(100);
  });
  $fillBtn.on('click touchstart', function () {
    // $fillBtn.hide(100);
    $strokePalette.hide(100);
    $fillPalette.toggle(100);
    // $strokeBtn.show(100);
  });

  var syncUI = function(e) {
    var i = 0;
    for (i = 0; i < $strokeColorBtns.length; i++) {
      if (drawTool.state.color === drawTool.tools[$strokeColorBtns[i].data('dt-target-id')].color) {
        $strokeColorBtns[i].addClass('selected');
      } else { $strokeColorBtns[i].removeClass('selected'); }
    }
    for (i = 0; i < $fillColorBtns.length; i++) {
      if (drawTool.state.fill === drawTool.tools[$fillColorBtns[i].data('dt-target-id')].color) {
        $fillColorBtns[i].addClass('selected');
      } else { $fillColorBtns[i].removeClass('selected'); }
    }
    // console.log(drawTool.state.color);
    $strokeBtn.css('color', drawTool.state.color);
    $fillBtn.find('.dt-btn-innerColor').css('background-color', drawTool.state.fill);
  }

  syncUI();

  drawTool.addStateListener(function (e) { syncUI(e); });

  return $el;
}
