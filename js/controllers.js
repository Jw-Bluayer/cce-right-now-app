angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $state, $translate, $ionicPopup, AccountService) {

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	// $scope.$on('$ionicView.enter', function(e) {
	// });
	
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
		});
	};

	$scope.changeLanguage = function(langKey) {
		$translate.use(langKey);
	};
})

.controller('LoginCtrl', function($scope, $state, $translate, $ionicLoading, $ionicPopup, AccountService) {
	$scope.$on('$ionicView.beforeEnter', function(e) {
		$ionicLoading.show();
		AccountService.getUser().then(function(res) {
			if(res.isAuthenticated) {
				$state.go('app.newsfeed');
			}
			$ionicLoading.hide();
		});
	});

	$translate(['ENTER_ID','ENTER_PASSWORD','INCORRECT_PASSWORD']).then(function(translations) {
		$scope.i = translations;
	});

	// Form data for the login modal
	$scope.loginData = {};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		// Validation
		if (!$scope.loginData.id) {
			$ionicPopup.alert({
				title: $scope.i.ENTER_ID,
				okType: "assertive"
			});
			return;
		}
		if (!$scope.loginData.password) {
			$ionicPopup.alert({
				title: $scope.i.ENTER_PASSWORD,
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
					title: $scope.i.INCORRECT_PASSWORD,
					okType: "assertive"
				});
			}
		})
	};
})

.controller('SignupCtrl', function($scope, $state, $translate, $ionicLoading, $ionicPopup, AccountService) {
	$translate(['ENTER_ID','ENTER_PASSWORD','ENTER_NAME','ID_EXISTS']).then(function(translations) {
		$scope.i = translations;
	});

	$scope.signupData = {};
	$scope.doSignup = function() {
		// Validation
		if (!$scope.signupData.id) {
			$ionicPopup.alert({
				title: $scope.i.ENTER_ID,
				okType: "assertive"
			});
			return;
		}
		if (!$scope.signupData.name) {
			$ionicPopup.alert({
				title: $scope.i.ENTER_NAME,
				okType: "assertive"
			});
			return;
		}
		if (!$scope.signupData.password) {
			$ionicPopup.alert({
				title: $scope.i.ENTER_PASSWORD,
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
					title: $scope.i.ID_EXISTS,
					okType: "assertive"
				});
			}
		})
	};
})

.controller('NewsfeedCtrl', function($scope, $state, $ionicPopup, PostModal, AccountService, PostAPI, WhoAreYouActionSheet) {
	AccountService.watchCurrentUser(function(user) {
		$scope.user = user;
		$scope.updateFeed();
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
			} else if (res.num_results == 0 || res.page == res.total_pages) {
				$scope.canLoadMoreFeed = false;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	$scope.showActionSheet = function(id) {
		WhoAreYouActionSheet.showActionSheet(id);
	};
})

.controller('NotificationsCtrl', function($scope, AccountService, NotificationAPI) {
	AccountService.watchCurrentUser(function(user) {
		$scope.updateNotifications();
	});

	$scope.notifications = [];

	$scope.updateNotifications = function() {
		NotificationAPI.get(function(res) {
			$scope.notifications = res.objects;
			$scope.createNotificationContents();
			console.log($scope.notifications);
		});
	};
	$scope.createNotificationContents = function() {
		for (var i = 0; i < $scope.notifications.length; i++) {
			var noti = $scope.notifications[i];
			switch(noti.type) {
				case "CommentTagNotification":
					noti.content = "<b>@"+noti.who+"</b> mentioned you in a comment.";
					break;
			}
		};
	};
	$scope.notificationClicked = function(notiObj) {
		// NotificationEngine.inListClicked(notiObj);
		console.log(notiObj);
	};
})

.controller('PostCtrl', function($scope, $stateParams, $ionicPopup, WhoAreYouActionSheet, PostAPI) {
	$scope.commentData = {};
	$scope.post = {};
	$scope.$on('$ionicView.beforeEnter', function(e) {
		PostAPI.get({postId: $stateParams.postId}, function(res) {
			$scope.post = res;
			$scope.commentData.post_id = res.id;
		});
		$scope.updateComment();
	});

	$scope.doComment = function() {
		if (!$scope.commentData.post_id || !$scope.commentData.content) {
			$ionicPopup.alert({
				title: "Write some comment before to send!",
				okType: "assertive"
			});
			return;
		}

		PostAPI.postComment($scope.commentData, function(res) {
			$scope.commentData.content = undefined;
			$scope.updateComment();
		}, function(res) {
			$ionicPopup.alert({
				title: "Failed to post. Try agin.",
				okType: "assertive"
			});
		});
	};

	$scope.updateComment = function() {
		PostAPI.getComment({
			q: {
				filters: [{
					name: 'post_id',
					op: '==',
					val: $stateParams.postId
				}],
				order_by: [{
					field: 'id',
					direction: 'desc'
				}]
			}
		}, function(res) {
			$scope.post.comments = res.objects;
			if (res.num_results == 0 || res.page == res.total_pages) {
				$scope.canLoadMoreComment = false;
			} else {
				$scope.canLoadMoreComment = true;
			}
		});
	};

	$scope.canLoadMoreComment = true;
	$scope.loadMoreComment = function() {
		$scope.isLoadingComment = true;
		PostAPI.getComment({
			q: {
				filters: [{
					name: 'post_id',
					op: '==',
					val: $stateParams.postId
				},{
					name: 'id',
					op: '<',
					val: ($scope.post.comments.length) ? $scope.post.comments[$scope.post.comments.length-1].id : 0
				}],
				order_by: [{
					field: 'id',
					direction: 'desc'
				}]
			}
		}, function(res) {
			$scope.post.comments = $scope.post.comments.concat(res.objects);
			if (res.num_results == 0 || res.page == res.total_pages) {
				$scope.canLoadMoreComment = false;
			}
			$scope.isLoadingComment = false;
		});
	};

	$scope.showActionSheet = function(id) {
		WhoAreYouActionSheet.showActionSheet(id);
	};
})