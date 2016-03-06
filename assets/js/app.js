var app=angular.module('pongada', []);

app.controller("game", ['$scope', function ($scope){
    $scope.initialize = function(){
        $scope.pieces=[];
        $scope.pieceAux = {inc: [0,3], img: ["gokuavatar","cellavatar"]};
        $scope.arena = [];
        $scope.selected = null;
        $scope.node = [];

        for (var i = 0; i < 9; i++) {
            $scope.node.push({
                id: i,
                class: ['p'+(i+1)],
                filled: false
            });
        };

        for (var i = 1; i < 7; i++) {
            var jump = Math.floor((i-1)/3);
            $scope.pieces.push({
                class: ['p'+ (i + $scope.pieceAux.inc[jump]), $scope.pieceAux.img[jump]],
                id: i
            });
            $scope.node[i-1 + (jump*3)].filled = true;
        };

        console.log($scope.node);
    };



    function adj(n){
        // 0 - 1 - 2
        // | \ | / |
        // 3 - 4 - 5
        // | / | \ |
        // 6 - 7 - 8
        var adjs=[];

        if  (n == 4) adjs = [0,1,2,3,5,6,7,8]
        else{
            //se for diferente de 4, verifica as condições e no final adiciona 4 a aquele conjuntinho tbm
            if  (n % 3 != 2) adjs.push(n + 1);
            if  (n % 3 != 0) adjs.push(n - 1);

            if  (n < 6) adjs.push(n + 3);
            if  (n > 2) adjs.push(n - 3);

            adjs.push(4);
        }
        return adjs;
    }


    $scope.selectPiece = function(p){
        $scope.selected = p;
        var adjs = adj(p.id-1);
        console.log(adjs);
        for(var i=0; i < adjs.length; i++){
                if(! $scope.node[adjs[i]].filled)
                $scope.node[adjs[i]].class.push("adjacence");
        }
    };

$scope.initialize();
}]);


