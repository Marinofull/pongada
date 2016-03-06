var app=angular.module('pongada', []);

app.controller("game", ['$scope', function ($scope){
    $scope.turn = false;

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

    $scope.goto = function(n){
        if (n.class[1] == "adjacence"){
            $scope.node[$scope.selected.class[0][1]-1].filled=false;
            $scope.selected.class[0] = 'p'+ (n.id+1);
            n.filled = true;
            for (var i = 0; i < 9; i++)
                $scope.node[i].class[1]="";

            $scope.selected = null;
            $scope.turn = !$scope.turn;// de 2
            // $scope.turn = false;
            // cellplaying();
        };



    }

    $scope.selectPiece = function(p){
        if(p.id < 4 && $scope.turn == true) return; //vez de cell clicando em goku
        if(p.id >= 4 && $scope.turn == false) return; //vez de goku clicando em cell
        if($scope.selected != null) return; //esta no meio de uma jogada

        $scope.selected = p;
        var adjs = adj(p.class[0][1]-1);
        // console.log(adjs);
        for(var i=0; i < adjs.length; i++){
                if(! $scope.node[adjs[i]].filled)
                $scope.node[adjs[i]].class[1]="adjacence";
        }
    };

$scope.initialize();
}]);


