'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('GitlabImportCtrl', function FileImportCtrl($scope,
  $uibModalInstance, $localStorage,
  $rootScope, $state, FileLoader, Storage, Preferences) {
  var results;

  $scope.baseurl = null;
  $scope.token = null;
  $scope.projectid = null;
  $scope.ref = null;
  $scope.filepath = null;
  $scope.error = null;
  $scope.opts = {
    useProxy: false
  };

  $scope.treeOptions = {
    nodeChildren: "children",
    dirSelectable: true,
    injectClasses: {
      ul: "a1",
      li: "a2",
      liSelected: "a7",
      iExpanded: "a3",
      iCollapsed: "a4",
      iLeaf: "a5",
      label: "a6",
      labelSelected: "a8"
    }
  };

  $scope.dataForTheTree =
  [
    {name: "Joe", age: "21", children: [
        {name: "Smith", age: "42", children: []},
        {name: "Gary", age: "21", children: [
            {name: "Jenifer", age: "23", children: [
                {name: "Dani", age: "32", children: []},
                {name: "Max", age: "34", children: []}
            ]}
        ]}
    ]},
    {name: "Albert", age: 33, children: []},
    {name: "Ron", age: "29", children: []}
  ];

  var fetch = function(projectid, filepath, ref) {
    $scope.error = null;
    $scope.canImport = false;
    const baseurl = Preferences.get('gitlabBaseUrl');
    const token = Preferences.get('gitlabToken');

    if (_.startsWith(baseurl, 'http')) {
      $scope.fetching = true;
      var url = baseurl + "/api/v3/projects/" +
      projectid + "/repository/files?file_path=" + filepath +
      "&ref=" + ref + "&private_token=" + token;
      FileLoader.loadFromGitlab(url, projectid).then(function(data) {
        $scope.$apply(function() {
          results = data;
          $scope.canImport = true;
          $scope.fetching = false;
        });
      }).catch(function(error) {
        $scope.$apply(function() {
          $scope.error = error;
          $scope.canImport = false;
          $scope.fetching = false;
        });
      });
    } else {
      $scope.error = 'Invalid URL';
    }
  };

  $scope.fetch = _.throttle(fetch, 200);

  $scope.ok = function() {
    if (angular.isString(results)) {
      Storage.save('yaml', results);
      $rootScope.editorValue = results;
      $state.go('home', {tags: null});
    }
    $uibModalInstance.close();
  };

  $scope.cancel = $uibModalInstance.close;
});
