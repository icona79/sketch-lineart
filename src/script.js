var sketch = require("sketch");
import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
const webviewIdentifier = "lineart.webview";
var identifier = __command.identifier();
import { Page } from "sketch/dom";
var Style = require("sketch/dom").Style;
var Flow = require("sketch/dom").Flow;
var DataSupplier = require("sketch/data-supplier");
var doc = context.document;
var document = sketch.getSelectedDocument();
var selectedItem = document.selectedLayers.layers[0];
var documentName = "data";

var { isNativeObject } = require("util");
import { Bezier } from "bezier-js";
import { checkIntersection, colinearPointWithinSegment } from "line-intersect";

let colorGradient001 = sketch.Swatch.from({
    name: "Gradient 001",
    color: "#E65AFF",
});
let colorGradient002 = sketch.Swatch.from({
    name: "Gradient 002",
    color: "#ffffffff",
});
// color: "#FCEBFF",
let colorGradient003 = sketch.Swatch.from({
    name: "Gradient 003",
    color: "#AD00CC",
});

let colorBorder001 = sketch.Swatch.from({
    name: "Border",
    color: "#F200FF",
});

var ratios = [
    "1.067",
    "1.125",
    "1.2",
    "1.25",
    "1.333",
    "1.414",
    "1.5",
    "1.618",
    "3.14",
];
// 2. UI Labels for selection
var ratioLabels = [
    "1.067 - Minor Second",
    "1.125 - Major Second",
    "1.200 - Minor Third",
    "1.250 - Major Third",
    "1.333 - Perfect Fourth",
    "1.414 - Augmented Fourth",
    "1.500 - Perfect Fifth",
    "1.618 - Golden Ratio",
    "3.14  - Pi",
];

var increment = 10;
var linePointsIncrement = 10;
var linesGradientPosition = [
    [0.5, 0],
    [0.5, 1],
];
var linesGradientStops = [
    [0, colorGradient001],
    [0.5, colorGradient002],
    [1, colorGradient003],
];

