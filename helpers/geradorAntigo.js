$scope.dictionary = {
            world:{'111000222':[]}
        };
        $scope.dictionary.all = {};
        $scope.dictionary.all['111000222'] = $scope.dictionary.world['111000222'];

// TODO gerador de arquivo, atualmente ta uma bosta
 /*Função pra gerar o mundo de todos os estados possíveis, só que não funciona, é apenas de mentirinha*/
    $scope.gerar = function(){
        var currentNode = '111000222';
        var list = [currentNode];

            var player = [1,2];
            var turn = 0;
        while(list.length != 0){
            var current = list[0];
            var currentChildren = $scope.dictionary.all[current];
            list.shift();

            for(var i=0; i < 9; i++){
                if(current[i] == player[turn]){
                    var adjs = adj(i);
                    for(var j = 0 ; j< adjs.length; j++){
                        var newcur = current;
                        if (newcur[adjs[j]] == '0'){
                            newcur = newcur.substr(0,adjs[j]) + newcur[i] + newcur.substr(adjs[j]+1);
                            newcur = newcur.substr(0,i) + '0' + newcur.substr(i+1);

                            if($scope.dictionary.all[newcur]){
                                var elem = $scope.dictionary.all[newcur];
                                currentChildren[newcur] = elem;
                            }else{
                                list.push(newcur);
                                currentChildren[newcur] = [];
                                $scope.dictionary.all[newcur] = currentChildren[newcur];
                            }
                        }
                    }
                }
            }
            turn = (turn-1)* -1;
        }
        var test = $scope.dictionary.all['111020022'];

    };
