var fs = require("fs"), execute = [], runCount = -1;
const spawn = require('child_process').spawn,
root = process.env.HOME || process.env.USERPROFILE,
{dialog} = require('electron').remote;
var tempLogPath=__dirname;
__dirname.split('\\').forEach(function(tlp){
	if(tlp.indexOf(" ") != -1){
		tempLogPath=tempLogPath.replace("\\"+tlp,'\\"'+tlp+'"')
	}
});
const logPath=tempLogPath;
function closeWind() {

	window.close()
}
window.onbeforeunload = function (event) {
	for (var i = 0; i < execute.length; i++) {
		spawn("taskkill", ["/pid", execute[i].pid, '/f', '/t']);
	}
};
const app=angular.module("myapp", ['luegg.directives', 'ngTouch', 'ui.grid']);
app.controller("HelloController", function ($scope, $filter) {

	fs.readdir(__dirname + '\\log\\', function (err, items) {
		for (var i = 0; i < items.length; i++) {
			console.log(items[i]);
			fs.unlinkSync(__dirname + '\\log\\' + items[i])
		}
	});
	$scope.table = [];
	$scope.watcher = [],
	$scope.root = root,
	$scope.cmd = "",
	$scope.rootEdit = true;
	$scope.gridOptions = {
		enableFiltering : true,
		columnDefs : [],
		data : []
	},
	$scope.popUpwindow=false;
	$scope.editRoot=function(){
		alert("test")
	}
	var setLogHeader = function () {
		$scope.gridOptions.columnDefs = [{
				name : 'Root',
				field : 'root',
				cellTooltip : true,
				enableColumnMenu : false
			}, {
				name : 'Command',
				field : 'cmd',
				cellTooltip : true,
				enableColumnMenu : false
			}, {
				name : 'Mode',
				field : 'running',
				enableFiltering : false,
				width : '10%',
				cellTemplate : '<input data-ng-if="row.entity.running==false" type="image" class="execute_btn"src=".\\img\\execute.png" title="Execute command" data-ng-click="grid.appScope.start(row)"> <input data-ng-if="row.entity.running==true" type="image" class="execute_btn"src=".\\img\\stop.png" title="Execute command" data-ng-click="grid.appScope.stop(row)">',
				enableColumnMenu : false
			}, {
				name : 'Edit',
				enableFiltering : false,
				width : '8%',
				cellTemplate : '<input type="image" class="execute_btn"src=".\\img\\edit.png" title="Execute command" data-ng-click="grid.appScope.edit(row)"> ',
				enableColumnMenu : false
			}, {
				name : 'Log',
				enableFiltering : false,
				width : '8%',
				cellTemplate : '<input type="image" class="execute_btn"src=".\\img\\log.png" title="View Log" data-ng-click="grid.appScope.openLog(row)"> ',
				enableColumnMenu : false
			}
		]
	}
	var setSavedHeader = function () {
		$scope.gridOptions.columnDefs = [{
				name : 'Name',
				field : 'name',
				cellTooltip : true,
				enableColumnMenu : false
			},{
				name : 'Root',
				field : 'root',
				cellTooltip : true,
				enableColumnMenu : false
			}, {
				name : 'Command',
				field : 'cmd',
				cellTooltip : true,
				enableColumnMenu : false
			}, {
				name : 'Edit',
				enableFiltering : false,
				width : '8%',
				cellTemplate : '<input type="image" class="execute_btn"src=".\\img\\edit.png" title="Execute command" data-ng-click="grid.appScope.edit(row)"> ',
				enableColumnMenu : false
			}, {
				name : 'Trash',
				enableFiltering : false,
				width : '10%',
				cellTemplate : '<input type="image" class="execute_btn"src=".\\img\\trash.png" title="View Log" data-ng-click="grid.appScope.trash(row,rowRenderIndex)"> ',
				enableColumnMenu : false
			}
		]
	}
	setLogHeader();

	// $scope.openLog = function (param) {
	$scope.openLog = function (param) {
		$scope.textAreaRoot = angular.copy(param.entity.root);
		$scope.textAreaCommand = angular.copy(param.entity.cmd);
		$scope.watchingLocation = __dirname + '\\log\\' + param.entity.id + '.txt';
		$scope.logContent = fs.readFileSync($scope.watchingLocation, 'utf8');
		$scope.fileWatch();
	}
	$scope.edit = function (param) {
		$scope.root = param.entity.root;
		$scope.cmd = param.entity.cmd;
	}
	$scope.trash = function (param,ind) {
		$scope.gridOptions.data.splice(ind, 1);
				fs.writeFileSync(__dirname + '\\lib\\saved.txt', JSON.stringify($scope.gridOptions.data), 'utf8');
	}
	$scope.getSavedHistory = function () {
		angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'background-color':'#d4d4d4'})
		 angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'background-color':'#e6e6e6'})
		angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'border-bottom':'3px solid #e6e6e6'})
		angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'border-bottom':'3px solid #4CAF50'})
		setSavedHeader();
		$scope.gridOptions.data = $filter('orderBy')(JSON.parse(fs.readFileSync(__dirname + '\\lib\\saved.txt', 'utf8')), "date", true)
	}
	$scope.getLogHistory = function () {
		 angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'background-color':'#e6e6e6'})
		 angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'background-color':'#d4d4d4'})
		 angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'border-bottom':'3px solid #e6e6e6'})
		  angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'border-bottom':'3px solid #4CAF50'})
		setLogHeader();
		$scope.gridOptions.data = $filter('orderBy')($scope.table, "date", true)
	}
	function eventKill(event, id) {
		event.on("exit", function (msg) {
			$scope.table[id].running = false;
			$scope.gridOptions.data = $filter('orderBy')($scope.table, "date", true)
				$scope.$apply();
			event.kill();
			spawn("taskkill", ["/pid", event.pid, '/f', '/t']);
		})

	}
	$scope.start = function (param) {
		 angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'background-color':'#e6e6e6'})
		 angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'background-color':'#d4d4d4'})
		 angular.element( document.querySelector( '#btn-savedHistory' ) ).css({'border-bottom':'3px solid #e6e6e6'})
		  angular.element( document.querySelector( '#btn-LogHistory' ) ).css({'border-bottom':'3px solid #4CAF50'})
		if($scope.cmd && $scope.cmd.length !=0){
		++runCount;
		$scope.root = ($scope.root) ? $scope.root : root;
		var spawnid = (param && param.id) ? param.id : Math.random().toString().split(".")[1];
		if (!param) {
			param = {
				id : spawnid,
				root : angular.copy($scope.root),
				cmd : angular.copy($scope.cmd),
				running : true,
				date : new Date()
			}
		} else {
			param = {
				id : spawnid,
				root : param.entity.root,
				cmd : param.entity.cmd,
				running : true,
				date : new Date()
			}
		}
		$scope.textAreaRoot = angular.copy(param.root);
		$scope.textAreaCommand = angular.copy(param.cmd);
		$scope.table.push(param);
		$scope.gridOptions.data = $filter('orderBy')($scope.table, "date", true)
			$scope.watchingLocation = __dirname + '\\log\\' + spawnid + '.txt';
		execute[runCount] = spawn('cmd.exe', ['/c', param.cmd + " 1> " + logPath + '\\log\\' + spawnid + '.txt' + " 2>&1"], {
				cwd : param.root
			});
		param.task = execute[runCount];
		setLogHeader();
		eventKill(execute[runCount], runCount);
		$scope.fileWatch();
}
else{
	alert("invalid Command")
}

	}
	$scope.fileWatch = function () {
		fs.watchFile($scope.watchingLocation, {
			persistent : true,
			interval : 500
		}, function (curr, prev) {
			try {
				$scope.logContent = fs.readFileSync($scope.watchingLocation, 'utf8');
				$scope.$apply()
			} catch (e) {}

		});
	}
	$scope.stop = function (param, ind) {
		param.entity.running = false;
		spawn("taskkill", ["/pid", param.entity.task.pid, '/f', '/t']);
		$scope.watchingLocation = __dirname + '\\log\\' + param.entity.id + '.txt';
		$scope.fileWatch();
	}
	$scope.save = function (){
		if(($scope.SaveName && $scope.SaveName.length > 0) && ($scope.cmd && $scope.cmd.length > 0)){
				var content;

				content = fs.readFileSync(__dirname + '\\lib\\saved.txt', 'utf8');
				content = (content.length > 0) ? JSON.parse(content) : [];
				content.push({
					name : $scope.SaveName,
					root : angular.copy($scope.root),
					cmd : angular.copy($scope.cmd),
					date : new Date()
				});
				try{
				fs.writeFileSync(__dirname + '\\lib\\saved.txt', JSON.stringify(content), 'utf8');
				setSavedHeader();
				$scope.getSavedHistory();
				$scope.popUpwindow=false;
				alert("Successfully Saved")
				}
				catch(e){
					alert("Installation directory don't have file access permission Please reinstall different directive")
				}
		}else{
			alert("Invalid Name or Command")
		}
		$scope.SaveName="";		
	}
	
	$scope.Reset=function(){
		$scope.root = root,
	$scope.cmd = ""
	}
	$scope.browse=function(){
		var tempPath=$scope.root.substr(0,$scope.root.lastIndexOf("\\"));
		var root = dialog.showOpenDialog({
			properties: ['openDirectory'],
			defaultPath:tempPath
		});
		$scope.root = (root && root.length !=0) ?root[0]:$scope.root;
	}

});

app.directive('ngEnter',function(){
 return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
})
