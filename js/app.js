angular.module('app', ['ionic','pascalprecht.translate','app.controllers','app.services'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('logNav', {
			url: '/logNav',
			abstract: true,
			templateUrl: 'templates/login-nav.html'
		})

		.state('logNav.login', {
			url: '/login',
			views: {
				'logNav': {
					templateUrl: 'templates/login.html',
					controller: 'LoginCtrl'
				}
			}
		})

		.state('logNav.signup', {
			url: '/signup',
			views: {
				'logNav': {
					templateUrl: 'templates/signup.html',
					controller: 'SignupCtrl'
				}
			}
		})

		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'templates/menu.html',
			controller: 'AppCtrl'
		})

		.state('app.newsfeed', {
			url: '/newsfeed',
			views: {
				'tab-newsfeed': {
					templateUrl: 'templates/newsfeed.html',
					controller: 'NewsfeedCtrl'
				}
			}
		})
		.state('app.newsfeed-post', {
			url: '/post/:postId',
			views: {
				'tab-newsfeed': {
					templateUrl: 'templates/post.html',
					controller: 'PostCtrl'
				}
			}
		})

		.state('app.now', {
			url: '/now',
			views: {
				'tab-now': {
					templateUrl: 'templates/now.html'
				}
			}
		})
		.state('app.now-post', {
			url: '/post/:postId',
			views: {
				'tab-now': {
					templateUrl: 'templates/post.html',
					controller: 'PostCtrl'
				}
			}
		})

		.state('app.notifications', {
			url: '/notifications',
			views: {
				'tab-notifications': {
					templateUrl: 'templates/notifications.html',
					controller: 'NotificationsCtrl'
				}
			}
		})
		.state('app.notifications-post', {
			url: '/post/:postId',
			views: {
				'tab-notifications': {
					templateUrl: 'templates/post.html',
					controller: 'PostCtrl'
				}
			}
		})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/logNav/login');
})

.config(['$translateProvider', function ($translateProvider) {
	$translateProvider.useStaticFilesLoader({
		prefix: '/locale/locale-',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('en');
}]);