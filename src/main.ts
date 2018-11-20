declare var MainThread: any;



document.addEventListener('DOMContentLoaded', e => {
	const el = document.querySelector('[ng-worker-app]');
	MainThread.upgradeElement(el, './unminified.worker.js');
})
