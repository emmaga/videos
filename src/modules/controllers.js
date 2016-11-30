'use strict';

(function() {
    var app = angular.module('app.controllers', [])

    .controller('indexController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                this.maskUrl = '';
            }
        }
    ])

    .controller('loginController', ['$scope', '$http', '$filter', '$state', 'md5', 'util',
        function($scope, $http, $filter, $state, md5, util) {
            var self = this;
            self.init = function() {

            }

            self.login = function () {
                // 以后改为在登录后调用
                self.getEditLangs();
                /*self.loading = true;
                var data = JSON.stringify({
                    action: "GetToken",
                    projectName: self.projectName,
                    username: self.userName,
                    password: md5.createHash(self.password)
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('logon', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        util.setParams('userName', self.userName);
                        util.setParams('token', msg.token);
                        self.getEditLangs();
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });*/
            }
            self.getEditLangs = function() {
                $http({
                    method: 'GET',
                    url: util.getApiUrl('', 'editLangs.json', 'local')
                }).then(function successCallback(response) {
                    util.setParams('editLangs', response.data.editLangs);
                    $state.go('app');
                }, function errorCallback(response) {

                });
            }

        }
    ])

    .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {

                // 上传页面加载页面url
                self.uploadListUrl = '';

                // 不显示上传页面
                self.showUploadList = false;

                // 显示上传页面
                self.gotoPage('uploadList');

                // 弹窗层
                self.maskUrl = '';
                self.maskParams = {};

            }

            self.gotoPage = function(pageName) {
                // 上传列表页
                if(pageName == 'uploadList') {
                    // 上传页面不是第一次加载
                    if(self.uploadListUrl !== '') {

                    }
                    // 第一次加载上传页面
                    else {
                        self.uploadListUrl = 'pages/uploadList.html';
                    }
                    self.showUploadList = true;
                }

                //其他页
                else {
                    self.showUploadList = false;
                    $state.go(pageName);
                }
                

            }

            self.logout = function(event) {
                util.setParams('token', '');
                $state.go('login');
            }

        }
    ])

    .controller('uploadListController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {
                // 隐藏上传列表
                $scope.app.showUploadList = false;
            }

            self.add = function() {
                $scope.app.maskUrl = "pages/addMovie.html";
            }
        }
    ])

    .controller('transcodingListController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {
                // 隐藏上传列表
                $scope.app.showUploadList = false;
            }
        }
    ])

    .controller('notEditedListController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {
                // 隐藏上传列表
                $scope.app.showUploadList = false;
            }

            self.add = function() {
                $scope.app.maskUrl = "pages/addMovieInfo.html";
                $scope.app.maskParams = {};
            }
        }
    ])

    .controller('editedListController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {

            }
            self.edit = function() {
                $scope.app.maskUrl = "pages/editMovieInfo.html";
                $scope.app.maskParams = {};
            }
        }
    ])

    .controller('addMovieController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {

            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
        }
    ])

    .controller('addMovieInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {

            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
        }
    ])  

    .controller('editMovieInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {

            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
        }
    ])    
    
})();
