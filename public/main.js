(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function (e) {
        var el = document.querySelector('[ng-worker-app]');
        MainThread.upgradeElement(el, './unminified.worker.js');
    });

}());
