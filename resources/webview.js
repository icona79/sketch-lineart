// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

// call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//     window.postMessage('nativeLog', 'Called from the webview')
// })

// Enter Key = Click on Create Button button
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        document.getElementById("parametersSubmit").click();
    }
});

// ************************************************** //
// Validate the input fields                          //
// ************************************************** //
const numbersOnly = "/^d+$/";
const decimalOnly = "/^s*-?[1-9]d*(.d{1,2})?s*$/";
const uppercaseOnly = "/^[A-Z]+$/";
const lowercaseOnly = "/^[a-z]+$/";
const stringOnly = "/^[A-Za-z0-9]+$/";

// Type
var wavesType = 0;
var wavesType1 = document.getElementById("wavesType-up");
// Layout
var layout = 0;
var layout1 = document.getElementById("layout1");

var verticalRythmID = document.getElementById("verticalRythm");
var verticalRythmValueID = document.getElementById("verticalRythmValue");

var pointsRatioID = document.getElementById("pointsRatio");
var pointsRatioValueID = document.getElementById("pointsRatioValue");

var pointsHeightRatioID = document.getElementById("pointsHeightRatio");
var pointsHeightRatioValueID = document.getElementById(
    "pointsHeightRatioValue"
);

document.getElementById("parametersSubmit").addEventListener("click", () => {
    // Waves Type
    var wavesTypeRadios = document.getElementsByName("wavesType");
    for (i = 0; i < wavesTypeRadios.length; i++) {
        if (wavesTypeRadios[i].checked) {
            wavesType = i;
        }
    }

    // Layout type
    var layoutRadios = document.getElementsByName("layout");
    for (i = 0; i < layoutRadios.length; i++) {
        if (layoutRadios[i].checked) {
            layout = i;
        }
    }

    // Vertical Rythm ratio
    var verticalRythmSelection = verticalRythmID.value;
    var verticalRythmValue = 0;
    if (verticalRythmSelection === "0") {
        if (verticalRythmValueID.value != "") {
            verticalRythmValue = verticalRythmValueID.value;
        } else {
            verticalRythmValue = 1;
        }
    }

    // Points ratio
    var pointsRatioSelection = pointsRatioID.value;
    var pointsRatioValue = 0;
    if (pointsRatioSelection === "0") {
        if (pointsRatioValueID.value != "") {
            pointsRatioValue = pointsRatioValueID.value;
        } else {
            pointsRatioValue = 1;
        }
    }

    // Points height ratio
    var pointsHeightRatioSelection = pointsHeightRatioID.value;
    var pointsHeightRatioValue = 0;
    if (pointsHeightRatioSelection === "0") {
        if (pointsHeightRatioID.value != "") {
            pointsHeightRatioValue = pointsHeightRatioID.value;
        } else {
            pointsHeightRatioValue = 1;
        }
    }

    var parameters = {
        wavesType: wavesType,
        layout: layout,
        verticalRythmSelection: verticalRythmSelection,
        verticalRythmValue: verticalRythmValue,
        pointsRatioSelection: pointsRatioSelection,
        pointsRatioValue: pointsRatioValue,
        pointsHeightRatioSelection: pointsHeightRatioSelection,
        pointsHeightRatioValue: pointsHeightRatioValue,
    };

    //console.log(parameters);

    window.postMessage("nativeLog", parameters);
});

// *************************************************** //
// Expose the value input for Vertical Rythm if needed //
// *************************************************** //
verticalRythmID.addEventListener("change", function () {
    if (verticalRythmID.value === "0") {
        document.getElementById("verticalRythmValue").disabled = false;
    } else {
        document.getElementById("verticalRythmValue").disabled = true;
    }
});

// *************************************************** //
// Expose the value input for Points Rythm if needed   //
// *************************************************** //
pointsRatioID.addEventListener("change", function () {
    if (pointsRatioID.value === "0") {
        document.getElementById("pointsRatioValue").disabled = false;
    } else {
        document.getElementById("pointsRatioValue").disabled = true;
    }
});

// *************************************************** //
// Expose the value input for Points Rythm if needed   //
// *************************************************** //
pointsHeightRatioID.addEventListener("change", function () {
    if (pointsHeightRatioID.value === "0") {
        document.getElementById("pointsHeightRatioValue").disabled = false;
    } else {
        document.getElementById("pointsHeightRatioValue").disabled = true;
    }
});

// document.getElementById("my-element").remove()
//document.getElementById("tag-id").innerHTML = "<ol><li>html data</li></ol>";
