
/*jslint browser: true*/
/*global angular, amplitude, Timer, Range*/

(function () {

    'use strict';

    amplitude.directive("slider", function () {

        return {
            restrict: 'E',
            templateUrl: 'slider.tpl.html',
            scope: {
                model: '=ngModel'
            },
            'link': function ($scope, $element) {
                var element = $element[0].querySelector('.slider'),
                    handle = $element[0].querySelector('.handle'),
                    line = $element[0].querySelector('.line'),
                    orientation = 'horizontal',
                    setWhileSliding = 1,
                    stickTo = null,
                    stickToRange = null,
                    range = new Range(),
                    timer = new Timer(10),
                    currentInstance = null,
                    mouseX = null,
                    moving = 0,
                    disabled = 0;

                function getValue() {
                    return range.getValue();
                }

                function getMinimum() {
                    return range.getMinimum();
                }

                function getMaximum() {
                    return range.getMaximum();
                }

                function recalculate() {
                    var w = element.offsetWidth,
                        h = element.offsetHeight,
                        hw = handle.offsetWidth,
                        hh = handle.offsetHeight,
                        lh = line.offsetHeight;

                    if (orientation === "horizontal") {
                        handle.style.left = (w - hw) * (getValue() - getMinimum()) /
                            (getMaximum() - getMinimum()) + "px";
                        handle.style.top = (h - hh) / 2 + "px";
                        line.style.top = (h - lh) / 2 + "px";
                        line.style.left = 0;
                        line.style.width = (w - 2) + "px";
                        line.children[0].style.width = (w - 4) + "px";
                    }
                }

                function onchange(sender) {
                    $scope.model.value = getValue();
                    if ($scope.model.onchange) {
                        $scope.model.onchange(sender);
                    }
                    recalculate();
                }

                function setValue(v) {
                    var mr, mx;
                    if (stickTo !== null && stickToRange !== null) {
                        mr = stickTo - stickToRange;
                        mx = stickTo + stickToRange;
                        if (v < mr || v > mx) {
                            range.setValue(v);
                        } else {
                            range.setValue(stickTo);
                            onchange();
                        }
                    } else {
                        range.setValue(v);
                    }
                }

                function setMaximum(v) {
                    return range.setMaximum(v);
                }

                function ontimer() {

                    if (orientation === "horizontal") {
                        if (!disabled) {
                            setValue(((mouseX -
                                line.children[0].getBoundingClientRect().left -
                                element.ownerDocument.defaultView.pageXOffset +
                                element.ownerDocument.documentElement.clientLeft) / line.children[0].offsetWidth) * getMaximum());

                            onchange({
                                "mouse": 0
                            });
                        }
                    }

                    timer.start();
                }

                function onmousemove(e) {
                    if (currentInstance !== null) {
                        mouseX = e.pageX;
                    }
                }

                function onmouseup() {
                    element.ownerDocument.removeEventListener("mousemove", onmousemove, true);
                    element.ownerDocument.removeEventListener("mouseup", onmouseup, true);
                    timer.stop();
                    onchange({
                        "mouse": 1
                    });
                    moving = 0;
                    currentInstance = null;
                }

                function onmousedown(e) {
                    moving = 1;
                    currentInstance = this;
                    element.ownerDocument.addEventListener("mousemove", onmousemove, true);
                    element.ownerDocument.addEventListener("mouseup", onmouseup, true);
                    mouseX = e.pageX;
                    ontimer();
                }

                range.setExtent(0);

                range.onchange = function () {
                    recalculate();
                    onchange();
                };

                timer.ontimer = function () {
                    ontimer();
                };

                element.onmousedown = onmousedown;

                $scope.$watch('model.background', function (background) {
                    line.children[0].style.background = background;
                });

                $scope.$watch('model.value', function (value) {
                    if (setWhileSliding || !moving) {
                        setValue(value);
                    }
                });

                $scope.$watch('model.max', function (max) {
                    setMaximum(max);
                });

                $scope.$watch('model.setWhileSliding', function ($setWhileSliding) {
                    if (!$setWhileSliding && $setWhileSliding !== 0) {
                        return;
                    }
                    setWhileSliding = $setWhileSliding;
                });

                $scope.$watch('model.stickTo', function ($stickTo) {
                    if (!$stickTo) {
                        return;
                    }
                    stickTo = $stickTo[0];
                    stickToRange = $stickTo[1];
                });

                $scope.$watch('model.disabled', function ($disabled) {
                    if (!$disabled && $disabled !== 0) {
                        return;
                    }
                    if ($disabled) {
                        handle.style.visibility = 'hidden';
                        disabled = 1;
                    } else {
                        handle.style.visibility = 'visible';
                        disabled = 0;
                    }
                    setValue(0);
                });

            }
        };
    });
}());