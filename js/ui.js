//Starts the simulation when the start button is pressed
function titleStart()
{
  initCanvas();

  //Move title
  var titleDiv = document.getElementById("title");
  titleDiv.style.transform = 'translate(-50%, -250%)'
}

var DECIMAL_ROUND = 3;
var INPUTS = ["move_vel", "relevance", "crowd_dist", "obstacle_intensity"]
//Updates the control table when the controls are interacted with
function updateControls()
{
  var simControlForm = document.forms.sim_control;

  //Update outputs
  for (let i = 0; i < INPUTS.length; i++)
  {
    var value = Math.round($("input[name='" + INPUTS[i] + "']").val() * Math.pow(10, DECIMAL_ROUND)) / Math.pow(10, DECIMAL_ROUND);
    $("output[name='" + INPUTS[i] + "_val']").val(value);
  }

  //Update globals
  MOVE_VEL = simControlForm.move_vel.value;
  DIST_RELEVANCE = simControlForm.relevance.value;
  SHOW_RELEVANCE_ELLIPSE = simControlForm.show_range.checked;
  TARGET_CROWDING_DIST = simControlForm.crowd_dist.value;
  OBSTACLE_INTENSITY = simControlForm.obstacle_intensity.value;
}

//Toggles the control window (dropdown menu)
var CONTROLS_SHOWN = false;
function toggleControls()
{
  var controlDiv = document.getElementById("control-container");
  var toggleButton = document.getElementById("toggle-controls-button");
  if (!CONTROLS_SHOWN)
  {
    controlDiv.style.transform = 'translateY(0%)';
    toggleButton.innerHTML = "Hide Controls";
  }
  else
  {
    controlDiv.style.transform = 'translateY(-80%)';
    toggleButton.innerHTML = "Show Controls";
  }
  CONTROLS_SHOWN = !CONTROLS_SHOWN;
}
