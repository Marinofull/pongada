var app=angular.module('pongada', []);

app.controller("game", ['$scope', function ($scope){

    $scope.learnedStates = {"1110002221": {"parent": [], "weight": 100000, "turn": 0}};
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

        $scope.totalPath = ["1110002221"];
	    $scope.lastState = "1110002221";
        $scope.stopgGame = false;
        $scope.pieces=[];
        $scope.pieceAux = {inc: [0,3], img: ["gokuavatar","cellavatar"]};
        $scope.selected = null;
        $scope.node = [];
        $scope.turn = false;

        //preenche os espacos da arena
        for (var i = 0; i < 9; i++) {
            $scope.node.push({
                id: i,
                class: ['p'+(i+1)],
                filled: false,
                who: 0
            });
        };

        //preenche o tabuleiro com a configuracao inicial
        for (var i = 1; i < 7; i++) {
            var jump = Math.floor((i-1)/3);
            $scope.pieces.push({
                class: ['p'+ (i + $scope.pieceAux.inc[jump]), $scope.pieceAux.img[jump]],
                id: i
            });

            $scope.node[i-1 + (jump*3)].filled = true; //preenche o espaco onde a peca foi colocada
            $scope.node[i-1 + (jump*3)].who = (i < 4)  + 2 * (i >=4); // evil bit hack boolean bind conversion
        };


    };

    //retorna todas possibilidades de jogadas dada uma configuracao no tabuleiro
    //state exemple: 1102012201
    function possiblePlays(state){
        var possibilities = {};
        for(var i=0; i<9; i++){ //passando por todas as casas da string
            if (state[i] == state[9]){ //verifica se a peca pertence ao dono do turno
                var adjs = adj(i); // pega todas as adjacencias da peca i
                for(var j=0; j< adjs.length; j++){
                    if(state[adjs[j]]== '0'){ // verifica se aquela adjacencia esta livre
                    var newstate = state.substr(0,adjs[j]) + state[9] +
                     state.substr(adjs[j]+1, state.length - (adjs[j]+2)) + '1'; // cria uma nova string com o estado movendo para aquela posicao livre
                         newstate = newstate.substr(0, i) + '0' + newstate.substr(i+1); // seta pra 0 o local de onde a peca saiu

                        if($scope.allStates[newstate]) //se o estado ja existe...
                            possibilities[newstate] = $scope.allStates[newstate]; //... entao coloco ele em possibilities e ja adiciono o endereco dele
                        else{ // se ele nao existe
                            possibilities[newstate] = {}; // insere ele nas possibilidades inicializando ele com vazio
                            $scope.allStates[newstate] = possibilities[newstate]; // e adiciona ele ao allStates
                        }
                    }
                }
            }
        }
        return possibilities;
    };

    /*constroi o grafo e vê se ganhou (condição de parada pra construção)*/
	function judge(stateT){
        if($scope.totalPath.indexOf(stateT) == -1)// constroi o path, sem repetir estados, insere no inicio
            $scope.totalPath.unshift(stateT);

        console.log($scope.learnedStates);
		var initialConfigs= ["000000111","111000000"];
		var currentConfig = "";
		var playerNumber = [2,1];

		if(stateT[9] == 2){
			var currentState = stateT;

            var elem = $scope.allStates[currentState];

            var last = $scope.allStates[$scope.lastState];

            if(elem == undefined){ // se o estado que ele está é novo...
                var allNewSates = possiblePlays(currentState); //verifica quais são todas as possibilidades de jogadas para Cell
                //last[currentState] é a jogada de Goku
                last[currentState] = allNewSates; //setou o currentstate como filho do laststate
                last[currentState].parent = [ last ]; //seta o pai da jogada de Goku
                last[currentState].weight = 100000;
                last[currentState].turn = 0;
                $scope.allStates[currentState] = last[currentState];

                for(var state in last[currentState]){ //pra filho da jogada de Goku...
                    if(state != "parent" && state != "weight"  && state != "turn"){ // n pode olhar nem a seta do pai nem a seta do peso
                        //inicializa os dados daquela nova configuração
                        last[currentState][state].weight = 100000;
                        last[currentState][state].parent = [ last[currentState] ];
                        last[currentState][state].turn = 0;
                        $scope.allStates[state] = last[currentState][state];
                    }
                }

            }

		}

        var i;
        /*refatorar transformar aki em uma função*/
		for(i = 0; i < 9 ; i++) //traduz a string do estado, pra verificar se é formato de vitória
			if(stateT[i] == playerNumber[stateT[9]-1])
					currentConfig += '1';
				else
					currentConfig += '0';

		for(i=0; i < $scope.ends.length && currentConfig != $scope.ends[i]; i++);//vê se é alguma configuração de vitoria
		if(i < $scope.ends.length && $scope.ends[i] != initialConfigs[stateT[9]-1]){// se for, exceto inicial pra aquele jogador...
			var cur = $scope.allStates[stateT];

            // if(cur.weight == 100000){
    			if(stateT[9] == '2') { //verifica quem ganhou e chama a função que atualiza os pesos dos caminhos
                    updatePath(cur, 200000); //chama se Goku ganha
                }else
                    updatePath(cur,0); // se Cell ganha
            // }

            //atualiza o turn do path feito
            for(var upt= 0; upt < $scope.totalPath.length-1; upt++){
                var nodeInPath = $scope.allStates[$scope.totalPath[upt]];
                nodeInPath.turn++;
            }


			var players = ["GOKU","CELL"];
			alert("VITORIA DE " + players[$scope.turn+1-1]);
		}
        //retorna se foi vitória
		return (i < $scope.ends.length && $scope.ends[i] != initialConfigs[stateT[9]-1]);
	}



	function updatePath(cur,peso){
        if($scope.turn+1 == "1"){ //1 eh goku, 2 eh cell
                if(peso > cur.weight){
                    if((200000 - peso) < cur.weight){ //ponderar pra ver se quem está mais próximo é uma derrota
                        cur.weight = peso-1;
                        for(var i=0; i < cur.parent.length; i++){
                            updatePath(cur.parent[i],cur.weight);
                        }
                    }
                }
        }else{
            if(peso < cur.weight){
                if((200000 - peso) > cur.weight){ //ponderar pra o caso da vitória
                    cur.weight= peso+1;
                    for(var i=0; i < cur.parent.length; i++){
                        updatePath(cur.parent[i],cur.weight);
                    }
                }
            }
        }
	}

    function cellPlaying(){
        var currentState = "";
        for(var k = 0; k < 9; k++)
            currentState += $scope.node[k].who;
        currentState += '2';

        var elem = $scope.allStates[currentState];

        var minimum = null;

        for(var state in elem){
            /*refatorar isChild(state)*/
            if(state != "parent" && state != "weight" && state != "turn"){
                if(minimum == null || ($scope.allStates[state].weight < $scope.allStates[minimum].weight))
                    minimum = state;
            }
        }


        var minValue = $scope.allStates[minimum].weight;

        for(var state in elem){
            /*refatorar isChild(state)*/
            if(state != "parent" && state != "weight" && state != "turn"){
                if($scope.allStates[state].weight == minValue && ($scope.allStates[state].turn < $scope.allStates[minimum].turn))
                    minimum = state;
            }
        }

        //descobre qual peça deve ser movida para alcançar a configuração mínima
        var from = -1, to = -1,piece = {};
        for(var m=0; m < 9; m++){
            if(minimum[m] == '0' && currentState[m] != '0'){
                from = m;
            }
            if(minimum[m] != '0' && currentState[m] == '0'){
               to = m;
            }
        }

            // preenche o tabuleiro trocando a peça de lugar
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
        if (n.class[1] == "adjacence"){// s o destino clicado é uma adjacência válida...

            //antes de fazer as transformacoes no tabuleiro, seta o lastState

            $scope.lastState = "";
            for(var k = 0; k <9; k++)
                $scope.lastState += $scope.node[k].who;
            $scope.lastState += '1';


            //move a peça selecionada
            $scope.node[$scope.selected.class[0][1]-1].filled=false;
            $scope.node[$scope.selected.class[0][1]-1].who = 0;
            $scope.node[n.id].who = $scope.turn+1; //refatorar, nao precisa verificar o turno, esta no fim da string do state
            $scope.selected.class[0] = 'p'+ (n.id+1);
            n.filled = true;

            //retira a classe adjacence de todo mundo (retira as bordas)
            for (var i = 0; i < $scope.node.length; i++)
                $scope.node[i].class[1]="";

            $scope.selected = null;//desseleciona

            //o trecho abaixo traduz a configuração do tabuleiro numa string st
            var st = ""; /*refatorar*/
            for(var k = 0; k < $scope.node.length; k++){
                st +=  $scope.node[k].who;
            }
			st += !$scope.turn+1;

            //o trecho abaixo é responsável por verificar se ganhou, caso ele retorne para a configuração inicial pra forçar a vitória numa configuração inválida faz uma piada com o último miss universo

            var playerName = ["Kakaroto","Cell"];

            if(judge(st)){// se Goku ganhou reseta o game
				$scope.stopgGame = true;
                $scope.initialize();
            }else{ // se não, muda o turno e começa o turno de Cell
				$scope.turn = !$scope.turn;// de 2
				cellPlaying();

				var st = "";
				for(var k = 0; k < $scope.node.length; k++){
					st +=  $scope.node[k].who;
				}
				st += !$scope.turn+1;
				 if(judge(st)){ // se Cell ganhou reseta o game
					$scope.stopgGame = true;
					$scope.initialize();
				 }else
					$scope.turn = !$scope.turn;// de 2
			}
        };

    }

    /*Função responsável por selecionar uma peça e apresentar quais os locais possíveis*/
    $scope.selectPiece = function(p){

        if(p.id < 4 && $scope.turn == true) return; //vez de cell clicando em goku
        if(p.id >= 4 && $scope.turn == false) return; //vez de goku clicando em cell
        if($scope.selected != null) return; //esta no meio de uma jogada
        if($scope.stopgGame) return;

        // pega a peça que foi clicada pelo mouse
        $scope.selected = p;
        var adjs = adj(p.class[0][1]-1);//pega as adjacências daquela peça


        /*add a borda vermelha caso a adjacência esteja vazia*/
        empty = true;
        for(var i=0; i < adjs.length; i++){
                if(! $scope.node[adjs[i]].filled){
                    empty = false;
                    $scope.node[adjs[i]].class[1]="adjacence";
                }
        }
        if(empty){
            $scope.selected = null;// se não há uma adjacência livre, desseleciona-a
        }
    };

$scope.initialize();
}]);
