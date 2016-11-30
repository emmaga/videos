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


    .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $stateParams, util, CONFIG) {
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

                // 初始化上传列表对象
                self.uploadList = new UploadLists();


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

            self.upload = function() {
                self.maskUrl = "pages/addMovie.html";
            }

            function UploadLists() {
                this.data = [
                    /*{
                        "id":0, 
                        "video":{
                            "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                        },
                        "subtitle":{
                            "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                        }
                    }*/
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(video, subtitle) {
                    this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                    return this.maxId++;
                },
                setPercentById: function(type, id, percentComplete) {
                    for(var i =0; i < this.data.length; i++) {
                        if(this.data[i].id == id) {
                            this.data[i][type].percentComplete = percentComplete;
                            break;
                        }
                    }
                },
                setSrcSizeById: function(type, id, src, size) {
                    for(var i =0; i < this.data.length; i++) {
                        if(this.data[i].id == id) {
                            this.data[i][type].src = src;
                            this.data[i][type].size = size;
                            break;
                        }
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 视频
                            if(l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 字幕
                            if(l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                l[i].subtitle.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                judgeCompleted: function(id, o){
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果视频和字幕都上传完毕
                            if((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) || 
                                (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                o.transcode(id, o);
                            }
                            break;
                        }
                    }
                },
                transcode: function(id, o) {
                    var o = o;
                    var id = id;
                    var l = this.data;
                    var source = {};
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            source = l[i];
                            break;
                        }
                    }
                    // 转码
                    var data = JSON.stringify({
                        "action": "submitTranscodeTask",
                        "token": util.getParams('token'),
                        "rescode": "200",
                        "data": {
                            "movie": {
                                "oriFileName": source.video.name,
                                "filePath": source.video.src
                            },
                            "subtitle": {
                                "oriFileName": source.subtitle.name,
                                "filePath": source.subtitle.src
                            }
                        }
                    })
                    console&&console.log(data);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('tanscodetask', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            console&&console.log('转码 ' + id);
                            // 从列表中删除
                            o.deleteById(id);
                        } 
                        else if(msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            // 转码申请失败后再次调用
                            console&&console.log('转码申请失败后再次调用');
                            setTimeout(function() {
                                o.transcode(id, o);
                            },5000);
                            
                        }
                    }, function errorCallback(response) {
                        // 转码申请失败后再次调用
                        console&&console.log('转码申请失败后再次调用');
                        console&&console.log(response);
                        setTimeout(function() {
                            o.transcode(id, o);
                        },5000);
                    });
                },
                uploadFile: function(videoFile, subtitleFile, o) {
                    
                    // 上传后台地址
                    var uploadUrl = CONFIG.uploadVideoUrl;

                    // 电影对象
                    var videoXhr = new XMLHttpRequest();
                    var video = {"name": videoFile.name, "size":videoFile.size, "percentComplete": 0, "xhr": videoXhr};
                    
                    // 字幕对象
                    var subtitle = {};
                    if(subtitleFile) {
                        var subtitleXhr = new XMLHttpRequest();
                        subtitle = {"name": subtitleFile.name, "size":subtitleFile.size, "percentComplete": 0, "xhr": subtitleXhr};
                    }
                    
                    // 添加data，并获取id
                    var id = this.add(video, subtitle);

                    // 上传视频
                    util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                          $scope.$apply(function(){
                            if (evt.lengthComputable) {
                              var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                              // 更新上传进度
                              o.setPercentById('video', id, percentComplete);
                            }
                          });
                        },
                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('video', id, ret.filePath, ret.size);
                              o.judgeCompleted(id, o);
                            });
                        },
                        // 上传失败
                        function(xhr) {
                            $scope.$apply(function(){
                              o.setPercentById('video', id, '失败');
                            });
                            xhr.abort();
                        }
                    );

                    // 上传字幕
                    if(subtitle.percentComplete != undefined) {
                        util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                            // 上传中
                            function(evt) {
                              $scope.$apply(function(){
                                if (evt.lengthComputable) {
                                  var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                  // 更新上传进度
                                  o.setPercentById('subtitle', id, percentComplete);
                                }
                              });
                            },
                            // 上传成功
                            function(xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function(){
                                  o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                  o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function(xhr) {
                                $scope.$apply(function(){
                                  o.setPercentById('subtitle', id, '失败');
                                });
                                xhr.abort();
                            }
                        );
                    }
                }
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


            self.add = function() {
                $scope.app.uploadList.uploadFile($scope.myFileMovie, $scope.myFileSubtitle, $scope.app.uploadList);
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