export default function () {
    if (
        document.selectedLayers.length === 1 &&
        (selectedItem.type === "Shape" || selectedItem.type === "ShapePath")
    ) {
        /* Create the webview with the sizes */
        const options = {
            identifier: webviewIdentifier,
            width: 280,
            height: 504,
            show: false,
        };

        const browserWindow = new BrowserWindow(options);

        // only show the window when the page has loaded to avoid a white flash
        browserWindow.once("ready-to-show", () => {
            // Send the list of Text Styles to the plugin webview
            try {
                // `fillLayerStylesDropdown(${stylesString}),fillTextStylesDropdown(${textString})`
                browserWindow.webContents.executeJavaScript().then((result) => {
                    // Once we're processing the styles on the webview, we can show it
                    browserWindow.show();
                });
            } catch (createWebViewErr) {
                console.log(createWebViewErr);
            }
        });

        const webContents = browserWindow.webContents;

        // add a handler for a call from web content's javascript
        webContents.on("nativeLog", (parameters) => {
            try {
                let selectedItemWidth = selectedItem.frame.width;
                let selectedItemHeight = selectedItem.frame.height;
                let verticalRythm = parameters.verticalRythmValue;
                let verticalIncerementalRatio =
                    (selectedItemHeight / 50) * verticalRythm;
                if (parameters.verticalRythmSelection !== 0) {
                    verticalRythm = ratios[parameters.verticalRythmSelection];
                    verticalIncerementalRatio =
                        (selectedItemHeight / 50) * verticalRythm;
                }
                increment = verticalIncerementalRatio;
                linePointsIncrement =
                    verticalIncerementalRatio *
                    ratios[parameters.pointsRatioSelection];

                let parentArtboard = selectedItem.parent;
                let parentArtboardWidth = parentArtboard.frame.width;
                let parentArtboardHeight = parentArtboard.frame.height;

                let points = selectedItem.points;
                let leftPoints = [];
                let rightPoints = [];
                let centerPoints = [];
                let topPoints = [];
                let bottomPoints = [];
                let middlePoints = [];

                // Generate an array with the points that are part of the same quadrant of the illustration
                // Add a minimal 0.1% extra to accommodate tiny misalignements

                points.forEach((point) => {
                    let pointX = point.point.x;
                    let pointY = point.point.y;
                    let pointXValue =
                        Math.round(pointX * selectedItemWidth * 100) / 100;
                    // console.log(pointXValue);
                    let pointYValue =
                        Math.round(pointY * selectedItemHeight * 100) / 100;
                    // console.log(pointYValue);
                    if (pointX <= 0.51) {
                        leftPoints.push([pointXValue, pointYValue]);
                    }
                    if (pointX >= 0.49) {
                        rightPoints.push([pointXValue, pointYValue]);
                    }
                    if (pointX >= 0.49 && pointX <= 0.51) {
                        centerPoints.push([pointXValue, pointYValue]);
                    }
                    if (pointY <= 0.51) {
                        topPoints.push([pointXValue, pointYValue]);
                    }
                    if (pointY >= 0.49) {
                        bottomPoints.push([pointXValue, pointYValue]);
                    }
                    if (pointY >= 0.49 && pointY <= 0.51) {
                        middlePoints.push([pointXValue, pointYValue]);
                    }
                });
                // Order all the points in the quadrant based on their position
                leftPoints.sort((a, b) => a[1] - b[1]);
                rightPoints.sort((a, b) => a[1] - b[1]);
                topPoints.sort((a, b) => a[0] - b[0]);
                bottomPoints.sort((a, b) => a[0] - b[0]);

                let startHorPoints = [];
                let endHorPoints = [];
                let linesCounter = 0;

                // add a line every incremental pixels (Horizontal)
                console.log(increment);
                for (
                    let n = increment;
                    n < selectedItemHeight;
                    n += increment
                ) {
                    let newLine = [
                        [0, n],
                        [selectedItemWidth, n],
                    ];
                    let x1 = newLine[0][0];
                    let y1 = newLine[0][1];
                    let x2 = newLine[1][0];
                    let y2 = newLine[1][1];
                    // Start points
                    for (let i = 0; i < leftPoints.length - 1; i++) {
                        let x3 = leftPoints[i][0];
                        let y3 = leftPoints[i][1];
                        let x4 = leftPoints[i + 1][0];
                        let y4 = leftPoints[i + 1][1];
                        // console.log(n + " - " + y3 + " - " + y4);
                        if (n > y3 && n <= y4) {
                            let intersection = checkIntersection(
                                x1,
                                y1,
                                x2,
                                y2,
                                x3,
                                y3,
                                x4,
                                y4
                            );
                            startHorPoints.push([
                                intersection.point.x,
                                intersection.point.y,
                            ]);
                        }
                    }
                    // End points
                    for (let i = 0; i < rightPoints.length - 1; i++) {
                        let x3 = rightPoints[i][0];
                        let y3 = rightPoints[i][1];
                        let x4 = rightPoints[i + 1][0];
                        let y4 = rightPoints[i + 1][1];
                        // console.log(n + " - " + y3 + " - " + y4);
                        if (n > y3 && n <= y4) {
                            let intersection = checkIntersection(
                                x1,
                                y1,
                                x2,
                                y2,
                                x3,
                                y3,
                                x4,
                                y4
                            );
                            endHorPoints.push([
                                intersection.point.x,
                                intersection.point.y,
                            ]);
                        }
                    }
                    linesCounter++;
                }

                // Generate lines every increment
                document.selectedLayers = [];
                let lines = [];
                for (let line = 0; line < linesCounter; line++) {
                    let newX = startHorPoints[line][0];
                    let newWidth = endHorPoints[line][0] - newX;
                    let newY = startHorPoints[line][1];
                    let newHeight = endHorPoints[line][1] - newY;
                    if (line == 0) {
                    }

                    let newLine = createLine(
                        parentArtboard,
                        newX,
                        newY,
                        newWidth,
                        newHeight,
                        "",
                        "",
                        "Line" + line,
                        parameters
                    );
                    if (parameters.wavesType === 0) {
                        newLine.style.fills = [
                            {
                                fillType: Style.FillType.Gradient,
                                gradient: {
                                    gradientType: Style.GradientType.Linear,
                                    from: {
                                        x: linesGradientPosition[0][0],
                                        y: linesGradientPosition[0][1],
                                    },
                                    to: {
                                        x: linesGradientPosition[1][0],
                                        y: linesGradientPosition[1][1],
                                    },
                                    stops: [
                                        {
                                            position: linesGradientStops[0][0],
                                            color: linesGradientStops[0][1]
                                                .referencingColor,
                                        },
                                        {
                                            position: linesGradientStops[2][0],
                                            color: linesGradientStops[1][1]
                                                .referencingColor,
                                        },
                                    ],
                                },
                                enabled: true,
                            },
                        ];
                    } else if (parameters.wavesType === 1) {
                        newLine.style.fills = [
                            {
                                fillType: Style.FillType.Gradient,
                                gradient: {
                                    gradientType: Style.GradientType.Linear,
                                    from: {
                                        x: linesGradientPosition[0][0],
                                        y: linesGradientPosition[0][1],
                                    },
                                    to: {
                                        x: linesGradientPosition[1][0],
                                        y: linesGradientPosition[1][1],
                                    },
                                    stops: [
                                        {
                                            position: linesGradientStops[0][0],
                                            color: linesGradientStops[1][1]
                                                .referencingColor,
                                        },
                                        {
                                            position: linesGradientStops[2][0],
                                            color: linesGradientStops[2][1]
                                                .referencingColor,
                                        },
                                    ],
                                },
                                enabled: true,
                            },
                        ];
                    } else {
                        newLine.style.fills = [
                            {
                                fillType: Style.FillType.Gradient,
                                gradient: {
                                    gradientType: Style.GradientType.Linear,
                                    from: {
                                        x: linesGradientPosition[0][0],
                                        y: linesGradientPosition[0][1],
                                    },
                                    to: {
                                        x: linesGradientPosition[1][0],
                                        y: linesGradientPosition[1][1],
                                    },
                                    stops: [
                                        {
                                            position: linesGradientStops[0][0],
                                            color: linesGradientStops[0][1]
                                                .referencingColor,
                                        },
                                        {
                                            position: linesGradientStops[1][0],
                                            color: linesGradientStops[1][1]
                                                .referencingColor,
                                        },
                                        {
                                            position: linesGradientStops[2][0],
                                            color: linesGradientStops[2][1]
                                                .referencingColor,
                                        },
                                    ],
                                },
                                enabled: true,
                            },
                        ];
                    }
                    newLine.style.borders[0].color =
                        colorBorder001.referencingColor;
                    newLine.style.borders[0].thickness = 2;

                    // if (newLine.points.length <= 2) {
                    //     newLine.remove();
                    // }

                    lines.push(newLine);
                }

                let group = createGroup(parentArtboard, [], "Art Group");
                lines.forEach((line) => {
                    line.parent = group;
                });
                if (parameters.wavesType === 1) {
                    let newIndex = lines.length - 1;
                    for (let i = 0; i < lines.length; i++) {
                        lines[i].index = newIndex;
                        newIndex -= 1;
                    }
                }
                group.adjustToFit();
                if (parameters.layout === 0) {
                    group.frame.x = 0;
                } else {
                    group.frame.x = selectedItem.frame.x;
                }
                group.frame.y = Math.round(
                    selectedItem.frame.y - Math.abs(group.frame.y)
                );

                browserWindow.close();
            } catch (pluginErr) {
                console.log(pluginErr);
            }
        });

        browserWindow.loadURL(require("../resources/webview.html"));
    } else {
        sketch.UI.message("🙏 Please, select a shape");
    }
}

