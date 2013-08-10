var __explorer = angular.module('RestSchemaExplorerApp', ['ngResource']);

__explorer.factory('Endpoints', ['$resource', function($resource) {
  return $resource('..', {});
}]);

__explorer.controller('EndpointsCtrl', 
  ['$scope', 'Endpoints', function($scope, Endpoints) {

  $scope.endpoints = Endpoints.query({});

}]);


__explorer.directive('jsonSchemaDoc', function($compile) {
  return {
    template: '<div ng-include="templateUrl"/>',
    restrict: 'A',
    transclude: false,
    scope: {
      schema: '=jsonSchemaDoc'
    },
    controller: ['$scope', function($scope) {
      if ($scope.schema) {
        $scope.templateUrl = '../_json_schema_doc.html';
      }
    }],
  }
})