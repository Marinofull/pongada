var app=angular.module('pongada', []);

/*importa os arquivos json contendo o mundo conhecido e os estados finais*/
app.service("gameStates", ["$http", function($http){

    this.getWorld = function(){
        return $http.get("docs/file.json");
    }

    this.getEnds = function(){
        return $http.get("docs/ends.json");
    }

}])

app.controller("game", ['$scope',"gameStates", function ($scope, gameStates){


    $scope.learnedStates = {"1110002221": {"parent": [], "weight": 100000}};
    $scope.allStates = {"1110002221": $scope.learnedStates["1110002221"]};
	 $scope.ends = [
				"111000000",
				"000111000",
				"000000111",
				"100100100",
				"010010010",
				"001001001",
				"100010001",
				"001010100"
			];
    // inicializador do escopo
    $scope.initialize = function(){
       // gameStates.getEnds().then(function(response){

       // });
	   $scope.lastState = "1110002221";
        $scope.stopgGame = false;
        $scope.pieces=[];
        $scope.pieceAux = {inc: [0,3], img: ["gokuavatar","cellavatar"]};
        $scope.arena = [];
        $scope.selected = null;
        $scope.node = [];
        $scope.turn = false;
        $scope.dictionary = {
            world:{'111000222':[]}
        };
        $scope.dictionary.all = {};
        $scope.dictionary.all['111000222'] = $scope.dictionary.world['111000222'];

        for (var i = 0; i < 9; i++) {
            $scope.node.push({
                id: i,
                class: ['p'+(i+1)],
                filled: false,
                who: 0
            });
        };

        for (var i = 1; i < 7; i++) {
            var jump = Math.floor((i-1)/3);
            $scope.pieces.push({
                class: ['p'+ (i + $scope.pieceAux.inc[jump]), $scope.pieceAux.img[jump]],
                id: i
            });

            $scope.node[i-1 + (jump*3)].filled = true;
            $scope.node[i-1 + (jump*3)].who = (i < 4)  + 2 * (i >=4); // evil bit hack boolean bind conversion
        };


    };

    function possiblePlays(state){
        var possibilities = {};
        for(var i=0; i<9; i++){
            if (state[i] == state[9]){
                var adjs = adj(i);
                for(var j=0; j< adjs.length; j++){
                    if(state[adjs[j]]== '0'){
                    var newstate = state.substr(0,adjs[j]) + state[9] +
                     state.substr(adjs[j]+1, state.length - (adjs[j]+2)) + '1';
                         newstate = newstate.substr(0, i) + '0' + newstate.substr(i+1);
                         //verificacao a mais
                        if($scope.allStates[newstate] && newstate != "1110002221")
                            possibilities[newstate] = $scope.allStates[newstate];
                        else{
                            possibilities[newstate] = {};
                            $scope.allStates[newstate] = possibilities[newstate];
                        }
                    }
                }
            }
        }
        return possibilities;
    };

	function winner(stateT){
        console.log($scope.learnedStates);
		var initialConfigs= ["000000111","111000000"];
		var currentConfig = "";
		var lala = [2,1];
		//if(stateT[9] == 1){
		if(stateT[9] == 2){
			 var currentState = stateT;

        var elem = $scope.allStates[currentState];

        var last = $scope.allStates[$scope.lastState];

        if(elem == undefined){
            var allNewSates = possiblePlays(currentState);
            last[currentState] = allNewSates; //setou o currentstate como filho do laststate

            allNewSates.parent = [ last ];
            allNewSates.weight = 100000;
            $scope.allStates[currentState] = allNewSates;

            for(var state in allNewSates){
                if(state != "parent" && state != "weight"){ // n pode olhar nem a seta do pai nem a seta do peso
                    allNewSates[state].weight = 100000;
                    allNewSates[state].parent = [ allNewSates ];
                }
            }

        }

        elem = $scope.allStates[currentState];

		}


		currentConfig = "";
		for(i = 0; i < 9 ; i++)
			if(stateT[i] == lala[stateT[9]-1])
					currentConfig += '1';
				else
					currentConfig += '0';

		for(i=0; i < $scope.ends.length && currentConfig != $scope.ends[i]; i++);
		if(i < $scope.ends.length && $scope.ends[i] != initialConfigs[stateT[9]-1]){
			var cur = $scope.allStates[stateT];
	//eh aki q eu tenho q verificar todos os parent
    //1
			if(stateT[9] == '2')
				updatePath(cur,200000);
			else
				updatePath(cur,0);

			var players = ["GOKU","CELL"];

			alert("VITORIA DE " + players[$scope.turn+1-1]);
		}

		return (i < $scope.ends.length && $scope.ends[i] != initialConfigs[stateT[9]-1]);
	}



	function updatePath(cur,peso){
        console.log("PASSO1");
        if($scope.turn+1 == "1"){ //1 eh goku, 2 eh cell

            console.log("PASSO2");
            console.log(peso);
            console.log(cur.weight);
                if(peso > cur.weight){
                    console.log("PASSO4");
                    cur.weight = peso-1;
                    console.log(cur.parent);
                    for(var i=0; i < cur.parent.length; i++){
                        console.log("PASSO6");
                        console.log(cur.parent[i].weight);
                        updatePath(cur.parent[i],cur.weight);
                    }
                }
        }else{
            console.log("PASSO3");
            if(peso < cur.weight){
                console.log("PASSO5");
                cur.weight= peso+1;
                for(var father in cur.parent){
                    console.log("PASSO7");
                    updatePath(father,cur.weight);
                }
            }
        }
	}

    function cellPlaying(){
        //segunda vez q passa n ta atualizando a arvore
        var currentState = "";
        for(var k = 0; k < 9; k++)
            currentState += $scope.node[k].who;
        currentState += '2';

        var elem = $scope.allStates[currentState];

        elem = $scope.allStates[currentState];


        var minimum = null;
        for(var state in elem){
            if(state != "parent" && state != "weight"){
                if(minimum == null || $scope.allStates[state].weight < $scope.allStates[minimum].weight)
                    minimum = state;
            }

        }

        //descobre quem moveu e move
        var from = -1, to = -1,piece = {};
        for(var m=0; m < 9; m++){
            if(minimum[m] == '0' && currentState[m] != '0'){
                from = m;
            }
            if(minimum[m] != '0' && currentState[m] == '0'){
               to = m;
            }
        }

            $scope.node[from].filled = false;
                $scope.node[from].who = 0;
                for(var p = 0; p < 6; p++){
                        if($scope.pieces[p].class[0][1] == (from+1))
                            piece = $scope.pieces[p];
                }

            $scope.node[to].filled = true;
            $scope.node[to].who = 2;
            piece.class[0] = 'p'+(to+1);



    }



    /*Função para saber os adjacentes de n*/
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
            var i;
            for(i = 0; i < adjs.length && adjs[i] !=4; i++);
            if(i == adjs.length)
                adjs.push(4);

        }

        return adjs;
    }

    /*Função para mover uma peça após ser selecionada*/
    $scope.goto = function(n){
        if (n.class[1] == "adjacence"){

            //antes de fazer as transformacoes no tabuleiro, seta o lastState

            $scope.lastState = "";
            for(var k = 0; k <9; k++)
                $scope.lastState += $scope.node[k].who;
            $scope.lastState += '1';

                    //***************************************************************

            $scope.node[$scope.selected.class[0][1]-1].filled=false;
            $scope.node[$scope.selected.class[0][1]-1].who = 0;
            $scope.node[n.id].who = $scope.turn+1; //refatorar, nao precisa verificar o turno, esta no fim da string do state
            $scope.selected.class[0] = 'p'+ (n.id+1);
            n.filled = true;

            //retira a classe adjacence de todo mundo
            for (var i = 0; i < $scope.node.length; i++)
                $scope.node[i].class[1]="";

            $scope.selected = null;

            //o trecho abaixo traduz a configuração do tabuleiro numa string st
            var st = "";
            for(var k = 0; k < $scope.node.length; k++){
                st +=  $scope.node[k].who;
            }
			st += !$scope.turn+1;

            //o trecho abaixo é responsável por verificar se ganhou, caso ele retorne para a configuração inicial pra forçar a vitória numa configuração inválida faz uma piada com o último miss universo

            var playerName = ["Kakaroto","Cell"];

            if(winner(st)){
				$scope.stopgGame = true;
				//alert(playerName[$scope.turn+1-1] +" GANHOU O JOGO!");
				$scope.initialize();
				//setTimeout($scope.initialize,101); // EH MAIS 8 MIIIILL, CORRAM PRAS COLINAS! ALFACE
            }else{
					$scope.turn = !$scope.turn;// de 2
					//$scope.turn = false;
					cellPlaying();
					var st = "";
					for(var k = 0; k < $scope.node.length; k++){
						st +=  $scope.node[k].who;
					}
					st += !$scope.turn+1;
					 if(winner(st)){
						$scope.stopgGame = true;
						//alert(playerName[$scope.turn+1-1] +" GANHOU O JOGO!");
						$scope.initialize();
						//setTimeout($scope.initialize,101); // EH MAIS 8 MIIIILL, CORRAM PRAS COLINAS! ALFACE
					 }else
						$scope.turn = !$scope.turn;// de 2
				}
        };

        // var a = '{';
        // for(var i=0; i < 9; i++){
        //     if($scope.node[i].filled){
        //        for(var j = 0; j < 6 && ($scope.pieces[j].class[0][1] != (i + 1)); j++);
        //        if(j < 3) a = a + '1';
        //        else a = a + '2';
        //     } else
        //         a = a + 0;
        // }
        // a =a + ($scope.turn+1);
        // a = a + '}';




    }

    /*Função responsável por selecionar uma peça e apresentar quais os locais possíveis*/
    $scope.selectPiece = function(p){

        if(p.id < 4 && $scope.turn == true) return; //vez de cell clicando em goku
        if(p.id >= 4 && $scope.turn == false) return; //vez de goku clicando em cell
        if($scope.selected != null) return; //esta no meio de uma jogada
        if($scope.stopgGame) return;

        $scope.selected = p;
        var adjs = adj(p.class[0][1]-1);


        empty = true;
        for(var i=0; i < adjs.length; i++){
                if(! $scope.node[adjs[i]].filled){
                    empty = false;
                    $scope.node[adjs[i]].class[1]="adjacence";
                }
        }
        if(empty){
            $scope.selected = null;
        }
    };

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


$scope.initialize();
$scope.gerar();

}]);
