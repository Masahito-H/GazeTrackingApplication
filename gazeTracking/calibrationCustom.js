/*
 * geze tracking
 *
 * Licensed under GPLv3.
 *
 * Copyright (c) 2019 Masahito H.
 *
 * referrence: the Example of WebGazer.js
 * (WebGazer.js on an Empty Webpage with calibration)
 * Copyright (c) 2018 Brown HCI Group
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

var PointCalibrate = 0;
var CalibrationPoints={};
var GenerativeModeFlag = false;

var Path = null;

/**
 * Clear the canvas and the calibration button.
 */
function ClearCanvas(){
  $(".Calibration").hide();
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Show the instruction of using calibration at the start up screen.
 */
function PopUpInstruction(){
  GenerativeModeFlag = false;

  ClearCanvas();
  swal({
    title:"Calibration",
    text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
    buttons:{
      cancel: false,
      confirm: true
    }
  }).then(isConfirm => {
    ShowCalibrationPoint();
  });

}
/**
  * Show the help instructions right at the start.
  */
function helpModalShow() {
    $('#helpModal').modal('show');
}

/**
 * Load this function when the index page starts.
* This function listens for button clicks on the html page
* checks that all buttons have been clicked 5 times each, and then goes on to measuring the precision
*/
$(document).ready(function(){
  ClearCanvas();
  helpModalShow();
     $(".Calibration").click(function(){ // click event on the calibration buttons

      var id = $(this).attr('id');

      if (!CalibrationPoints[id]){ // initialises if not done
        CalibrationPoints[id]=0;
      }
      CalibrationPoints[id]++; // increments values

      if (CalibrationPoints[id]==5){ //only turn to yellow after 5 clicks
        $(this).css('background-color','yellow');
        $(this).prop('disabled', true); //disables the button
        PointCalibrate++;
      }else if (CalibrationPoints[id]<5){
        //Gradually increase the opacity of calibration points when click to give some indication to user.
        var opacity = 0.2*CalibrationPoints[id]+0.2;
        $(this).css('opacity',opacity);
      }

      //Show the middle calibration point after all other points have been clicked.
      if (PointCalibrate == 8){
        $("#Pt5").show();
      }

      if (PointCalibrate >= 9){ // last point is calibrated
            //using jquery to grab every element in Calibration class and hide them except the middle point.
            $(".Calibration").hide();
            $("#Pt5").show();

            // clears the canvas
            var canvas = document.getElementById("plotting_canvas");
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            // notification for the measurement process
            swal({
              title: "Calculating measurement",
              text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
              closeOnEsc: false,
              allowOutsideClick: false,
              closeModal: true
            }).then( isConfirm => {

                // makes the variables true for 5 seconds & plots the points
                $(document).ready(function(){

                  store_points_variable(); // start storing the prediction points

                  sleep(5000).then(() => {
                      stop_storing_points_variable(); // stop storing the prediction points
                      var past50 = get_points() // retrieve the stored points
                      var precision_measurement = calculatePrecision(past50);
                      var accuracyLabel = "<a>Accuracy | "+precision_measurement+"%</a>";
                      document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
                      swal({
                        title: "Your accuracy measure is " + precision_measurement + "%",
                        allowOutsideClick: false,
                        buttons: {
                          cancel: "Recalibrate",
                          confirm: true,
                        }
                      }).then(isConfirm => {
                          if (isConfirm){
                            //clear the calibration & hide the last middle button
                            GenerativeModeFlag = true;
                            ClearCanvas();
                          } else {
                            //use restart function to restart the calibration
                            GenerativeModeFlag = false;
                            ClearCalibration();
                            ClearCanvas();
                            ShowCalibrationPoint();
                          }
                      });
                  });
                });
            });
          }
    });

    window.addEventListener('keydown', function(event){
      var navText = null;
      switch(event.key){
        case "1":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-A </a>";
          Path = "./csv/boidA.csv";
          break;

        case "2":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-B </a>";
          Path = "./csv/boidB.csv";
          break;

        case "3":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-C </a>";
          Path = "./csv/boidC.csv";
          break;

        case "4":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-D </a>";
          Path = "./csv/boidD.csv";
          break;

        case "5":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-E </a>";
          Path = "./csv/boidE.csv";
          break;

        case "6":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-A </a>";
          Path = "./csv/vehicleA.csv";
          break;

        case "7":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-B </a>";
          Path = "./csv/vehicleB.csv";
          break;

        case "8":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-C </a>";
          Path = "./csv/vehicleC.csv";
          break;

        case "9":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-D </a>";
          Path = "./csv/vehicleD.csv";
          break;

        case "0":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-E </a>";
          Path = "./csv/vehicleE.csv";
          break;

        case "z":
          document.getElementById("Mode").innerHTML = "<a> Mode | boid-B </a>";
          //Path = "./csv/boidB.csv";
          break;

        case "x":
          document.getElementById("Mode").innerHTML = "<a> Mode | vehicle-B </a>";
          //Path = "./csv/vehicleB.csv";
          break;

        case " ":
          if(Path != null){
            getCSV(Path);
          }
          break;

        case "v":
          GazeVisible = !GazeVisible;
          document.getElementById("Visible").innerHTML = (GazeVisible) ? "<a> visible </a>" : " <a></a> ";
          break;

        default:
          document.getElementById("Mode").innerHTML = "<a> Mode | null </a>";
          Path = null;
          break;
      }
    });
});

/**
 * Show the Calibration Points
 */
function ShowCalibrationPoint() {
  $(".Calibration").show();
  $("#Pt5").hide(); // initially hides the middle button
}

/**
* This function clears the calibration buttons memory
*/
function ClearCalibration(){
  window.localStorage.clear();
  $(".Calibration").css('background-color','red');
  $(".Calibration").css('opacity',0.2);
  $(".Calibration").prop('disabled',false);

  CalibrationPoints = {};
  PointCalibrate = 0;
}

// sleep function because java doesn't have one, sourced from http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
