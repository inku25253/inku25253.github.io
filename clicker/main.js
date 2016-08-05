__currentui = undefined;
var monster_head_div = $("<div></div>").addClass("game_monster_head");
var monster_neck_div = $("<div></div>").addClass("game_monster_neck");
var monster_body_div = $("<div></div>").addClass("game_monster_body");
var click_count = 0;

function loadSave() {

  return false;
}
function openfile_dialog(cb) {
  $("#dialog").change(function () {
    if (!this.files.length) {
      return;
    }

    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = cb;
    reader.readAsDataURL(file);
  }).click();
}
function new_btn(text) {
  return $("<button></button>").addClass("btn").text(text);
}


function new_window(title) {

  var out = $("<div></div>").addClass("ui_window_outer");
  var wnd = $("<div></div>").addClass("ui_window");

  out.append(wnd);

  var title = $("<h2></h2>").text(title);
  wnd.append(title);

  wnd.show = function () {
    if (undefined != __currentui) __currentui.close();
    $(".game").append(out);
    __currentui = wnd;
  }
  wnd.close = function () {
    out.remove();
  }

  return wnd;
}

function ui_hello() {
  var wnd = new_window("Hello");
  var opendialog_button = new_btn("開く").click(function () {
    openfile_dialog(function (event) {

      ui_triming(event.target.result);
    });
  });

  wnd.append(opendialog_button);

  wnd.show();
  return wnd;
}

function ui_triming(image_src) {
  var wnd = new_window("Triming");
  wnd.height("80%");
  var center_div = $("<div></div>").css({ "text-align": "center" });
  var canvas = $("<canvas></canvas>").addClass("ui_trim_canvas");
  var ok_button = new_btn("決定");

  var img = new Image();
  img.src = image_src;

  img.onload = function () {
    canvas.attr("width", img.width);
    canvas.attr("height", img.height);

    var ctx = canvas[0].getContext("2d");

    var width = canvas[0].width;
    var height = canvas[0].height;
    var line1 = 140;
    var line2 = 210;
    var near = 0;
    var render_run = true;
    function checkNear(num) {
      ctx.strokeStyle = "black";
      if (near == num) {
        ctx.strokeStyle = "lightgreen";
      }
    }
    function render() {

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();

      ctx.drawImage(img, 0, 0);

      ctx.beginPath();
      checkNear(1);
      ctx.moveTo(0, line1);
      ctx.lineTo(img.width, line1);
      ctx.stroke();

      ctx.beginPath();
      checkNear(2);
      ctx.moveTo(0, line2);
      ctx.lineTo(img.width, line2);
      ctx.stroke();

      if (render_run)
        requestAnimationFrame(render);
    }

    canvas.mousemove(function (e) {
      var y = e.offsetY;
      if (line1 - 20 < y && line1 + 20 > y) {
        if (e.buttons)
          line1 = y;
        near = 1;
      } else if (line2 - 20 < y && line2 + 20 > y) {
        if (e.buttons)
          line2 = y;
        near = 2;
      } else near = 0;
    });

    ok_button.click(function () {
      render_run = false;

      var head = $("<canvas></canvas>").css({ display: "none" });
      var neck = $("<canvas></canvas>").css({ display: "none" });
      var body = $("<canvas></canvas>").css({ display: "none" });

      canvas.remove();

      center_div.append(head);
      center_div.append(neck);
      center_div.append(body);

      if (line2 < line1) {
        var _line = line1;
        line1 = line2;
        line2 = _line;
      }

      var head_height = line1;
      head.attr("width", img.width).attr("height", head_height);
      var ctx = head[0].getContext("2d");
      ctx.drawImage(img,
        0, 0, img.width, head_height,
        0, 0, img.width, head_height);

      var neck_height = line2 - line1;
      neck.attr("width", img.width).attr("height", neck_height);
      ctx = neck[0].getContext("2d");
      ctx.drawImage(img,
        0, line1, img.width, neck_height,
        0, 0, img.width, neck_height);

      var body_height = img.height - line2;
      body.attr("width", img.width).attr("height", body_height);
      ctx = body[0].getContext("2d");
      ctx.drawImage(img,
        0, line2, img.width, body_height,
        0, 0, img.width, body_height);



      function show_img(blob, target, _height) {
        var url = URL.createObjectURL(blob);
        var image = new Image();
        image.src = url;
        image.onload = function () {
          target.css({
            "background-image": "url('" + url + "')",
            width: img.width,
            height: _height
          });
        }
      }

      head[0].toBlob(function (blob) {
        show_img(blob, monster_head_div, head_height);
      });
      neck[0].toBlob(function (blob) {
        show_img(blob, monster_neck_div, 0);
      });
      body[0].toBlob(function (blob) {
        show_img(blob, monster_body_div, body_height);
      });

      wnd.close();

      startGame(img.width);


    });

    render();
  }




  center_div.append(canvas);




  wnd.append(center_div);
  wnd.append(ok_button);
  wnd.show();
  return wnd;
}

function startGame(_width) {
  var wnd_game = $(".game");

  var display_click_count = $("<span></span>").addClass("game_click_count");
  var monster_div = $("<div></div>").addClass("game_monster_div");

  monster_div.append(monster_head_div);
  monster_div.append(monster_neck_div);
  monster_div.append(monster_body_div);

  wnd_game.append(display_click_count);
  wnd_game.append(
    $("<div></div>").addClass("game_monster_center_div").width(_width)
      .append(monster_div)
  );


  wnd_game.click(function () {
    click_count += 1;
    display_click_count.text(click_count + " CLICK!");
    var neck_height = click_count * 2;

    var monster_body_top = monster_body_div.position().top;

    monster_head_div.animate(
      {
        top:
        monster_body_top - monster_head_div.height() - neck_height
      }, { duration: 20 });
    monster_neck_div.animate({
      height: neck_height,
      top:
      monster_body_top - neck_height
    }, { duration: 20 });
  });
}

$(document).ready(function () {

  if (!loadSave()) {

  }
  ui_hello();
});