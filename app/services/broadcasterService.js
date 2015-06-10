
/*jslint browser: true, devel: true*/
/*global amplitude*/

amplitude.factory('broadcasterService', ['$rootScope', 'windowService', function ($rootScope, windowService) {
    'use strict';


    return {
        'broadcast': function (event) {
            var children = windowService.getChildren(),
                i,
                scope,
                win;

            for (i = 0; i < children.length; i += 1) {
                win = children[i];
                scope = win.angular && win.angular.element(win.document.querySelector('html')).scope();
                if (scope) {
                    scope.$broadcast(event);
                }
            }

            $rootScope.$broadcast(event);
        }
    };

}]);