console.log('script carregou!');

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "*************************",
    authDomain: "*********************",
    databaseURL: "********************",
    projectId: "**********************",
    storageBucket: "******************",
    messagingSenderId: "**************",
    appId: "**************************",
    measurementId: "******************"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const dbRef = firebase.database().ref();
const database = firebase.database().ref('transacoes');
const transacoesRef = database.orderByChild("id");

var textElement = document.querySelector('#text');
var amountElement = document.querySelector('#amount');
var monthElement = document.querySelector('#month');
var mesElement = document.querySelector('#mes');
var transactionsElement = document.querySelector('#transactions');
var btnElement = document.querySelector('#BtnAdd');
var BtnSearch = document.querySelector('#BtnSearch');
var moneyMinus = document.querySelector('#money-minus');
var moneyPlus = document.querySelector('#money-plus');
var balance = document.querySelector('#balance');

function filtrarMesMaior(transacoes){
    if(transacoes.length > 1){
        var teste =  transacoes.reduce(function(atual,next){
            if(atual.month>next.month){
                return atual;
            }
            else{
                return next;
            }        
        });
        return teste.month;
    }
    else if(transacoes.length === 1){
        return transacoes[0].month;
    }   
    else{
        return '';
    }
}

const snapshotToArray = snapshot => {
    let returnArr = [];
    
    snapshot.forEach(childSnapshot => {
        let item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    
    return returnArr;
};

function refresh(){
    transacoesRef.on('value',function(snap){
        var trans = snapshotToArray(snap);
        var mes = filtrarMesMaior(trans);
        renderTransacoes(trans,mes);
    });
}

const filter = (trans,month) => trans.filter(item => (item.month === month));
const find = (id,trans) => trans.find(item => (item.id === id));

var trans;
function renderTransacoes(transactions,mes){
    mesElement.value = mes;
    trans = transactions;
    
    transactionsElement.innerHTML = '';
    moneyPlus.innerHTML = '';
    moneyMinus.innerHTML = '';
    balance.innerHTML = '';
    var receita = 0,
        despesa = 0;
    for(transacao of filter(transactions,mes)){
        var pos = transactions.indexOf(transacao);

        var newLi = document.createElement('li');

        if(transacao.amount >= 0){
            newLi.setAttribute('class','plus');
            receita += parseFloat(transacao.amount);
        }
        else{
            newLi.setAttribute('class','minus');
            despesa += parseFloat(transacao.amount)*-1;
        }

        var newLiText = document.createTextNode(transacao.name);
        newLi.appendChild(newLiText);

        var newSpan = document.createElement('span');
        var spanText = document.createTextNode(parseFloat(transacao.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        newSpan.appendChild(spanText);
        newLi.appendChild(newSpan);

        var newButton = document.createElement('button');
        newButton.setAttribute('class','delete-btn');
        newButton.setAttribute('onclick',`deleteTransacoes(${pos})`);
        var buttonText = document.createTextNode('x'); 
        newButton.appendChild(buttonText);
        newLi.appendChild(newButton);

        transactionsElement.appendChild(newLi);
    }
    var balanco = receita-despesa;
    moneyPlus.appendChild(document.createTextNode('+ '+receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));
    moneyMinus.appendChild(document.createTextNode('- '+despesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));
    balance.appendChild(document.createTextNode(balanco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

}
refresh();

function addTransacoes(){
    var i = trans.length;
    var buscar = find(i+1,trans);
    console.log(buscar);
    if(buscar =! undefined){
        var registro = {id: i+1, name: textElement.value,amount: amountElement.value,month: monthElement.value};
        database.push(registro,function(){
            console.log('Registro foi inserido!')
        });
        refresh();    
    }
    textElement.value = '';
    amountElement.value = '';
    monthElement.value = '';
}

function deleteTransacoes(pos){    
    const transRefer =  dbRef.child('transacoes/' + trans[pos].key);
    transRefer.remove();
    refresh();
}

btnElement.onclick = addTransacoes;
BtnSearch.setAttribute('onclick','renderTransacoes(filter(trans,mesElement.value),mesElement.value)');

