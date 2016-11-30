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

    .controller('loginController', ['$scope', '$http', '$state', '$filter', 'md5', 'util',
        function($scope, $http, $state, $filter, md5, util) {
            console.log('loginController')
            var self = this;
            self.init = function() {

            }
            
            self.login = function () {
                self.loading = true;
                var data = JSON.stringify({
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
                                console.log(msg.token)
                                util.setParams('token', msg.token);
                                self.getEditLangs();
                            } else if (msg.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login')
                            } else {
                                alert(msg.rescode + ' ' + msg.errInfo);
                            }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }
            // 
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
            console.log('appController')
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
            console.log('transcodingListController')
            console.log($state.current.name)
            var self = this;
            self.init = function() {
                // 隐藏上传列表
                $scope.app.showUploadList = false;
                self.getTranscodeTaskList();
            }

            //  获取正在转码的列表
            self.getTranscodeTaskList = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTranscodeTaskList",
                    "status": "working"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tanscodetask', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.taskList.length == 0) {
                            self.noData = true;
                            return;
                        }
                        self.taskList  = msg.data.taskList ;
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            // 刷新当前state
            self.refresh = function(){
                $state.reload('app.transcodingList');
            }
        }
    ])

    .controller('notEditedListController', ['$http', '$scope', '$state', '$stateParams', 'util', 
        function($http, $scope, $state, $stateParams, util) {
            console.log('notEditedListController')
            var self = this;
            self.init = function() {
                // 隐藏上传列表
                $scope.app.showUploadList = false;
                self.getTranscodeTaskList();
            }

            self.add = function(task) {
                $scope.app.maskUrl = "pages/addMovieInfo.html";
                $scope.app.maskParams = {taskID:task.ID,URL_ABS:task.URL,MovieSize:task.Size,Duration:task.Duration};
            }
            // 获取转码完成的列表
            self.getTranscodeTaskList = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTranscodeTaskList",
                    "status": "Completed"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tanscodetask', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.taskList.length == 0) {
                            self.noData = true;
                            return;
                        }
                        self.taskList  = msg.data.taskList ;
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
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
            console.log('addMovieController')
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
            console.log('addMovieInfoController')
            console.log($scope.app.maskParams)
            var self = this;
            self.init = function() {
                self.getTags();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 获取 电影的 分类 产地
            self.getTags = function () {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTags"
                    // "lang": "zh-CN"
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                      // 字段 错误
                      // recode --> recode
                    if (msg.recode == '200') {
                        if (msg.CategoryList.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.CategoryList;
                        }
                        if (msg.LocationList.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.LocationList;
                        }
                    } else if (msg.recode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.recode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            // 电影入库
            self.addMovie = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "addMovie",
                    "lang": "zh-CN",
                    "taskID": 1,
                    "Movie": {
                        "Seq": 20,
                        "Name": {
                            "zh-CN": "哈利波特"
                        },
                        "Actor": {
                            "zh-CN": "罗琳"
                        },
                        "Director": {
                            "zh-CN": "罗琳"
                        },
                        "URL_ABS": "http://movies.clearidc.com/c4ca4238a0b923820dcc509a6f75849b_148014890146_transcoded.mp4",
                        "MovieSize": 1822211,
                        "Duration": 10,
                        "Score": 9.7,
                        "SearchName": "A",
                        "Year": "2016",
                        "Price": 9.9,
                        "Introduce": {
                            "zh-CN": "好看"
                        },
                        "PicURL_ABS": "http://movies.clearidc.com/c4ca4238a0b923820dcc509a6f75849b_148014890146_transcoded.jpg"
                    },
                    "Category": [
                        1,
                        2
                    ],
                    "Location": []
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tanscodetask', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.taskList.length == 0) {
                            self.noData = true;
                        }
                        self.taskList  = msg.data.taskList ;
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
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