function addAngles(pointsArray) {
    let anglesArray = [];
    if (pointsArray.length > 1) {
        for (let i = 0; i < pointsArray.length - 1; i++) {
            let ax = pointsArray[i][0];
            let ay = pointsArray[i][1];
            let bx = pointsArray[i + 1][0];
            let by = pointsArray[i + 1][1];
            anglesArray.push(
                Math.round(
                    (getAngleDeg(ax, ay, bx, by) + Number.EPSILON) * 100
                ) / 100
            );
        }
    } else if (pointsArray.length === 1) {
        anglesArray.push(0);
    }
    return anglesArray;
}

function getAngleDeg(ax, ay, bx, by) {
    var angleRad = Math.atan((ay - by) / (ax - bx));
    var angleDeg = (angleRad * 180) / Math.PI;

    return angleDeg;
}

function createGroup(parentLayer, children, name) {
    try {
        let Group = sketch.Group;
        let newGroup = new Group({
            parent: parentLayer,
            layers: children,
            name: name,
        });

        return newGroup;
    } catch (errGroup) {
        console.log(errGroup);
    }
}

function createLine(
    parentLayer,
    x,
    y,
    width,
    height,
    background,
    border,
    name,
    parameters
) {
    let backgrounds = [];
    if (background !== "") {
        backgrounds = background;
    }
    let borders = [];
    if (border !== "") {
        borders = border;
    }

    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;
    if (parameters.layout === 0) {
        newX = 0;
        newWidth = parentLayer.frame.width;
    }

    let ShapePath = sketch.ShapePath;
    let newShape = new ShapePath({
        parent: parentLayer,
        frame: {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        },
        style: { fills: [background], borders: [borders] },
        name: name,
        closed: false,
    });

    // Points high ratio (max and min)
    // pointsHeightRatioSelection: 0
    // pointsHeightRatioValue: 0
    let heightRatio =
        (parentLayer.frame.height / 50) *
        ratios[parameters.pointsHeightRatioSelection];
    if (parameters.pointsHeightRatioSelection === 0) {
        heightRatio =
            (parentLayer.frame.height / 50) * parameters.pointsHeightRatioValue;
    }
    // heightRatio = calc_percentage(heightRatio, parentLayer.frame.height);

    // Points management
    let points = [];
    let totalPoints = Math.floor(width / linePointsIncrement);
    if (parameters.layout === 0) {
        let mainPoint0 = 0;
        let mainPoint1 = x;
        let mainPoint2 = x + width;
        let mainPoint3 = newWidth;

        let pointsPosition = [mainPoint0, mainPoint1];
        let totalPointsSpace = totalPoints * linePointsIncrement;
        // Remove one point if margins are too tiny
        if (width - totalPointsSpace < linePointsIncrement * 2) {
            totalPoints -= 1;
            totalPointsSpace = totalPoints * linePointsIncrement;
        }

        let internalMargin = (width - totalPointsSpace) / 2;
        let XDistance = calc_percentage(linePointsIncrement, newWidth);

        let firstPoint = mainPoint1 + internalMargin;
        let nextPointPosition = firstPoint;
        for (let i = 0; i < totalPoints; i++) {
            pointsPosition.push(nextPointPosition);
            nextPointPosition += linePointsIncrement;
        }
        pointsPosition.push(mainPoint2, mainPoint3);

        let pointsPositionPercentage = [];
        for (let i = 0; i < pointsPosition.length; i++) {
            let position = calc_percentage(pointsPosition[i], newWidth);
            pointsPositionPercentage.push(position);
        }
        // Create the points array
        // First 2 points (left and shape start - x = Margin)
        points = [
            {
                point: { x: 0, y: 0.5 },
                pointType: "Straight",
            },
            {
                point: { x: pointsPositionPercentage[1], y: 0.5 },
                pointType: "Disconnected",
                curveFrom: { x: pointsPositionPercentage[1] + 0.01, y: 0.5 },
                curveTo: { x: pointsPositionPercentage[1], y: 0.5 },
            },
        ];

        // TODO: add a random amount of points with small curves here

        //  Central points
        if (totalPoints > 1) {
            for (let i = 0; i < totalPoints; i++) {
                let newPosX = pointsPositionPercentage[i + 2];
                // the Y position of the points is random:
                // based on selection on screen
                // 1. waves only up
                // 2. waves only down
                // 3. waves up and down
                //  - odd points: from -51 to 0
                //  - even points: from 0 to + 50
                // 0 to 1 is the line frame space
                let newPosY = 0.5;
                if (parameters.wavesType === 0) {
                    newPosY = getRandomArbitrary(-heightRatio + 1, 0);
                } else if (parameters.wavesType === 1) {
                    newPosY = getRandomArbitrary(0, heightRatio);
                } else {
                    if (i % 2) {
                        newPosY = getRandomArbitrary(-heightRatio + 1, 0);
                    } else {
                        newPosY = getRandomArbitrary(0, heightRatio);
                    }
                }

                // Generate the new point
                let newPoint = {
                    point: { x: newPosX, y: newPosY },
                    curveFrom: { x: newPosX + XDistance / 5, y: newPosY },
                    curveTo: { x: newPosX - XDistance / 5, y: newPosY },
                    pointType: "Mirrored",
                };
                // Add the new point to the points array
                points.push(newPoint);
            }
        } else if (totalPoints === 1) {
            // If the number of central points is only 1
            let newPosY = getRandomArbitrary(-5.1, 5);
            points.push({
                point: { x: 0.5, y: newPosY },
                pointType: "Mirrored",
                curveFrom: { x: 0.55, y: newPosY },
                curveTo: { x: 0.45, y: newPosY },
            });
        }

        // TODO: add a random amount of points with small curves here

        // Last 2 points point (x = width - margin)
        points.push(
            {
                point: {
                    x: pointsPositionPercentage[
                        pointsPositionPercentage.length - 2
                    ],
                    y: 0.5,
                },
                pointType: "Disconnected",
                curveFrom: {
                    x: pointsPositionPercentage[
                        pointsPositionPercentage.length - 2
                    ],
                    y: 0.5,
                },
                curveTo: {
                    x:
                        pointsPositionPercentage[
                            pointsPositionPercentage.length - 2
                        ] - 0.01,
                    y: 0.5,
                },
            },
            {
                point: { x: 1, y: 0.5 },
                pointType: "Straight",
            }
        );
    } else {
        // Note: the conversion from the PX value to the 0-1 % value we use for points is:
        // ((100/[size in pixel])*([value in pixel]))/100
        // Convert the points to values between 0 and 1
        let totalPointsSpace = totalPoints * linePointsIncrement;
        // Remove one point is maring are too tiny
        if (width - totalPointsSpace < linePointsIncrement) {
            totalPoints -= 1;
            totalPointsSpace = totalPoints * linePointsIncrement;
        }

        let margin = ((100 / width) * ((width - totalPointsSpace) / 2)) / 100;
        let newPosX = margin;
        let newPosY = 0.5;
        // Distance in X between the points
        let XDistance =
            ((100 / width) * (totalPointsSpace / (totalPoints - 1))) / 100;

        // Create the points array
        // First point (x = Margin)
        points = [
            {
                point: { x: 0, y: 0.5 },
                pointType: "Disconnected",
                curveFrom: { x: 0.01, y: 0.5 },
                curveTo: { x: 0.0, y: 0.5 },
            },
        ];
        //  Central points
        if (totalPoints > 1) {
            for (let i = 0; i < totalPoints; i++) {
                // intermediate points need to count also the margin
                if (i > 0) {
                    newPosX += XDistance;
                }
                // the Y position of the points is random:
                //  - odd points: from -51 to 0
                //  - even points: from 0 to + 50
                // 0 to 1 is the line frame space
                if (parameters.wavesType === 0) {
                    newPosY = getRandomArbitrary(-51, 0);
                } else if (parameters.wavesType === 1) {
                    newPosY = getRandomArbitrary(50, 0);
                } else {
                    if (i % 2) {
                        newPosY = getRandomArbitrary(-51, 0);
                    } else {
                        newPosY = getRandomArbitrary(0, 50);
                    }
                }
                // Generate the new point
                let newPoint = {
                    point: { x: newPosX, y: newPosY },
                    curveFrom: { x: newPosX + XDistance / 5, y: newPosY },
                    curveTo: { x: newPosX - XDistance / 5, y: newPosY },
                    pointType: "Mirrored",
                };
                // Add the new point to the points array
                points.push(newPoint);
            }
        } else if (totalPoints === 1) {
            // If the number of central points is only 1
            newPosY = getRandomArbitrary(-51, 50);
            points.push({
                point: { x: 0.5, y: newPosY },
                pointType: "Mirrored",
                curveFrom: { x: 0.55, y: newPosY },
                curveTo: { x: 0.45, y: newPosY },
            });
        }
        // Last point (x = width - margin)
        points.push({
            point: { x: 1, y: 0.5 },
            pointType: "Disconnected",
            curveFrom: { x: 1, y: 0.5 },
            curveTo: { x: 0.99, y: 0.5 },
        });
    }

    // Add the points to the ShapePath
    newShape.points = points;
    newShape.closed = false;

    return newShape;
}

function resetStyle(layer) {
    layer.style.fills = [];
    layer.style.borders = [];
    layer.style.shadows = [];
    layer.style.innerShadows = [];
    layer.style.blur = [];
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function calc_percentage(value = 100, total = 100) {
    let result = ((100 / total) * value) / 100;

    return result;
}
