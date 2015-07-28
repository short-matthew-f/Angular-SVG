var app = angular.module("PathApp", []);

app.controller("PathController", function ($scope) {
  $scope.editable = true;

  $scope.paths = [];
  $scope.points = [];
  $scope.pathPairs = [];

  $scope.points.currentPathOptions = {
    fill: "black",
    stroke: "red",
    strokeWidth: 3
  };

  $scope.toggleEditable = function () {
    $scope.editable = !$scope.editable;
  }

  var updatePathPairs = function () {
    $scope.pathPairs = [];

    var count = $scope.points.length;
    for (var i = 0; i < count; i++) {
      $scope.pathPairs.push([
        $scope.points[i],
        $scope.points[(i + 1) % count]
      ]);
    };
  }

  $scope.clearDrawing = function () {
    $scope.paths = [];
    $scope.points = [];
    updatePathPairs();
  }

  $scope.bringForward = function ($event, $index) {
    if ($scope.keydown == "command") {
      var pathPoints = $scope.paths.splice($index, 1)[0];
      $scope.startNextPath(pathPoints);
    }
  };

  $scope.splitLine = function ($event, endPoints) {
    if ($event.shiftKey) {
      var x = $event.offsetX,
          y = $event.offsetY,
          i = $scope.points.indexOf(endPoints[0]),
          j = $scope.points.indexOf(endPoints[1]);

      if (i > j) {
        addPoint({ x: x, y: y });
      } else {
        $scope.points.splice(j, 0, { x: x, y: y });
      }

      updatePathPairs();
    }
  }

  $scope.registerKey = function ($event) {
    if ($event.keyCode === 91) {
      $scope.keydown = "command";
    }
  }

  $scope.releaseKey = function ($event) {
    $scope.keydown = undefined;
  }

  $scope.startNextPath = function (newPoints) {
    if ($scope.points.length) {
      $scope.paths.push($scope.points);
    };

    if (newPoints) {
      $scope.points = newPoints;
    } else {
      $scope.points = [];
      $scope.points.currentPathOptions = {
        fill: "black",
        stroke: "red",
        strokeWidth: 3
      };
    }
    
    updatePathPairs();
  }

  $scope.pathString = function (points) {
    var path = "";

    if (points.length === 0) { return path; };

    for (var i = 0; i < points.length; i++) {
      if (i == 0) {
        path += "M " + points[i].x + " " + points[i].y + " ";
      } else if (i < points.length) {
        path += "L " + points[i].x + " " + points[i].y + " ";
      }
    }

    path += "Z";

    return path;
  };

  $scope.setAction = function ($event, point) {
    var x   = $event.offsetX,
        y   = $event.offsetY,
        obj = $scope.targetObject;

    if ($event.shiftKey && !point) { return; }
    if ($scope.keydown === 'command' && !point) { return; }

    obj.coordinates = { x: x, y: y };

    if (point) {
      obj.target = point;
    } else {

    };
  };

  $scope.resolveAction = function ($event, point) {
    var x   = $event.offsetX,
        y   = $event.offsetY,
        obj = $scope.targetObject;

    if (!obj.coordinates.x || !obj.coordinates.y) {
      return false;
    }

    if (obj.target && $event.shiftKey) {
      obj.target.dragging = false;
      removePoint(obj.target);
      resetTargetObject();
    } else if (obj.target) {
      obj.target.dragging = false;
      resetTargetObject();
    } else {
      addPoint(obj.coordinates);
      resetTargetObject();
    };
  };

  $scope.determineDrag = function ($event) {
    var x   = $event.offsetX,
        y   = $event.offsetY,
        obj = $scope.targetObject;

    if (obj.target) {
      obj.target.dragging = true;
      obj.target.x = x;
      obj.target.y = y;
    }
  }

  $scope.circleClass = function (point) {
    var i = $scope.points.indexOf(point);
    var result = "";

    if (i === 0 || i === $scope.points.length - 1) {
      result += "end ";
    }

    if (point.dragging) { result += "dragging "; }

    return result;
  }

  var resetTargetObject = function () {
    $scope.targetObject = {
      target: undefined,
      coordinates: {
        x: undefined,
        y: undefined
      }
    }
  }

  var removePoint = function (point) {
    var i = $scope.points.indexOf(point);
    $scope.points.splice(i, 1);
    updatePathPairs();
  };

  var addPoint = function (point) {
    $scope.points.push(point);
    updatePathPairs();
  };

  resetTargetObject();
});
