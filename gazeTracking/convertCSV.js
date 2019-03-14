/*
 * geze tracking
 *
 * Licensed under GPLv3.
 *
 * Copyright (c) 2019 Masahito H.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var canvasG = document.querySelector('#plotting_canvas');
var ctxG = canvasG.getContext('2d');
var viewG = {
  width: window.innerWidth,
  height: window.innerHeight
};

var parameters = new String();
var fl = 0;

var simulator = [];
const MAX_ELEMENTS = 800;
const FPS = 30;
const MIL = 1000 / FPS;
var StartTime;
var FrameCount;
var UpdateCount;

var GazeVisible = false;

var interval = null;

var Delta = 0;

async function getCSV(path){
  resizeEvent();
  updateView();

  var req = new XMLHttpRequest();
  req.open("get", path, true);
  req.send(null);

  req.onload = function(){
    simulator = convertCSVtoArray(req.responseText);
    simulator.shift();

    parameters += "object,frame,x,y";
    parameters += "\n";

    webgazer.setVideoViewerSize(0, 0);
    $("#webgazerNavbar").hide();
    //interval = window.requestAnimationFrame(draw);
    FrameCount = 0;
    UpdateCount = -1;

    DotFlag = false;
    let remainingSec = 3;
    let standBy = setInterval(function() {
      if(remainingSec <= 0){
        clearInterval(standBy);
        StartTime = performance.now();
        draw();
      }

      ctxG.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctxG.fillStyle = '#000000';
      ctxG.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctxG.font = "italic 60px Arial";
      ctxG.fillStyle = '#FFD9D9';
      ctxG.fillText(remainingSec, window.innerWidth / 2, window.innerHeight / 2);

      remainingSec--;
    }, 1000);
  }
}

function convertCSVtoArray(str){
  var result = [];
  var tmp = str.split("\n");

  return tmp;
}

function draw(){
  //let start = performance.now();
  interval = window.requestAnimationFrame(draw);
  console.log(FrameCount + ", " + UpdateCount);
  if(FrameCount > UpdateCount){
    ctxG.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var frame = simulator.slice(0, MAX_ELEMENTS + 1);
    simulator.splice(0, MAX_ELEMENTS + 1);

    while(FrameCount > (UpdateCount + 1)){
      frame = simulator.slice(0, MAX_ELEMENTS + 1);
      simulator.splice(0, MAX_ELEMENTS + 1);
      UpdateCount++;
    }

    ctxG.fillStyle = '#000000';
    ctxG.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for(let i = 0; i < frame.length; i++){
      let parameter = frame[i].split(",");

      if(parameter[0] == "agent"){
        let x = parseInt(parameter[2]);
        let y = parseInt(parameter[3]);

        ctxG.fillStyle = '#FFFFFF';
        ctxG.beginPath();
        ctxG.arc(x, y, 2, 0, Math.PI * 2, false);
        ctxG.fill();
      }
      else if(parameter[0] == "region"){
        fl = parseInt(parameter[4]);
        console.log(fl);

        if(GazeVisible){
          let x = parseInt(parameter[2]);
          let y = parseInt(parameter[3]);

          ctxG.fillStyle = '#D9D9FF';
          ctxG.beginPath();
          ctxG.arc(x, y, 5, 0, Math.PI * 2, false);
          ctxG.fill();
        }
      }
      else{
        //console.log(frame[i]);
      }
    }

    UpdateCount++;
  }

  if(simulator.length > 0){
    //console.log(Pred.x + ", " + Pred.y);
    parameters += ("gaze," + fl + "," + Pred.x + "," + Pred.y);
    parameters += "\n";

      /*
      let end = performance.now();
      if((end - start) > MIL){
        Delta += ((end - start) - MIL);
      }
      */

    FrameCount = Math.floor((performance.now() - StartTime) / MIL);
  }
  else{
    simulator = [];

    ctxG.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var blob = new Blob([ parameters ], { "type" : "application/octet-stream" });
    var a = document.createElement('a');
    window.URL = window.URL || window.webkitURL;

    webgazer.setVideoViewerSize(320, 240);
    $("#webgazerNavbar").show();

    fl = 0;
    window.cancelAnimationFrame(interval);

    a.href = window.URL.createObjectURL(blob);
    a.download = "subject.csv";
    a.click();

    DotFlag = true;
  }
}



function resizeEvent(){
  window.addEventListener('resize', () => {
    viewG = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    canvasG.width = viewG.width;
    canvasG.height = viewG.height;
  })
}

function updateView(){
  view = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  canvasG.width = view.width;
  canvasG.height = view.height;
}


//getCSV();
