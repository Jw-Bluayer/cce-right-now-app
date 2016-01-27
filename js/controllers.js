angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicPopup, AccountService) {

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});
	
	$scope.doLogout = function() {
		AccountService.logoutUser().then(function(res) {
			if (res.isAuthenticated) {
				$ionicPopup.alert({
					title: "Failed to logout",
					okType: "assertive"
				});
			} else {
				$state.go('logNav.login');
			}
		})
	}
})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, $ionicPopup, AccountService) {
	$ionicLoading.show();
	AccountService.getUser().then(function(res) {
		if(res.isAuthenticated) {
			$state.go('app.newsfeed');
		}
		$ionicLoading.hide();
	});

	// Form data for the login modal
	$scope.loginData = {};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		// Validation
		if (!$scope.loginData.id) {
			$ionicPopup.alert({
				title: "Enter your ID",
				okType: "assertive"
			});
			return;
		}
		if (!$scope.loginData.password) {
			$ionicPopup.alert({
				title: "Enter your password",
				okType: "assertive"
			});
			return;
		}

		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		$ionicLoading.show();
		AccountService.loginUser($scope.loginData).then(function(res) {
			if (res.isAuthenticated) {
				$state.go('app.newsfeed');
				$ionicLoading.hide();
			} else {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: "The password you entered is incorrect.",
					okType: "assertive"
				});
			}
		})
	};
})

.controller('SignupCtrl', function($scope, $state, $ionicLoading, $ionicPopup, AccountService) {
	$scope.signupData = {};

	$scope.doSignup = function() {
		// Validation
		if (!$scope.signupData.id) {
			$ionicPopup.alert({
				title: "Enter your ID",
				okType: "assertive"
			});
			return;
		}
		if (!$scope.signupData.name) {
			$ionicPopup.alert({
				title: "Enter your name",
				okType: "assertive"
			});
			return;
		}
		if (!$scope.signupData.password) {
			$ionicPopup.alert({
				title: "Enter your password",
				okType: "assertive"
			});
			return;
		}
		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		$ionicLoading.show();
		AccountService.signupUser($scope.signupData).then(function(res) {
			if (res.isAuthenticated) {
				$state.go('app.newsfeed');
				$ionicLoading.hide();
			} else {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: "The ID already exists.",
					okType: "assertive"
				});
			}
		})
	};
})

.controller('NewsfeedCtrl', function($scope, $ionicPopup, PostModal, AccountService, PostAPI) {
	AccountService.getUser().then(function(res) {
		$scope.user = res;
	});

	$scope.openPostModal = function() {
		PostModal.openModal({
			update: $scope.updateFeed
		});
	};

	$scope.canLoadMoreFeed = true;
	$scope.posts = [];
	$scope.updateFeed = function() {
		PostAPI.get({
			q: {
				order_by: [{
					field: 'id',
					direction: 'desc'
				}]
			}
		}, function(res) {
			$scope.posts = res.objects;
			$scope.canLoadMoreFeed = true;
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.loadMoreFeed = function() {
		PostAPI.get({
			q: {
				filters: [{
					name: 'id',
					op: '<',
					val: ($scope.posts.length) ? $scope.posts[$scope.posts.length-1].id : 0
				}],
				order_by: [{
					field: 'id',
					direction: 'desc'
				}]
			}
		}, function(res) {
			$scope.posts = $scope.posts.concat(res.objects);
			if ($scope.posts.length < 1) {
				$scope.updateFeed();
			} else if (res.num_results == 0) {
				$scope.canLoadMoreFeed = false;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
})
