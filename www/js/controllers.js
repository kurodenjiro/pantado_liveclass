angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  
  $ionicModal.fromTemplateUrl('templates/loading.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loadingModal = modal;
  });
  
  $scope.checkIsLogined = function() {
	  return localStorage.getItem('userLogined') === '1';
  };
  
  $scope.getUsername = function() {
	  return localStorage.getItem('username');
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
	var username = $scope.loginData.username;
	var password = $scope.loginData.password;
	$scope.loadingModal.show();
	$http({
		  method: 'GET',
		  url: 'https://pantado.edu.vn/api/user/login.php?'+encodeQueryData($scope.loginData)		  
	  }).then(function(resp) {
		  setTimeout(function() {
			  $scope.loadingModal.hide();
			  for(var name in resp.data) {
				  $scope[name] = resp.data[name];
			  }
			  if($scope.success) {
				  localStorage.setItem('userLogined', '1');
				  localStorage.setItem('username', username);
				$state.go('app.playlists');
			  } else {
				  localStorage.setItem('userLogined', '0');
				  localStorage.setItem('username', '');
			  }
		  }, 500);
		  
	  });
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  $scope.doLogout = function() {
	  localStorage.setItem('userLogined', '0');
	  $state.go('app.login');
  };
})

.controller('PlaylistsCtrl', function($scope, $stateParams, $state, $http) {
  
  $http.get("https://pantado.edu.vn/api/category/list.php").then(function(response) {
        $scope.playlists = response.data;
    });
  
  $scope.$on('$ionicView.enter', function(e) {
		check_access($state);
	});
})

.controller('PlaylistCtrl', function($scope, $stateParams, $state, $http, $sceDelegate, $sce) {
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	  }
	
	$http.get("https://pantado.edu.vn/api/category/list.php").then(function(response) {
        $scope.playlists = response.data;
    });
	
	var playlistId = $stateParams.playlistId;
	$scope.playlistId = playlistId;
	$http.get("https://pantado.edu.vn/api/category/lecture/list.php?categoryId=" + playlistId).then(function(response) {
        $scope.lectures = response.data;
    });
	
	$scope.$on('$ionicView.enter', function(e) {
		check_access($state);
	});
	
})
.controller('LectureCtrl', function($scope, $stateParams, $state, $http, $sceDelegate, $sce) {
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	  }
	 
	$http.get("https://pantado.edu.vn/api/category/list.php").then(function(response) {
        $scope.playlists = response.data;
    });
	
	$scope.lecture = {};
	var playlistId = $stateParams.playlistId;
	var lectureId = $stateParams.lectureId;
	$scope.playlistId = playlistId;
	$scope.lectureId = lectureId;
	$http.get("https://pantado.edu.vn/api/category/lecture/detail.php?categoryId=" + playlistId+'&lectureId=' + lectureId).then(function(response) {
		$scope.lecture = response.data;
		var youtubeId = $scope.lecture.url.split('=').pop();
		$scope.lecture.youtubeId = youtubeId;
		$scope.lecture.embedUrl = 'https://www.youtube.com/embed/' + youtubeId;
		
    });
	
	$scope.$on('$ionicView.enter', function(e) {
		check_access($state);
	});
});



function check_access($state) {
	if('1' === localStorage.getItem('userLogined')) {
		// đã login
	} else {
		$state.go('app.login');
	}
}

function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}