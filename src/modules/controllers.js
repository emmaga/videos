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
                                util.setParams('token', msg.token);
                                self.getEditLangs();
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
                self.defaultLang = util.getDefaultLangCode();
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
                self.getVideosList();
                self.getList();
                self.getMovieTopicList();
                self.getTVSeriesList();
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
            
            self.goTOMusicLibrary = function(ID){
                $state.go('app.musicLibrary',{LibID:ID})
            }

            self.goTOVideoLibrary = function(ID,video,LibName){
                $scope.app.LibName = LibName;
                $scope.app.video = (video=='true') ? true : false;
                $scope.$broadcast('videoChanged',$scope.app.video)
                $state.go('app.editedList', {LibID:ID})
            }

            self.goToTVSeriesLibrary = function (ID,LibName) {
                $scope.app.LibName = LibName
                $state.go('app.TVSeriesLibrary', {LibID:ID})
            }

            // 获取音乐库列表
            self.getList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getLibList",
                    "lang": "zh-CN"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('musiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.musicLibList = msg.data;
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
            // 获取视频库列表
            self.getVideosList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getLibList",
                    "lang": "zh-CN"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.videosLibList = msg.data;
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

            // 获取专题大片库列表
            self.getMovieTopicList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTopicLibList"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movietopiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.movieTopciLibList = msg.data;
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
            // 获取电视剧库列表
            self.getTVSeriesList = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getLibList",
                    "lang": "zh-CN"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.TVSeriesLibList = msg.data;
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
            };
            
        
            self.logout = function(event) {
                util.setParams('token', '');
                $state.go('login');
            }

            self.upload = function() {
                self.maskUrl = "pages/addMovie.html";
            }

            function UploadLists() {
                this.data = [];
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
    // 未入库页面
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
                $scope.app.maskParams = task;
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

            // 删除待入库电影
            self.delMovie = function(id){
                 var flag = confirm('确定删除？');
                 if (!flag) {
                    return;
                 }
                 var data = JSON.stringify({
                     "token": util.getParams('token'),
                     "action": "delTranscodeTask",
                     "lang": "zh-CN",
                     "taskID": id
                 })
                 $http({
                     method: 'POST',
                     url: util.getApiUrl('movie', '', 'server'),
                     data: data
                 }).then(function successCallback(response) {
                     var msg = response.data;
                     if (msg.rescode == '200') {
                         alert('删除成功');
                         $state.reload($state.current.name);
                     } else if (msg.rescode == "401") {
                         alert('访问超时，请重新登录');
                         $state.go('login');
                     } else {
                         alert(msg.rescode + ' ' + msg.errInfo);
                     }
                 }, function errorCallback(response) {
                     alert(response.status + ' 服务器出错');
                 }).finally(function(value) {
                 });


            }
        }
    ])

    // 视频库页面
    .controller('editedListController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util', 
        function($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
            console.log('editedListController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                // 选中分类
                $scope.arr = {};
                $scope.arr.categoryArr = [];
                $scope.arr.LocationArr = [];
                self.stateParams = $stateParams;//列表ID
                self.LibName = $scope.app.LibName;//视频库名称
                self.maskParams = $scope.app.maskParams;
                $scope.app.video = undefined ? true : $scope.app.video;
                self.video = $scope.app.video;//视频库判断条件
                self.MovieTopic = !($scope.app.video);//专题大片判断条件
                self.defaultLang = util.getDefaultLangCode();
                self.getLocation();
                self.getCategory();
                self.getMovieList();
            }

            $scope.$on('videoChanged',function(){
                self.video = $scope.app.video;//视频库判断条件
                self.MovieTopic = !($scope.app.video);//专题大片判断条件
                self.getMovieList()
            })

            self.edit = function(movieID) {
                $scope.app.maskUrl = "pages/editMovieInfo.html";
                $scope.app.maskParams = {movieID:movieID,LibID:self.stateParams.LibID};
            }

            // 编辑专题大片库基本信息
            self.editMovieTopicLibInfo = function() {
                $scope.app.maskUrl = "pages/editMovieTopicLibInfo.html";
                $scope.app.maskParams = {LibID: self.stateParams.LibID, LibName: self.LibName};
            }

            //获取电影的Category
            self.getCategory = function() {

                var data = JSON.stringify({
                    "action": "getCategoryList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.data;
                        }
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
                
            //获取电影的Location
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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

            // 搜索条件 电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    $scope.arr.categoryArr.push(id);
                } else {
                    var index = $scope.arr.categoryArr.indexOf(id);
                    $scope.arr.categoryArr.splice(index, 1);
                }
            }

            // 搜索条件 产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    $scope.arr.LocationArr.push(id);
                } else {
                    var index = $scope.arr.LocationArr.indexOf(id);
                    $scope.arr.LocationArr.splice(index, 1);
                }
            }

            // 监听 分类 产地 的变化
            $scope.$watch('arr', function(value) {
                self.getMovieList();
            },true)

            self.searchKeywords = function() {
                self.keywords = self.tempWords
                self.getMovieList()
            }
            // 获取视频库电影列表
            self.getMovieList = function(){
                self.loading = true;
                self.noData = false;
                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 15,
                    url: ''
                }, {
                    counts: [],
                    getData: function (params) {
                        if(self.video == undefined || self.video == true){
                            //视频库
                            var data = {
                                "action": "getList",
                                "token": util.getParams("token"),
                                "keywords": self.keywords,
                                'LibID': Number(self.stateParams.LibID),
                                "LocationID":$scope.arr.LocationArr,
                                "CategoryID":$scope.arr.categoryArr
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count -0;
                            data.page = paramsUrl.page -0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('movielib', '', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if(data.data.data.Total == 0) {
                                    self.noData = true;
                                };
                                params.total(data.data.data.Total);
                                return data.data.data.data;
                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                            
                        } else {
                            //专题大片
                            var data = {
                            "action": "getList",
                            "token": util.getParams("token"),
                            'LibID': Number(self.stateParams.LibID)
                            }
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('movietopiclib', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if(data.data.data.Total == 0) {
                                    self.noData = true;
                                };
                                //专题大片返回数据为字符串，将字符串转换JSON对象
                                for(var i = 0; i < data.data.data.data.length; i++) {
                                    data.data.data.data[i].Actor = JSON.parse(data.data.data.data[i].Actor);
                                    data.data.data.data[i].Director = JSON.parse(data.data.data.data[i].Director);
                                    data.data.data.data[i].Introduce = JSON.parse(data.data.data.data[i].Introduce);
                                    data.data.data.data[i].Name = JSON.parse(data.data.data.data[i].Name);
                                }
                                 params.total(data.data.Total);
                                return data.data.data.data;
                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    }
                });
            }

            self.addMoreMovie = function() {
                $scope.app.maskUrl = self.video ? "pages/addMoreMovie.html" : "pages/addMoreMovieTopic.html";
                $scope.app.maskParams = {LibID:self.stateParams.LibID};
            }

            self.importMovie = function() {
                $scope.app.maskUrl = "pages/addMoreMovieTopic.html";
                $scope.app.maskParams = {LibID:self.stateParams.LibID, type: self.video ? 'video':'topic'};
            }

            // 删除已入库电影
            self.delMovie = function(id,video){
                var flag = confirm('确定删除？');
                if (!flag) {
                    return;
                }

                var movieUrl = video ? 'movielib' : 'movietopiclib';
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "unlink",
                    "ID": id,
                    'LibID':self.stateParams.LibID
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl(movieUrl, '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('删除成功');
                        $state.reload($state.current.name);
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                     alert(response.status + ' 服务器出错');
                }).finally(function(value) {});
            }
        }
    ])
    
    // 上传弹框
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
    
    // 入库弹框
    .controller('addMovieInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 
        function($http, $scope, $state, $stateParams, util, CONFIG) {
            console.log('addMovieInfoController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;//task对象
                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};

                self.videoLibID = [];
                self.movieTopicID = {};

                self.uploadList = new UploadLists();
                self.getCategory();
                self.getLocation();
                self.getVideosList();
                self.getMovieTopicList();
            }
            self.updataSelection = function (checked, ID) {
                var idx = self.videoLibID.indexOf(ID)
                if(checked && idx == -1) {
                    self.videoLibID.push(ID)
                } else if (!checked && idx != -1) {
                    self.videoLibID.splice(idx, 1)
                }
            }
            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            // 获取视频库列表
            self.getVideosList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getLibList",
                    "lang": "zh-CN"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.videosLibList = msg.data;
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

            // 获取专题大片库列表
            self.getMovieTopicList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTopicLibList"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movietopiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    console.log(msg)
                    if (msg.rescode == '200') {
                        self.movieTopciLibList = msg.data;
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

            function UploadLists() {
                this.data = [
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            self.movieInfo.PicSize = ret.size;
                            alert('图片上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }

            //获取电影的Category
            self.getCategory = function () {
                var data = JSON.stringify({
                    "action": "getCategoryList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.data;
                        }
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
            //获取电影的Location
            self.getLocation = function () {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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

            // 编辑电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    self.categoryArr.push(id);
                } else {
                    var index = self.categoryArr.indexOf(id);
                    self.categoryArr.splice(index, 1);
                }
            }

            // 编辑产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    self.LocationArr.push(id);
                } else {
                    var index = self.LocationArr.indexOf(id);
                    self.LocationArr.splice(index, 1);
                }
            }

            // 添加电影入库
            self.addMovie = function () {
                if (self.categoryArr.length == 0) {
                    alert('请选择类型');
                    return;
                }
                if (self.LocationArr.length == 0) {
                    alert('请选择产地');
                    return;
                }
                if (self.uploadList.data.length == 0) {
                    alert('请上传图片');
                    return;
                }
                if (JSON.stringify(self.videoLibID)=='{}') {
                    alert('请选择视频库');
                    return;
                }
                self.saving = true;
                var data = JSON.stringify({
                    "lang": "zh-CN",
                    "Seq": self.movieInfo.Seq,
                    "Price": self.movieInfo.Price,
                    "token": util.getParams('token'),
                    "LibID": self.videoLibID,
                    "action": "add",
                    "TaskID": self.maskParams.ID,
                    "data": {
                        "Category": self.categoryArr,
                        "Name": self.movieInfo.Name,
                        "URL_ABS": self.maskParams.URL,
                        "Actor":self.movieInfo.Actor,
                        "Score": self.movieInfo.Score,
                        "Location": self.LocationArr,
                        "PicSize": self.movieInfo.PicSize - 0,
                        "SearchName": self.movieInfo.SearchName,
                        "PicURL_ABS": self.uploadList.data[0].img.src,
                        "Introduce": self.movieInfo.Introduce,
                        "Director": self.movieInfo.Director,
                        "MovieSize": self.maskParams.Size,
                        "Year": self.movieInfo.Year,
                        "Duration": self.maskParams.Duration, 
                    },
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('添加成功')
                        self.cancel();
                        $state.reload('app.notEditedList')
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }
        }
    ])
    
    // 视频库页面的 添加电影弹框 
    .controller('addMoreMovieController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 
        function($http, $scope, $state, $stateParams, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();

                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};
                self.maskParams = $scope.app.maskParams;
                self.uploadList = new UploadLists();
                self.getLocation();
                self.getCategory();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            function UploadLists() {
                this.data = [
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            self.movieInfo.PicSize = ret.size;
                            alert('图片上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }

            self.getCategory = function() {

                    var data = JSON.stringify({
                        "action": "getCategoryList",
                        "token": util.getParams('token')
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            if (msg.data.length == 0) {
                                self.noCategotyData = true;
                            } else {
                                self.categoryList = msg.data;
                            }
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
                
                //获取电影的Location
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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
            // 编辑电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    self.categoryArr.push(id);
                } else {
                    var index = self.categoryArr.indexOf(id);
                    self.categoryArr.splice(index, 1);
                }
            }

            // 编辑产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    self.LocationArr.push(id);
                } else {
                    var index = self.LocationArr.indexOf(id);
                    self.LocationArr.splice(index, 1);
                }
            }


            // 添加电影入库
            self.addMovie = function () {
                if (self.categoryArr.length == 0) {
                    alert('请选择类型');
                    return;
                }
                if (self.LocationArr.length == 0) {
                    alert('请选择产地');
                    return;
                }
                if (self.uploadList.data.length == 0) {
                    alert('请上传图片');
                    return;
                }
                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "LibID": Number(self.maskParams.LibID),
                    "action": "add",
                    "Seq": self.movieInfo.Seq,
                    "Price": self.movieInfo.Price,
                    "data": {
                        "PicSize": self.uploadList.data[0].img.size,
                        "Name": self.movieInfo.Name,
                        "Actor":self.movieInfo.Actor,
                        "Director": self.movieInfo.Director,
                        "URL_ABS": self.movieInfo.URL_ABS,
                        "MovieSize": self.movieInfo.MovieSize,
                        "Duration": self.movieInfo.Duration,
                        "Score": self.movieInfo.Score,
                        "SearchName": self.movieInfo.SearchName,
                        "Year": self.movieInfo.Year,
                        "Introduce": self.movieInfo.Introduce,
                        "PicURL_ABS": self.uploadList.data[0].img.src,
                        "Category": self.categoryArr,
                        "Location": self.LocationArr
                    },
                    
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                       
                        alert('添加成功')
                        self.cancel();
                        $state.reload('app.notEditedList')
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }
        }
    ]) 
    
    // 添加电视剧弹框
    .controller('addTVSeriesController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 
        function($http, $scope, $state, $stateParams, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                // 电视剧分类和产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.TVSeriesInfo = {};
                self.maskParams = $scope.app.maskParams;
                self.uploadList = new UploadLists();
                self.getLocation();
                self.getCategory();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            function UploadLists() {
                this.data = [
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            self.TVSeriesInfo.PicSize = ret.size;
                            alert('图片上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }

            self.getCategory = function() {

                    var data = JSON.stringify({
                        "action": "getCategoryList",
                        "token": util.getParams('token')
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('tvseries', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            if (msg.data.length == 0) {
                                self.noCategotyData = true;
                            } else {
                                self.categoryList = msg.data;
                            }
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
                
                //获取电影的Location
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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
            // 编辑电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    self.categoryArr.push(id);
                } else {
                    var index = self.categoryArr.indexOf(id);
                    self.categoryArr.splice(index, 1);
                }
            }

            // 编辑产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    self.LocationArr.push(id);
                } else {
                    var index = self.LocationArr.indexOf(id);
                    self.LocationArr.splice(index, 1);
                }
            }
            // 添加电视剧入库
            self.submitAddTV = function () {
                if (self.categoryArr.length == 0) {
                    alert('请选择类型');
                    return;
                }
                if (self.LocationArr.length == 0) {
                    alert('请选择产地');
                    return;
                }
                if (self.uploadList.data.length == 0) {
                    alert('请上传图片');
                    return;
                }
                self.saving = true;
                var data = JSON.stringify({
                    "action": "add",
                    "token": util.getParams('token'),
                    "LibID": Number(self.maskParams.LibID),              
                    "Seq": self.TVSeriesInfo.Seq,
                    "Price": self.TVSeriesInfo.Price.toString(),
                    "data": {
                        "Name": self.TVSeriesInfo.Name,
                        "Director": self.TVSeriesInfo.Director,
                        "ScreenWriter": self.TVSeriesInfo.ScreenWriter,
                        "Actor":self.TVSeriesInfo.Actor,
                        "Introduction": self.TVSeriesInfo.Introduction,
                        "PicURL": self.uploadList.data[0].img.src,
                        "PicSize": self.uploadList.data[0].img.size,
                        "Language": self.TVSeriesInfo.Language,
                        "Year": self.TVSeriesInfo.Year,
                        "Score": self.TVSeriesInfo.Score,
                        "TotalEpisode": self.TVSeriesInfo.TotalEpisode,
                        "Category": self.categoryArr,
                        "Location": self.LocationArr                       
                    },
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        $scope.app.maskParams.getTVList()
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }
        }
    ]) 

    // 视频库页面的导入 以及 专题大片页面的 添加电影 弹框
    .controller('addMoreMovieTopicController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'util', 'NgTableParams','CONFIG', 
        function($http, $scope, $state, $stateParams, $filter, util, NgTableParams, CONFIG) {
            console.log('addMoreMovieTopicController')
            var self = this;
            self.init = function() {
                // 选中分类
                $scope.arr = {};
                $scope.arr.categoryArr = [];
                $scope.arr.LocationArr = [];

                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();

                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};
                self.maskParams = $scope.app.maskParams;
                // self.uploadList = new UploadLists();
                // 选择某个电影
                self.selectMovie = {};
                self.getLocation();
                self.getCategory();
                self.getOthersList();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
            self.getCategory = function() {
                var data = JSON.stringify({
                    "action": "getCategoryList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.data;
                        }
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
                
            //获取电影的Location
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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

            // 获取要导入的视频列表
            self.getOthersList = function(){
                self.loading = true;
                self.noData = false;
                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 15,
                    url: ''
                }, {
                    counts: [],
                    getData: function (params) {
                        //视频库
                        var data = {
                            "action": "getOthersList",
                            "token": util.getParams("token"),
                            "LibID": Number($scope.app.maskParams.LibID)                      
                        }
                        var paramsUrl = params.url();
                        data.per_page = paramsUrl.count -0;
                        data.page = paramsUrl.page -0;
                        data = JSON.stringify(data);
                        var requestTo = $scope.app.maskParams.type == 'video' ? 'movielib':'movietopiclib';
                        return $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl(requestTo, '', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if(data.data.data.Total == 0) {
                                self.noData = true;
                            };
                            params.total(data.data.data.Total);
                            return data.data.data.data;             
                        }, function errorCallback(data, status, headers, config) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function(value) {
                            self.loading = false;
                        })
                    }
                })
            }

            // 添加电影入库,需要判断是video还是topic
            self.addMovie = function () {
                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "LibID": Number(self.maskParams.LibID),
                    "action": "link",
                    "ID": self.selectMovie,
                    "Seq": self.movieInfo.Seq,
                    "Price": self.movieInfo.Price
                })

                var _url = self.maskParams.type === 'video' ? 'movielib' : 'movietopiclib'

                $http({
                    method: 'POST',
                    url: util.getApiUrl(_url, '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('添加成功')
                        self.cancel();
                        $state.reload('app.editedList')
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }
        }
    ])
    
    // 视频库页面的 编辑弹框
    .controller('editMovieInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $filter, $stateParams, util, CONFIG) {
            console.log('editMovieInfoController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};

                self.uploadList = new UploadLists();
                // 获取电影信息
                self.getMovieInfo();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            function UploadLists() {
                this.data = [
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            alert('图片上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }



            // 获取 电影的 信息
            self.getMovieInfo = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "ID":self.maskParams.movieID,
                    "LibID": self.maskParams.LibID
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {

                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.movieInfo = msg.data;
                        // 和上传 图片 的 数据 结构一致
                        var img = {};
                        img.img = {};
                        img.img.src = self.movieInfo.PicURL_ABS;
                        img.img.size = self.movieInfo.PicSize;
                        self.uploadList.data = [img];
                        // URL_ABS
                        self.maskParams.URL_ABS = msg.data.URL_ABS;
                        // Duration
                        self.maskParams.Duration = msg.data.Duration;
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


            // 编辑电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    self.categoryArr.push(id);
                } else {
                    var index = self.categoryArr.indexOf(id);
                    self.categoryArr.splice(index, 1);
                }
            }

            // 编辑产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    self.LocationArr.push(id);
                } else {
                    var index = self.LocationArr.indexOf(id);
                    self.LocationArr.splice(index, 1);
                }
            }
            // 监测电影分类，如果有，返回true
            self.checkCategory = function(id, Category) {
                for (var i = 0; i < Category.length; i++) {
                    if (Category[i] == id) {
                        // 加入数组中
                        self.chooseCateory(id, true);
                        return true;
                    }
                }
            }


            // 监测电影分类，如果有，返回true
            self.checkLocation = function(id, Location) {
                for (var i = 0; i < Location.length; i++) {
                    if (Location[i] == id) {
                        // 加入数组中
                        self.chooseLocation(id, true);
                        return true;
                    }
                }
            }


            // 编辑电影入库
            self.editMovieInfo = function () {
                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "ID": self.maskParams.movieID,
                    "LibID": Number(self.maskParams.LibID),
                    "Seq": self.movieInfo.Seq,
                    "Price": self.movieInfo.Price,
                    "data": {
                        "Name": self.movieInfo.Name,
                        "PicSize": self.uploadList.data[0].img.size,
                        "Actor":self.movieInfo.Actor,
                        "Director": self.movieInfo.Director,
                        "URL_ABS": self.maskParams.URL_ABS,
                        "MovieSize": self.movieInfo.MovieSize,
                        "Duration": self.maskParams.Duration,
                        "Score": self.movieInfo.Score,
                        "SearchName": self.movieInfo.SearchName,
                        "Year": self.movieInfo.Year,
                        "Introduce": self.movieInfo.Introduce,
                        "PicURL_ABS": self.uploadList.data[0].img.src,
                        "Category": self.categoryArr,
                        "Location": self.LocationArr
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movielib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('编辑成功');
                        // 电影id 变化，重新刷新页面
                        $state.reload('app.editedList');
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }
        }
    ]) 
    // 专题大片库的 编辑信息弹框
    .controller('editMovieTopicLibInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $filter, $stateParams, util, CONFIG) {
            console.log('editMovieTopicLibInfoController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                self.LibName = self.maskParams.LibName;//专题大片库名称
                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};
                self.MovieTopicLibInfo = {};

                self.uploadList = new UploadLists();
                // 获取专题片库信息
                // self.getMovieTopicList();
                self.getMovieInfo();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            function UploadLists() {
                this.data = [
                ];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            this.data[i][type].PicURL = '/Video/resource/' + src.split('/').pop();

                            self.MovieTopicLibInfo.src = src;
                            self.MovieTopicLibInfo.PicURL = this.data[i][type].PicURL;
                            self.MovieTopicLibInfo.PicSize = size;

                            break;
                        }
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            alert('图片上传成功');
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }

            // 获取专题片库信息
            self.getMovieInfo = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTopicLibList"
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movietopiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {

                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.movieInfo = msg.data;
                        // 和上传 图片 的 数据 结构一致
                        var img = {};
                        img.img = {};
                        img.img.src = self.movieInfo[0].BG_PicURL_ABS;
                        img.img.size = self.movieInfo[0].BG_PicSize;
                        img.img.PicURL = self.movieInfo[0].BG_PicURL;
                        img.img.IDName = self.movieInfo[0].IDName;
                        img.img.Name = self.movieInfo[0].Name;
                        self.uploadList.data = [img];
                        // URL_ABS
                        self.maskParams.URL_ABS = msg.data.URL_ABS;
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

            // 保存专题片库信息
            self.editMovieTopicLibInfo = function () {
                self.saving = true;
                var data = JSON.stringify({
                    "action": "editTopicLib",
                    "token": util.getParams('token'),
                    "LibID": Number(self.maskParams.LibID),
                    "data": {
                        "Name": self.LibName,
                        "BG_PicURL": self.MovieTopicLibInfo.PicURL,
                        "BG_PicURL_ABS": self.MovieTopicLibInfo.src,
                        "BG_PicSize": self.MovieTopicLibInfo.PicSize,
                        "IDName": "DefaultTopic"
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movietopiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('编辑成功');
                        // 电影id 变化，重新刷新页面
                        $state.reload('app.editedList');
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }
        }
    ]) 

    // 音乐库页面
    .controller('musicLiarbryController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
        function($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
            console.log('musicLiarbryController')
            var self = this;
            self.init = function () {
                self.stateParams = $stateParams;
                console.log(self.stateParams)
                self.defaultLang = util.getDefaultLangCode();
                self.getMusicList();
            }

            // 查询音乐列表
            self.getMusicList = function() {
                self.loading = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getList",
                    "lang": "zh-CN",
                    "LibID": self.stateParams.LibID,
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('musiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.length == 0) {
                            self.noData = true;
                            return;
                        }
                        self.musicList = msg.data;
                        console.log(self.musicList)
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

            // 删除音乐
            self.delMusic = function(ID){
                 var flag = confirm('确定删除？');
                 if (!flag) {
                    return;
                 }
                 var data = JSON.stringify({
                     "token": util.getParams('token'),
                     "action": "unlink",
                     "ID": ID,
                     "LibID": Number(self.stateParams.LibID)
                 })
                 $http({
                     method: 'POST',
                     url: util.getApiUrl('musiclib', '', 'server'),
                     data: data
                 }).then(function successCallback(response) {
                     var msg = response.data;
                     if (msg.rescode == '200') {
                         alert('删除成功');
                         $state.reload($state.current.name);
                     } else if (msg.rescode == "401") {
                         alert('访问超时，请重新登录');
                         $state.go('login');
                     } else {
                         alert(msg.rescode + ' ' + msg.errInfo);
                     }
                 }, function errorCallback(response) {
                     alert(response.status + ' 服务器出错');
                 }).finally(function(value) {
                 });


            }

            self.addMusic = function() {
                $scope.app.maskUrl = "pages/addMusic.html";
                $scope.app.maskParams = { LibID: self.stateParams.LibID };
            }

            self.editMusic = function(music) {
                $scope.app.maskUrl = "pages/editMusic.html";
                $scope.app.maskParams = { music: music ,LibID: self.stateParams.LibID};
            }



        }
    ])

    //  添加音乐弹框
    .controller('addMusicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $stateParams, util, CONFIG) {
            console.log('addMusicController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();

                self.maskParams = $scope.app.maskParams;

                self.movieInfo = {};
                // 提交的多语言

                // 上传,音乐和图标实例化了两个对象
                // self.uploadList = new UploadLists();
                // 上传图标
                self.imgUploadList = new UploadLists();
                // 上传音乐
                self.musicUploadList = new UploadLists();
            }

            // 添加音乐
            self.saveForm = function() {
                if (self.musicUploadList.data.length == 0) {
                    alert('请上传音乐');
                    return;
                }
                if (self.imgUploadList.data.length == 0) {
                    alert('请上传音乐图标');
                    return;
                }
                if (self.imgUploadList.data[0].img.percentComplete != 100 || self.musicUploadList.data[0].img.percentComplete != 100) {
                    alert('上传中，请稍等');
                    return;
                }

                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "lang": "zh-CN",
                    "Seq": Number(self.musicInfo.Seq),
                    "LibID": Number(self.maskParams.LibID),
                    "data": {
                        
                        "Name": self.musicInfo.Name,
                        "SingerName": self.musicInfo.SingerName,
                        "ColumnName": self.musicInfo.ColumnName,
                        "MusicIntro": self.musicInfo.MusicIntro,

                        "URL_ABS": self.musicUploadList.data[0].img.src,
                        "MusicSize":  Number(self.musicUploadList.data[0].img.size),
                        "PicURL_ABS": self.imgUploadList.data[0].img.src,
                        "PicSize":  Number(self.imgUploadList.data[0].img.size),

                        "Duration": self.musicInfo.Duration,
                    }
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('musiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {

                        alert('添加成功')
                        self.cancel();
                        $state.reload('app.musicLibrary', $stateParams, { reload: true })
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图标
            self.addCoverImg = function() {
                if (!$scope.myCoverImg) {
                    alert('请先选择图标');
                    return;
                }
                self.imgUploadList.uploadFile($scope.myCoverImg, self.imgUploadList);
            }

            // 上传音乐，同一个上传的函数，没有改动
            self.addMusic = function() {
                if (!$scope.myMusic) {
                    alert('请先选择音乐');
                    return;
                }
                self.musicUploadList.uploadFile($scope.myMusic, self.musicUploadList);
            }

            function UploadLists() {
                this.data = [];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({ "img": img, "id": this.maxId });
                    return this.maxId;
                },
                changeImg: function(img) {
                    // 只允许 上传 一张图片
                    this.data = [];
                    this.data.push({ "img": img, "id": this.maxId });
                    return this.maxId;
                },
                setPercentById: function(type, id, percentComplete) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].id == id) {
                            this.data[i][type].percentComplete = percentComplete;
                            break;
                        }
                    }
                },
                setSrcSizeById: function(type, id, src, size) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].id == id) {
                            this.data[i][type].src = src;
                            this.data[i][type].size = size;
                            break;
                        }
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 图片
                            if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = { "name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr };

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function() {
                                o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            self.movieInfo.PicSize = ret.size;
                            // alert('上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }





        }
    ])

    //  编辑音乐弹框
    .controller('editMusicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $stateParams, util, CONFIG) {
            console.log('editMusicController')
            console.log($scope.app.maskParams)
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                self.musicInfo = $scope.app.maskParams.music;

                // 上传,音乐和图标实例化了两个对象
                // self.uploadList = new UploadLists();
                // 上传图标
                self.imgUploadList = new UploadLists();
                // 上传音乐
                self.musicUploadList = new UploadLists();

                self.imgUploadList.data =[{img:{src:self.musicInfo.PicURL_ABS,size:self.musicInfo.PicSize}}];
                self.musicUploadList.data =[{img:{src:self.musicInfo.URL_ABS,size:self.musicInfo.MusicSize}}];
            }

            // 保存编辑
            self.saveForm = function() {
                if (self.musicUploadList.data.length == 0) {
                    alert('请上传音乐');
                    return;
                }
                if (self.imgUploadList.data.length == 0) {
                    alert('请上传音乐图标');
                    return;
                }

                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "ID": self.musicInfo.ID,
                    "lang": "zh-CN",
                    "Seq": self.musicInfo.Seq,
                    "LibID": Number(self.maskParams.LibID),
                    "data": {
                        "Name": self.musicInfo.Name,
                        "SingerName": self.musicInfo.SingerName,
                        "ColumnName": self.musicInfo.ColumnName,
                        "MusicIntro": self.musicInfo.MusicIntro,

                        "URL_ABS": self.musicUploadList.data[0].img.src,
                        "MusicSize": Number(self.musicUploadList.data[0].img.size),
                        "PicURL_ABS": self.imgUploadList.data[0].img.src,
                        "PicSize": Number(self.imgUploadList.data[0].img.size),

                        "Duration": self.musicInfo.Duration,
                    }
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('musiclib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('保存成功')
                        self.cancel();
                        $state.reload('app.musicLibrary', $stateParams, { reload: true })
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图标
            self.addCoverImg = function() {
                self.imgUploadList.uploadFile($scope.myCoverImg, self.imgUploadList);
            }

            // 上传音乐，同一个上传的函数，没有改动
            self.addMusic = function() {
                self.musicUploadList.uploadFile($scope.myMusic, self.musicUploadList);
            }

            function UploadLists() {
                this.data = [];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({ "img": img, "id": this.maxId });
                    return this.maxId;
                },
                changeImg: function(img) {
                    // 只允许 上传 一张图片
                    this.data = [];
                    this.data.push({ "img": img, "id": this.maxId });
                    return this.maxId;
                },
                setPercentById: function(type, id, percentComplete) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].id == id) {
                            this.data[i][type].percentComplete = percentComplete;
                            break;
                        }
                    }
                },
                setSrcSizeById: function(type, id, src, size) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].id == id) {
                            this.data[i][type].src = src;
                            this.data[i][type].size = size;
                            break;
                        }
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 图片
                            if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = { "name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr };

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function() {
                                o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            self.movieInfo.PicSize = ret.size;
                            alert('上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }
        }
    ])
    
    // 电视剧页面
    .controller('TVSeriesController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
        function($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
            var self = this;
            self.init = function () {
              self.editLangs = util.getParams('editLangs');
              self.defaultLang = util.getDefaultLangCode();
              // 选中分类
              $scope.arr = {};
              $scope.arr.categoryArr = [];
              $scope.arr.LocationArr = [];
              self.stateParams = $stateParams; //列表ID
              self.LibName = $scope.app.LibName; //库名称
              self.maskParams = $scope.app.maskParams;
              self.defaultLang = util.getDefaultLangCode();
              self.getLocation();
              self.getCategory();
              self.getTVList();
            }

            //获取电视剧的分类选项列表
            self.getCategory = function () {
                var data = JSON.stringify({
                    "action": "getCategoryList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.data;
                        }
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                },
                function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).
                finally(function(value) {
                    self.loading = false;
                });
            }

            //获取电视剧的产地选项列表
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            // 搜索条件多选框 电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    $scope.arr.categoryArr.push(id);
                } else {
                    var index = $scope.arr.categoryArr.indexOf(id);
                    $scope.arr.categoryArr.splice(index, 1);
                }
            }

            // 搜索条件多选框 产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    $scope.arr.LocationArr.push(id);
                } else {
                    var index = $scope.arr.LocationArr.indexOf(id);
                    $scope.arr.LocationArr.splice(index, 1);
                }
            }

            // 监听搜索条件的变化
            $scope.$watch('arr', function(value) {
                self.getTVList();
            }, true)

            self.searchKeywords = function() {
                self.keywords = self.tempWords
                self.getTVList()
            }

            // 获取当前库的电视剧列表
            self.getTVList = function() {
                self.loading = true;
                self.noData = false;
                self.tableParams = new NgTableParams({
                  page: 1,
                  count: 15,
                  url: ''
                }, {
                    counts: [],
                    getData: function(params) {
                        var data = {
                            "action": "getList",
                            "token": util.getParams("token"),
                            "keywords": self.keywords,
                            'LibID': Number(self.stateParams.LibID),
                            "LocationID": $scope.arr.LocationArr,
                            "CategoryID": $scope.arr.categoryArr
                        }
                        var paramsUrl = params.url() 
                        data.per_page = paramsUrl.count - 0;
                        data.page = paramsUrl.page - 0;
                        data = JSON.stringify(data);
                        return $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('tvserieslib', '', 'server'),
                            data: data
                        }).then(function successCallback(res, status, headers, config) {
                            if (res.data.data.Total == 0) {
                                self.noData = true;
                            };
                            params.total(res.data.data.Total);
                            return res.data.data.data;
                        }, function errorCallback(data, status, headers, config) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function(value) {
                            self.loading = false;
                        })
                    }
                })
            }
            // 添加电视剧
            self.addTV = function() {
                $scope.app.maskUrl = "pages/addTVSeries.html";
                $scope.app.maskParams = {
                  LibID: self.stateParams.LibID
                };
                $scope.app.maskParams.getTVList = self.getTVList
            }
            // 导入电视剧
            self.importTV = function() {
                console.log(self.libList)
                $scope.app.maskUrl = "pages/importTVSeries.html";
                $scope.app.maskParams = {
                  LibID: self.stateParams.LibID,
                };
            }
            // 编辑电视剧信息
            self.editTVInfo = function(id) {
                $scope.app.maskUrl = "pages/editTVInfo.html";
                $scope.app.maskParams = {
                  TVID: id,
                  LibID: self.stateParams.LibID
                };
            }
            // 删除已入库电视剧
            self.delTVSeries = function(id) {
                var flag = confirm('确定删除？');
                if (!flag) {
                    return;
                }
                var data = JSON.stringify({
                    "action": "unlink",
                    "token": util.getParams('token'),
                    "ID": id,
                    'LibID': self.stateParams.LibID
                }) 
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        $state.reload('app.TVSeriesLibrary', {LibID:self.stateParams.LibID})
                        // $state.reload($state.current.name);
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {});
            }

            // 获取该剧的剧集列表
            self.openEpisodeList = function (id, SeriesName) {
                $scope.app.maskUrl = "pages/episodeList.html";
                $scope.app.maskParams = {
                    SeriesID: id,
                    SeriesName: SeriesName
                }
            }

            // 添加剧集
            self.addTVEpisode = function (id,SeriesName) {
                $scope.app.maskUrl = "pages/addTVEpisode.html";
                $scope.app.maskParams = {
                    TVID: id,
                    SeriesName: SeriesName,
                    LibID: self.stateParams.LibID
                }
            }
        }
    ])
    
    // 编辑电视剧弹框
    .controller('editTVInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $filter, $stateParams, util, CONFIG) {
            console.log('editTVInfoController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.TVInfo = {};
                self.uploadList = new UploadLists();
                // 获取电影信息
                self.getTVInfo();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            // 上传图片
            self.addCoverImg = function() {
                self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            }

            function UploadLists() {
                this.data = [];
                this.maxId = 0;
            }

            UploadLists.prototype = {
                add: function(img) {
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
                },
                changeImg: function(img){
                    // 只允许 上传 一张图片
                    this.data =[];
                    this.data.push({"img": img, "id": this.maxId});
                    return this.maxId;
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
                            // 图片
                            if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                l[i].video.xhr.abort();
                            }
                            
                            // 删除data
                            l.splice(i, 1);
                            break;
                        }
                    }
                },
                uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    var imgXhr = new XMLHttpRequest();
                    var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    var id = this.changeImg(img);
                    // 上传视频
                    util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    // 更新上传进度
                                    o.setPercentById('img', id, percentComplete);
                                }
                            });
                        },

                        // 上传成功
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                            });
                            alert('图片上传成功')
                        },
                        // 上传失败
                        function(xhr) {
                            alert('图片上传失败，请重新上传');
                            o.deleteById(id)
                            xhr.abort();
                        }
                    );
                }
            }

            // 获取 电视剧的 信息
            self.getTVInfo = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "action": "get",
                    "token": util.getParams('token'),
                    "lang" : "",
                    "LibID": self.maskParams.LibID,
                    "ID": self.maskParams.TVID                   
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib ', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.TVInfo = msg.data;
                        self.TVInfo.Price = parseFloat(self.TVInfo.Price)
                        // 和上传 图片 的 数据 结构一致
                        var img = {};
                        img.img = {};
                        img.img.src = self.TVInfo.PicURL;
                        img.img.size = self.TVInfo.PicSize;
                        self.uploadList.data = [img];
                        // PicURL
                        // self.maskParams.PicURL = msg.data.PicURL;
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

            // 编辑电影分类
            self.chooseCateory = function(id, value) {
                if (value == true) {
                    self.categoryArr.push(id);
                } else {
                    var index = self.categoryArr.indexOf(id);
                    self.categoryArr.splice(index, 1);
                }
            }

            // 编辑产地分类
            self.chooseLocation = function(id, value) {
                if (value == true) {
                    self.LocationArr.push(id);
                } else {
                    var index = self.LocationArr.indexOf(id);
                    self.LocationArr.splice(index, 1);
                }
            }
            // 监测电影分类，如果有，返回true
            self.checkCategory = function(id, Category) {
                for (var i = 0; i < Category.length; i++) {
                    if (Category[i] == id) {
                        // 加入数组中
                        self.chooseCateory(id, true);
                        return true;
                    }
                }
            }

            // 监测电影产地，如果有，返回true
            self.checkLocation = function(id, Location) {
                for (var i = 0; i < Location.length; i++) {
                    if (Location[i] == id) {
                        // 加入数组中
                        self.chooseLocation(id, true);
                        return true;
                    }
                }
            }

            // 编辑电影入库
            self.submitEditTVInfo = function () {
                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "ID": self.maskParams.TVID,
                    "LibID": Number(self.maskParams.LibID),
                    "Seq": self.TVInfo.Seq,
                    "Price": self.TVInfo.Price.toString(),
                    "data": {
                        "Name": self.TVInfo.Name,
                        "Director": self.TVInfo.Director,
                        "ScreenWriter": self.TVInfo.ScreenWriter,
                        "Actor":self.TVInfo.Actor,
                        "Introduction": self.TVInfo.Introduction,
                        "PicURL": self.uploadList.data[0].img.src,
                        "PicSize": self.uploadList.data[0].img.size,
                        "Language": self.TVInfo.Language,
                        "Year": self.TVInfo.Year,
                        "Score": self.TVInfo.Score,
                        "TotalEpisode": self.TVInfo.TotalEpisode,
                        "Category": self.categoryArr,
                        "Location": self.LocationArr
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('编辑成功');
                        // 电影id 变化，重新刷新页面
                        $state.reload('app.TVSeriesLibrary');
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }
        }
    ]) 
   
    // 电视剧添加剧集 弹框
    .controller('addTVEpisodeController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'util', 'NgTableParams','CONFIG', 
        function($http, $scope, $state, $stateParams, $filter, util, NgTableParams, CONFIG) {
            console.log('addTVEpisodeController')
            var self = this;
            self.init = function () {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                // 提交的多语言
                self.episodeInfo = {};
                self.maskParams = $scope.app.maskParams;
                self.selectIndex = 0;
                // 选择某个电影
                // self.uploadList = new UploadLists();
                self.getTranscodeTaskList();
            }

            self.cancel = function () {
                $scope.app.maskUrl = "";
            }

             // 上传图片
            // self.addCoverImg = function () {
            //     self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            // }

            // function UploadLists () {
            //     this.data = [];
            //     this.maxId = 0;
            // }

            // UploadLists.prototype = {
            //     add: function(img) {
            //         this.data.push({"img": img, "id": this.maxId});
            //         return this.maxId;
            //     },
            //     changeImg: function(img){
                    // 只允许 上传 一张图片
                //     this.data =[];
                //     this.data.push({"img": img, "id": this.maxId});
                //     return this.maxId;
                // },
                // setPercentById: function(type, id, percentComplete) {
                //     for(var i =0; i < this.data.length; i++) {
                //         if(this.data[i].id == id) {
                //             this.data[i][type].percentComplete = percentComplete;
                //             break;
                //         }
                //     }
                // },
                // setSrcSizeById: function(type, id, src, size) {
                //     for(var i =0; i < this.data.length; i++) {
                //         if(this.data[i].id == id) {
                //             this.data[i][type].src = src;
                //             this.data[i][type].size = size;
                //             break;
                //         }
                //     }
                // },
                // deleteById: function(id) {
                //     var l = this.data;
                //     for(var i = 0; i <l.length; i++) {
                //         if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 图片
                            // if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                            //     l[i].video.xhr.abort();
                            // }
                            // 删除data
                //             l.splice(i, 1);
                //             break;
                //         }
                //     }
                // },
                // uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    // var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    // var imgXhr = new XMLHttpRequest();
                    // var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    // var id = this.changeImg(img);
                    // 上传视频
                    // util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        // function(evt) {
                        //     $scope.$apply(function() {
                        //         if (evt.lengthComputable) {
                        //             var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        //             // 更新上传进度
                        //             o.setPercentById('img', id, percentComplete);
                        //         }
                        //     });
                        // },

                        // 上传成功
                        // function(xhr) {
                        //     var ret = JSON.parse(xhr.responseText);
                        //     console && console.log(ret);
                        //     $scope.$apply(function(){
                        //       o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                        //     });
                        //     alert('图片上传成功')
                        // },
                        // 上传失败
                    //     function(xhr) {
                    //         alert('图片上传失败，请重新上传');
                    //         o.deleteById(id)
                    //         xhr.abort();
                    //     }
                    // );
            //     }
            // }

            // 获取未入库视频列表，放到tastList
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
                        self.taskList  = msg.data.taskList;
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

            // 提交添加剧集
            self.submitAddEpisode = function () {
                self.saving = true;
                var data = JSON.stringify({
                    "action": "addEpisode",
                    "token": util.getParams('token'),
                    "SeriesID": $scope.app.maskParams.TVID,
                    "Episode": self.episodeInfo.Episode,
                    "data": {
                        "Name": self.episodeInfo.Name,
                        "Episode": self.episodeInfo.Episode,
                        "URL": self.taskList[self.selectIndex].URL,
                        "Size": self.taskList[self.selectIndex].Size,
                        "PicURL": "",
                        "PicSize": "",
                        // "PicURL": self.uploadList.data[0].img.src,
                        // "PicSize": self.uploadList.data[0].img.size,
                        "Duration": self.taskList[self.selectIndex].Duration
                    }
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.delMovie(self.taskList[self.selectIndex].ID)
                        alert('添加成功')
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }

            // 添加成功后，从待入库删除这个视频
            self.delMovie = function(id){
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delTranscodeTask",
                    "lang": "zh-CN",
                    "taskID": id
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode !== '200') {
                        if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                });
            }
            
        }
    ])

    // 电视剧查看剧集列表 弹框
    .controller('episodeListController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'util', 'NgTableParams','CONFIG', 
        function($http, $scope, $state, $stateParams, $filter, util, NgTableParams, CONFIG) {
            console.log('episodeListController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                self.getEpisodeList();
            }
            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
            // 获取剧集列表
            self.getEpisodeList = function () {
                self.loading = true;
                self.noData = false;
                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 15,
                    url: ''
                }, {
                    counts: [],
                    getData: function (params) {
                        var data = {
                            "token": util.getParams("token"),
                            "action": "getEpisodeList",
                            "SeriesID": $scope.app.maskParams.SeriesID,
                            "page": 1,
                            "per_page": 15
                        }
                        var paramsUrl = params.url();
                        data.per_page = paramsUrl.count -0;
                        data.page = paramsUrl.page -0;
                        data = JSON.stringify(data);
                        return $http({
                            method: 'POST',
                            url: util.getApiUrl('tvseries', 'shopList', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if(data.data.data.Total == 0) {
                                self.noData = true;
                            };
                            params.total(data.data.data.Total);
                            console.log(data.data.data.data)
                            return data.data.data.data;
                        }, function errorCallback(data, status, headers, config) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function(value) {
                            self.loading = false;
                        })
                    }
                });
            };
            // 编辑剧集
            self.editEpisode = function(episode, name) {
                $scope.app.maskUrl = "pages/editEpisode.html";
                $scope.app.maskParams.episode = episode;
                $scope.app.maskParams.SeriesName = name; 
            }
            // 删除剧集
            self.delEpisode = function(episode) {
                var flag = confirm('确定删除？');
                if(!flag) {
                  return;
                }

                var data = JSON.stringify({
                    "action": "unlinkEpisode",
                    "token": util.getParams('token'),
                    "SeriesID": $scope.app.maskParams.SeriesID,
                    "Episode": episode 
                }) 

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                })
                .then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.getEpisodeList()
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                },  function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                })
                .finally(function(value) {});
            }
        }
    ])
    
    // 编辑剧集信息弹框
    .controller('editEpisodeController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util', 'CONFIG',
        function($http, $scope, $state, $filter, $stateParams, util, CONFIG) {
            console.log('editEpisodeController')
            var self = this;
            self.init = function() {
                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();
                self.maskParams = $scope.app.maskParams;
                self.episodeInfo = {};
                self.getEpisodeInfo();
                self.changeVideo = false;
                self.btnText = '修改视频文件';
                // self.uploadList = new UploadLists();
                // 获取电影信息
                self.selectIndex = -1;
                self.getTranscodeTaskList();
            }
            self.changeVideoFile = function () {
                self.changeVideo = !self.changeVideo;
                console.log("选中的序号是" + self.selectIndex)
                if (self.changeVideo) {
                    self.btnText = '取消选择';
                } else {
                    self.btnText = '修改视频文件';
                }
            }
            self.cancel = function() {
                $scope.app.maskUrl = "";
            }
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
                        self.taskList  = msg.data.taskList;
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
            self.delMovie = function(id){
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delTranscodeTask",
                    "lang": "zh-CN",
                    "taskID": id
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode !== '200') {
                        if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                });
            }
            // 上传图片
            // self.addCoverImg = function() {
            //     self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
            // }

            // function UploadLists() {
            //     this.data = [];
            //     this.maxId = 0;
            // }

            // UploadLists.prototype = {
            //     add: function(img) {
            //         this.data.push({"img": img, "id": this.maxId});
            //         return this.maxId;
            //     },
            //     changeImg: function(img){
                    // 只允许 上传 一张图片
                //     this.data =[];
                //     this.data.push({"img": img, "id": this.maxId});
                //     return this.maxId;
                // },
                // setPercentById: function(type, id, percentComplete) {
                //     for(var i =0; i < this.data.length; i++) {
                //         if(this.data[i].id == id) {
                //             this.data[i][type].percentComplete = percentComplete;
                //             break;
                //         }
                //     }
                // },
                // setSrcSizeById: function(type, id, src, size) {
                //     for(var i =0; i < this.data.length; i++) {
                //         if(this.data[i].id == id) {
                //             this.data[i][type].src = src;
                //             this.data[i][type].size = size;
                //             break;
                //         }
                //     }
                // },
                // deleteById: function(id) {
                //     var l = this.data;
                //     for(var i = 0; i <l.length; i++) {
                //         if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            // 图片
                            // if(l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                            //     l[i].video.xhr.abort();
                            // }
                            
                            // 删除data
                //             l.splice(i, 1);
                //             break;
                //         }
                //     }
                // },
                // uploadFile: function(imgFile, o) {
                    // 图片上传后台地址
                    // var uploadUrl = CONFIG.uploadImgUrl;

                    // 图片对象
                    // var imgXhr = new XMLHttpRequest();
                    // var img = {"name": imgFile.name, "size":imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                    // var id = this.changeImg(img);
                    // 上传视频
                    // util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                        // 上传中
                        // function(evt) {
                        //     $scope.$apply(function() {
                        //         if (evt.lengthComputable) {
                        //             var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        //             // 更新上传进度
                        //             o.setPercentById('img', id, percentComplete);
                        //         }
                        //     });
                        // },

                        // 上传成功
                        // function(xhr) {
                        //     var ret = JSON.parse(xhr.responseText);
                        //     console && console.log(ret);
                        //     $scope.$apply(function(){
                        //       o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                        //     });
                        //     alert('图片上传成功')
                        // },
                        // 上传失败
            //             function(xhr) {
            //                 alert('图片上传失败，请重新上传');
            //                 o.deleteById(id)
            //                 xhr.abort();
            //             }
            //         );
            //     }
            // }

            // 获取 剧集信息
            self.getEpisodeInfo = function () {
                self.loading = true;
                var data = JSON.stringify({
                    "action": "getEpisode",
                    "token": util.getParams('token'),
                    "SeriesID": self.maskParams.SeriesID,
                    "Episode": self.maskParams.episode               
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        self.episodeInfo = msg.data;
                        // 和上传 图片 的 数据 结构一致
                        // var img = {};
                        // img.img = {};
                        // img.img.src = self.episodeInfo.PicURL;
                        // img.img.size = self.episodeInfo.PicSize;
                        // self.uploadList.data = [img];
                        // PicURL
                        // self.maskParams.PicURL = msg.data.PicURL;
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

            // 提交编辑剧集
            self.submitEditEpisode = function () {
                self.saving = true;
                if (self.changeVideo && self.selectIndex !== -1) {
                    self.newURL = self.taskList[self.selectIndex].URL;
                    self.newSize = self.taskList[self.selectIndex].Size;
                    self.newDuration = self.taskList[self.selectIndex].Duration;
                } else {
                    self.newURL = self.episodeInfo.URL;
                    self.newSize = self.episodeInfo.Size;
                    self.newDuration = self.episodeInfo.Duration;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "editEpisode",
                    "SeriesID": self.maskParams.SeriesID,
                    "Episode": self.maskParams.episode,
                    "data": {
                        "Name": self.episodeInfo.Name,
                        "Episode": self.maskParams.episode,
                        "URL": self.newURL,
                        "Size": self.newSize,
                        "PicURL": "",
                        "PicSize": "",
                        // "PicURL": self.uploadList.data[0].img.src,
                        // "PicSize": self.uploadList.data[0].img.size,
                        "Duration": self.newDuration
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvseries', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('编辑成功');
                        if (self.changeVideo && self.selectIndex !== -1) {
                            self.delMovie(self.taskList[self.selectIndex].ID)
                        }
                        self.cancel();
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }
        }
    ]) 
    
    // 导入电视剧弹框
    .controller('importTVSeriesController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'util', 'NgTableParams','CONFIG', 
        function($http, $scope, $state, $stateParams, $filter, util, NgTableParams, CONFIG) {
            console.log('importTVSeriesController')
            var self = this;
            self.init = function() {
                // 选中分类
                $scope.arr = {};
                $scope.arr.categoryArr = [];
                $scope.arr.LocationArr = [];

                self.editLangs = util.getParams('editLangs')
                self.defaultLang = util.getDefaultLangCode();

                // 电影分类 初始化 数组 电影产地 初始化 数组
                self.categoryArr = []; 
                self.LocationArr = []; 
                // 提交的多语言
                self.movieInfo = {};
                self.maskParams = $scope.app.maskParams;
                // 选择某个电影
                self.selectMovie = {};
                self.getLocation();
                self.getCategory();
                self.getOthersList();
            }

            self.cancel = function() {
                $scope.app.maskUrl = "";
            }

            self.getCategory = function() {
                var data = JSON.stringify({
                    "action": "getCategoryList",
                    "token": util.getParams('token')
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noCategotyData = true;
                        } else {
                            self.categoryList = msg.data;
                        }
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
                
            //获取电影的Location
            self.getLocation = function() {
                var data = JSON.stringify({
                    "action": "getLocationList",
                    "token": util.getParams('token')
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('movie', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        if (msg.data.length == 0) {
                            self.noLocationData = true;
                        } else {
                            self.locationList = msg.data;
                        }
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

            // 获取要导入的视频列表
            self.getOthersList = function(){
                self.loading = true;
                self.noData = false;
                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 15,
                    url: ''
                }, {
                    counts: [],
                    getData: function (params) {
                        //视频库
                        var data = {
                            "action": "getOthersList",
                            "token": util.getParams("token"),
                            "LibID": Number($scope.app.maskParams.LibID)                      
                        }
                        var paramsUrl = params.url();
                        data.per_page = paramsUrl.count -0;
                        data.page = paramsUrl.page -0;
                        data = JSON.stringify(data);
                        return $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('tvserieslib', '', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if(data.data.data.Total == 0) {
                                self.noData = true;
                            };
                            params.total(data.data.data.Total);
                            return data.data.data.data;             
                        }, function errorCallback(data, status, headers, config) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function(value) {
                            self.loading = false;
                        })
                    }
                })
            }

            // 添加电视剧入库
            self.addMovie = function () {
                if (JSON.stringify(self.selectMovie) == '{}') {
                    alert('请选择电视剧');
                    return;
                }
                if (self.movieInfo.Seq == undefined) {
                    alert('请添加排序');
                    return;
                }
                self.saving = true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "LibID": Number(self.maskParams.LibID),
                    "action": "link",
                    "ID": self.selectMovie,
                    "Seq": self.movieInfo.Seq,
                    "Price": self.movieInfo.Price.toString()
                })

                var _url = self.maskParams.type === 'video' ? 'movielib' : 'movietopiclib'

                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvserieslib', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        alert('添加成功')
                        self.cancel();
                        $state.reload('app.TVSeriesLibrary')
                    } else if (msg.rescode == "401") {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                    self.cancel();
                });
            }
        }
    ])
    
})();
