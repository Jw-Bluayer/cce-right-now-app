angular.module('app.services', ['ngCookies', 'ngResource'])

.constant('HostSettings', {
	host: 'http://127.0.0.1:5000',
	api: 'http://127.0.0.1:5000/api'
	// host: 'http://52.34.113.35:5000',
	// api: 'http://52.34.113.35:5000/api'
})

.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.withCredentials = true;
}])

.run(['$http', '$cookies', function($http, $cookies) {
	$http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}])

.provider('myCSRF',[function(){
  var headerName = 'X-CSRFToken';
  var cookieName = 'csrftoken';
  var allowedMethods = ['GET'];

  this.setHeaderName = function(n) {
    headerName = n;
  }
  this.setCookieName = function(n) {
    cookieName = n;
  }
  this.setAllowedMethods = function(n) {
    allowedMethods = n;
  }
  this.$get = ['$cookies', function($cookies){
    return {
      'request': function(config) {
        if(allowedMethods.indexOf(config.method) === -1) {
          // do something on success
          config.headers[headerName] = $cookies[cookieName];
        }
        return config;
      }
    }
  }];
}]).config(function($httpProvider) {
  $httpProvider.interceptors.push('myCSRF');
})

.service('AccountService', function($http, $timeout, HostSettings) {
	return {
		host: HostSettings.host,
		getUser: function() {
			return $http.get(this.host+'/current-user').then(function(res) {
				if (res.status == 200 && res.data.isAuthenticated && res.data.id && res.data.name) {
					return res.data;
				} else {
					return {isAuthenticated: false};
				}
			}, function(res) {
				console.log("Failed to get user: ", res);
				return {isAuthenticated: false};
			});
		},
		loginUser: function(userdata) {
			$this = this;
			return $http.post(this.host+'/login', userdata).then(function(res) {
				return $this.getUser();
			}, function(res) {
				console.log("Failed to login: ", res);
				return {isAuthenticated: false};
			});
		},
		signupUser: function(userdata) {
			$this = this;
			return $http.post(this.host+'/api/user', userdata).then(function (res) {
				if (res.status == 201) {
					return $this.loginUser({
						id: userdata.id,
						password: userdata.password
					});
				}
			}, function (res) {
				console.log("Failed to singup: ", res);
				return {isAuthenticated: false};
			});
		},
		logoutUser: function() {
			return $http.get(this.host+'/logout').then(function(res) {
				return true;
			}, function(res) {
				return false;
			});
		}
	};
})

.factory('PostAPI', function($resource, HostSettings) {
	return $resource(HostSettings.api+"/post/:postId", {postId: '@postId'}, {
		'getComment': {
			method: 'GET',
			url: HostSettings.api+"/comment",
			params: {q: '@q'}
		},
		'postComment': {
			method: 'POST',
			url: HostSettings.api+"/comment"
		}
	});
})

.service('PostModal', function($ionicModal, $ionicPopup, $rootScope, AccountService, PostAPI) {
	var $scope = $rootScope.$new();

	AccountService.getUser().then(function(res) {
		$scope.user = res;
	});

	$ionicModal.fromTemplateUrl('templates/post-modal.html', {
		scope: $scope,
		focusFirstInput: true
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.postData = {};
		$scope.modal.hide();
	};

	$scope.feed = undefined;
	$scope.postData = {};
	$scope.addPhoto = function($event) {
		$event.preventDefault();
	};
	$scope.addPeople = function($event) {
		$event.preventDefault();
	};

	$scope.doPost = function() {
		if (!$scope.postData.content || $scope.postData.content.length > 120) {
			$ionicPopup.alert({
				title: "Content length must be less than or equal to 120!",
				okType: "assertive"
			});
			return;
		}

		new PostAPI($scope.postData).$save(function(res) {
			if ($scope.feed) {
				$scope.feed.update();
			}
			$scope.closeModal();
		}, function(res) {
			$ionicPopup.alert({
				title: "Failed to post. Try agin.",
				okType: "assertive"
			});
		});
	};

	return {
		openModal: function(feed) {
			$scope.feed = feed;
			$scope.openModal();
		},
		closeModal: function() {
			$scope.closeModal();
		}
	};
})