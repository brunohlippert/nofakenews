//
//
//    CHROME SCRIPTS
//
//

function onClickHandler(info, tab) {
  var obj;
  if (info.srcUrl != undefined) {
    obj = toJSON(info.srcUrl, "");
  } else if (info.linkUrl != undefined) {
    obj = toJSON(info.linkUrl, "");
  } else if (info.pageUrl != undefined) {
    var txt = "";
    if (info.selectionText != undefined) {
      txt = info.selectionText;
    }
    obj = toJSON(info.pageUrl, txt);
  }
  console.log(obj);
};

function toJSON(url, text) {
  var obj = new Object();
  obj.url = url;
  obj.text = text;
  return obj;
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.

  chrome.contextMenus.create({ "title": "No Fake News", "id": "noFakeNews" });

});



//
//
//        NOFAKE.HTML SCRIPTS
//
//



//Mostra a tela de login e esconde a tela inicial ou desconecta o usuario
function mostraLoginOuDesconecta() {
  chrome.storage.sync.get(['logado'], function (result) {
    if (result.logado) {
      chrome.storage.sync.set({ logado: false, usuario: undefined }, function () {
        desativaFuncoesDeLogado();
      });
    } else {
      $("#indexScreen").hide();
      $("#loginScreen").slideDown();
    }
  });


}

//Mostra a tela de resultado de busca
function mostraTelaResultBusca() {
  $("#searchScreen").hide();
  $("#viewResultadoBusca").show();
}

//Mostra a tela de resultado de busca
function voltaTelaResultBusca() {
  $("#viewResultadoBusca").hide();
  $("#divBuscaNaoAchou").hide();
  $("#divTableResultadoBusca").hide();
  $("#tableResultadoBusca tbody tr").remove();
  $("#searchScreen").show();
}

//Mostra a tela inicial e esconde a tela de login
function mostraIndex() {
  $("#loginScreen").hide();
  $("#indexScreen").show();
}

//Mostra a tela de cadastro e esconde a tela de login
function mostraCadastro() {
  $("#loginScreen").hide();
  $("#cadastroScreen").show();
}

//Mostra a tela de login e esconde a tela de cadastro
function voltaLoginCadastro() {
  $("#cadastroScreen").hide();
  $("#alertSenhaErradaCadastro").hide();
  $("#loginScreen").show();
}

//Mostra a tela de busca e esconde a tela inicial
function mostraBuscarNoticias() {
  $("#indexScreen").hide();
  $("#searchScreen").slideDown();
}

//esconde a tela de busca e mostra a tela inicial
function buscaVoltaIndex() {
  $("#searchScreen").slideUp();
  $("#indexScreen").slideDown();
}

//mostra tela de lista de noticias e esconde tela inicial
function verNoticias() {
  $("#indexScreen").hide();
  $("body").width(600);
  carregaNoticiasGeral();
  $("#paginaNewsGeral").html(paginaNewsGeral);
  $("#listScreen").show();
}

//mostra tela incial e esconde tela de lista de noticias
function listVoltaIndex() {
  $("#listScreen").hide();
  $("body").width(300);
  paginaNewsGeral = 1;
  $("#tableNewsGeral tbody tr").remove();
  $("#indexScreen").show();
}

//Recebe uma noticia completa ao clicar na tabela de noticias do proprio usuario e mostra
function mostraNoticiaTableMyNews(noticia) {
  $("#indexScreen").hide();
  $("body").width(600);
  $("#idViewScreenMyNews").val(noticia.news_id);
  $("#textAreaViewScreenMyNews").html(noticia.texto);
  $("#urlScreenMyNews").html("<a target='_blank' href='" + noticia.url + "'>" + noticia.url + "</a>");
  $("#viewScreenMyNews").show();

  if (noticia.validation == undefined)
    $("#resultViewScreenMyNews").val("EM VOTO");
  else if (noticia.validation)
    $("#resultViewScreenMyNews").val("VERDADEIRA");
  else
    $("#resultViewScreenMyNews").val("FAKE");
}

//Recebe uma noticia completa ao clicar na tabela de noticias de busca e mostra 
function mostraNoticiaTableResultadoBusca(noticia) {
  $("#viewResultadoBusca").hide();
  $("body").width(600);
  $("#idViewScreenNewsBusca").val(noticia.news_id);
  $("#textAreaViewScreenNewsBusca").html(noticia.texto);
  $("#urlScreenNewsBusca").html("<a target='_blank' href='" + noticia.url + "'>" + noticia.url + "</a>");
  $("#viewScreenNewsBusca").show();

  if (noticia.validation == undefined)
    $("#resultViewScreenNewsBusca").val("EM VOTO");
  else if (noticia.validation)
    $("#resultViewScreenNewsBusca").val("VERDADEIRA");
  else
    $("#resultViewScreenNewsBusca").val("FAKE");
}

//mostra index e esconde visualizacao de noticia do usuario
function viewScreenTableResultadoBusca() {
  $("#viewScreenNewsBusca").hide();
  $("body").width(300);
  $("#viewResultadoBusca").show();
}

//mostra index e esconde visualizacao de noticia do usuario
function viewScreenMyNewsVoltaIndex() {
  $("#viewScreenMyNews").hide();
  $("body").width(300);
  $("#indexScreen").show();
}

//Recebe uma noticia completa ao clicar na tabela de noticias gerais e mostra
function mostraNoticiaTableNewsGeral(noticia) {
  $("#listScreen").hide();
  $("body").width(600);
  $("#idViewScreenGeral").val(noticia.news_id);
  $("#textAreaViewScreenGeral").html(noticia.texto);
  $("#urlScreenGeral").html("<a target='_blank' href='" + noticia.url + "'>" + noticia.url + "</a>");
  if (noticia.validation == undefined)
    $("#resultViewScreenGeral").val("EM VOTO");
  else if (noticia.validation)
    $("#resultViewScreenGeral").val("VERDADEIRA");
  else
    $("#resultViewScreenGeral").val("FAKE");
  if (noticia.validation == undefined) {
    chrome.storage.sync.get(['logado'], function (result) {
      if (result.logado) {
        $("#botoesDeVoto").show();
      }
    });
  } 
  else
    $("#botoesDeVoto").hide();
  $("#viewScreenNewsGeral").show();
}

//mostra index e esconde visualizacao de noticia geral
function viewScreenNewsGeralVoltaIndex() {
  $("#viewScreenNewsGeral").hide();
  $("#alertaDoVoto").html("");
  $("#listScreen").show();
}

function mostraAvaliacaoInfoScreen() {
  $("#indexScreen").hide();
  $("body").width(600);
  $("#avaliacaoInfoScreen").show();
}

function voltaAvaliacaoInfoScreen() {
  $("#avaliacaoInfoScreen").hide();
  $("body").width(300);
  $("#indexScreen").show();
}

function finalizarCadastro() {
  $("#alertSenhaErradaCadastro").hide();
  var nome, senha, confirmSenha;
  nome = $("#loginCadastro").val();
  senha = $("#pwdCadastro").val();
  confirmSenha = $("#pwdConfirm").val();

  if (senha != confirmSenha) {
    $("#pwdCadastro").val("");
    $("#pwdConfirm").val("");
    $("#alertSenhaErradaCadastro").show();
  } else {
    //cria a conta
  }
}

//FUNCOES ESPECIAS DE HTML

function ativaFuncoesDeLogado() {
  $("#botoesDeVoto").show();
  $("#indexScreenLoged").show();
  $("#mostraLogin").html(usuario.login + " - Sair");
  $("#rating").html(usuario.avaliacao);
  $("#login").val("");
  $("#pwd").val("");

  chrome.contextMenus.create({
    "title": "Acho que este link é fake news, enviar.", "contexts": ["link"],
    "id": "linkFakeNews"
  });

  chrome.contextMenus.create({
    "title": "Acho que este texto é fake news, enviar.", "contexts": ["selection"],
    "id": "selectionFakeNews"
  });

  chrome.contextMenus.create({
    "title": "Acho que esta imagem é fake news, enviar.", "contexts": ["image"],
    "id": "imageFakeNews"
  });

  // Create a parent item
  

  
  carregaNoticiasUsuario();
}

function desativaFuncoesDeLogado() {
  $("#botoesDeVoto").hide();
  $("#indexScreenLoged").hide();
  $("#mostraLogin").html("Login / Criar conta");
  $("#tableMyNews tbody tr").remove();

  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ "title": "No Fake News", "id": "noFakeNews" });
}


//
//
//        FUNCOES DE DADOS
//
//

//USUARIOS

usuario = new Object();
usuario.login = "Bruno";
usuario.key = "adoiasjdikasdpaskpdaspodkpodpiejwoqieq12312";
usuario.memberId = "1";

usuario.senha = "12345";
usuario.avaliacao = 5;

//NOTICIAS
var n1 = new Object(), n2 = new Object(), n3 = new Object(), n4 = new Object(), n5 = new Object(),
  n6 = new Object(), n7 = new Object(), n8 = new Object(), n9 = new Object(), n10 = new Object(), n11 = new Object(),
  n12 = new Object(), n13 = new Object();

n1.news_id = "sdassdasdasdadsadfs";
n1.texto = "Brasil é campeão em corrupção";
n1.url = "http://www.google.com/corrupcao";
n1.validation = null;

n2.news_id = "kkslqsdqwdqwdddkla";
n2.texto = "Brasil é hexa";
n2.url = "http://www.google.com/hexa";
n2.validation = false;

n3.news_id = "dsafqwdqwdqwdqwrthtrdasf";
n3.texto = "Internacional na serie A";
n3.url = "http://www.google.com/internacional";
n3.validation = true;

n4.news_id = "sdfsqqwqfqrweiqhrthrowei";
n4.texto = "Papa é pop";
n4.url = "http://www.google.com/papa";
n4.validation = true;

n5.news_id = "kkalsowfwertgeghtrjpqwe";
n5.texto = "Banda calipso ganha premio de melhor banda do mundo";
n5.url = "http://www.google.com/calipso";
n5.validation = null;

n6.news_id = "123e1ddrthtrhtrtrhtrhsd";
n6.texto = "Gremio é time pequeno";
n6.url = "http://www.google.com/gremio";
n6.validation = true;

n7.news_id = "sddsqeeqeqtrhefgwfwdsad";
n7.texto = "Menino ney so cai";
n7.url = "http://www.google.com/meninoney";
n7.validation = false;

n8.news_id = "efgegkoerergergergergeojfiowf";
n8.texto = "Lolapalusa é festival de drogado";
n8.url = "http://www.google.com/lolapalusa";
n8.validation = true;

n9.news_id = "w8f0w8dfhtrhrtherhh90";
n9.texto = "PM abre edital para concurso 2018";
n9.url = "http://www.google.com/pm";
n9.validation = null;

n10.news_id = "L00h3453463yã";
n10.texto = "Lady gaga virá ao brasil amanhã";
n10.url = "http://www.google.com/gaga";
n10.validation = false;

n11.news_id = "932ri34gerfhfwhergreriefj";
n11.texto = "Hyperledger não da suporte aos desenvolvedores de graça";
n11.url = "http://www.google.com/hyperledger";
n11.validation = true;

n12.news_id = "sdkiofw3twtwgefhekfiodwfm";
n12.texto = "Dell vira empresa de caminhoes de lixo";
n12.url = "http://www.google.com/dell";
n12.validation = null;

n13.news_id = "isd8f9dergregegergero0";
n13.texto = "Outono sera estação das chuvas em 2018";
n13.url = "http://www.google.com/tempo";
n13.validation = true;

noticias = [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, n13];


function logar() {
  if (usuario.login == $("#login").val() && usuario.senha == $("#pwd").val()) {
    chrome.storage.sync.set({ logado: true, usuario: usuario }, function () {
      console.log(usuario.avaliacao);
      ativaFuncoesDeLogado();
      mostraIndex();
    });
  }
}

//
// tabela geral
//

paginaNewsGeral = 1;
function carregaNoticiasGeral() {
  for (let index = 0; index < 5; index++) {
    adicionaNoticiaGeral(index);
  }
}

function adicionaNoticiaGeral(index) {
  var noticia = noticias[index];

  var newRow = $("<tr>");
  var cols = "";
  cols += '<th>' + noticia.news_id.substring(0, 10) + '...</th>';
  cols += '<th>' + noticia.texto.substring(0, 20) + '...</th>';
  cols += '<th>' + noticia.url.substring(11, 21) + '...</th>';
  if (noticia.validation)
    cols += '<td style="color: chartreuse">VERDADEIRA</td>';
  else if (noticia.validation == null)
    cols += '<td style="color: rgb(0, 0, 0)">EM VOTO</td>';
  else
    cols += '<td style="color: red">FAKE</td>';
  newRow.append(cols);
  $("#tableNewsGeral").append(newRow);

  $("#tableNewsGeral tbody tr").click(function () {
    var id = $(this).find("th").html();
    var noticia = undefined;
    noticias.forEach(element => {
      if (element.news_id.substring(0, 10) + "..." == id) {
        noticia = element;
      }
    });
    mostraNoticiaTableNewsGeral(noticia);
  });
}

function geralNextPage() {
  if ((paginaNewsGeral * 5) + 1 < noticias.length) {
    paginaNewsGeral++;
    $("#tableNewsGeral tbody tr").remove();
    for (let index = ((paginaNewsGeral - 1) * 5); index < paginaNewsGeral * 5; index++) {
      if (noticias.length > index)
        adicionaNoticiaGeral(index);
    }
    $("#paginaNewsGeral").html(paginaNewsGeral);
  }
}

function geralPreviousPage() {
  if (paginaNewsGeral != 1) {
    paginaNewsGeral--;
    $("#tableNewsGeral tbody tr").remove();
    for (let index = ((paginaNewsGeral - 1) * 5); index < paginaNewsGeral * 5; index++) {
      adicionaNoticiaGeral(index);
    }
    $("#paginaNewsGeral").html(paginaNewsGeral);
  }
}

//
// tabela usuario
//

paginaMyNews = 1;
function carregaNoticiasUsuario() {
  for (let index = 0; index < 5; index++) {
    adicionaNoticiaMyNews(index);
  }
}

function adicionaNoticiaMyNews(index) {
  var noticia = noticias[index];

  var newRow = $("<tr>");
  var cols = "";
  cols += '<th>' + noticia.news_id.substring(0, 10) + '...</th>';
  if (noticia.validation)
    cols += '<td style="color: chartreuse">VERDADEIRA</td>';
  else if (noticia.validation == null)
    cols += '<td style="color: rgb(0, 0, 0)">EM VOTO</td>';
  else
    cols += '<td style="color: red">FAKE</td>';
  newRow.append(cols);
  $("#tableMyNews").append(newRow);

  $("#tableMyNews tbody tr").click(function () {
    var id = $(this).find("th").html();
    var noticia = undefined;
    noticias.forEach(element => {
      if (element.news_id.substring(0, 10) + "..." == id) {
        noticia = element;
      }
    });
      mostraNoticiaTableMyNews(noticia);
  });
}

function myNewsNextPage() {
  if ((paginaMyNews * 5) + 1 < noticias.length) {
    paginaMyNews++;
    $("#tableMyNews tbody tr").remove();
    for (let index = ((paginaMyNews - 1) * 5); index < paginaMyNews * 5; index++) {
      if (noticias.length > index)
        adicionaNoticiaMyNews(index);
    }
  }
}

function myNewsPreviousPage() {
  if (paginaMyNews != 1) {
    paginaMyNews--;
    $("#tableMyNews tbody tr").remove();
    for (let index = ((paginaMyNews - 1) * 5); index < paginaMyNews * 5; index++) {
      adicionaNoticiaMyNews(index);
    }
  }
}

$(document).ready(function () {
  //Verifica se o usr ja esta logado
  chrome.storage.sync.get(['logado'], function (result) {
    if (result.logado) {
      chrome.storage.sync.get(['usuario'], function (usr) {
        usuario = usr.usuario;
      });
      ativaFuncoesDeLogado();
    }
  });

});

function votarFake() {
  var id = $("#idViewScreenGeral").val();
  var noticia = undefined;
  noticias.forEach(element => {
    if (element.news_id == id) {
      noticia = element;
    }
  });
  votar(noticia, false);
}

function votarNaoFake() {
  var id = $("#idViewScreenGeral").val();
  var noticia = undefined;
  noticias.forEach(element => {
    if (element.news_id == id) {
      noticia = element;
    }
  });
  votar(noticia, true);
}

function votar(noticia, voto) {
  //faz o voto

  //Diz pro usuario o resultado do voto (se eh valido ou nao)
  if (voto == true) {
    $("#alertaDoVoto").html("<div class='alert alert-success' role='alert'>Você votou nesta notícia!</div>");
  } else {
    $("#alertaDoVoto").html("<div class='alert alert-danger' role='alert'>Você já votou nesta notícia!</div>");
  }
}

function procurarNews() {
  var texto, url, id;
  texto = $.trim($("#inputBuscaTexto").val());
  url = $.trim($("#inputBuscaUrl").val());
  id = $.trim($("#inputBuscaId").val());

  if (texto != "" || url != "" || id != "") {
    noticiaProcurar = new Object();
    if (texto != "")
      noticiaProcurar.texto = texto;
    if (url != "")
      noticiaProcurar.url = url;
    if (id != "")
      noticiaProcurar.id = id;

    //FAZ A BUSCA NA API
    //resultado = [];
    noticiasDaBusca = noticias;
    //----------------------
    mostraTelaResultBusca();
    if (noticiasDaBusca.length == 0) {
      $("#divBuscaNaoAchou").show();
    } else {
      $("#divTableResultadoBusca").show();
      carregaNoticiasResultadoBusca();
    }
  }
}

function carregaNoticiasResultadoBusca() {
  paginaResultadoBusca = 1;
  for (let index = 0; index < 5; index++) {
    adicionaNoticiaResultadoBusca(index);
  }
}

function adicionaNoticiaResultadoBusca(index) {
  var noticia = noticiasDaBusca[index];

  var newRow = $("<tr>");
  var cols = "";
  cols += '<th>' + noticia.news_id.substring(0, 10) + '...</th>';
  if (noticia.validation)
    cols += '<td style="color: chartreuse">VERDADEIRA</td>';
  else if (noticia.validation == null)
    cols += '<td style="color: rgb(0, 0, 0)">EM VOTO</td>';
  else
    cols += '<td style="color: red">FAKE</td>';
  newRow.append(cols);
  $("#tableResultadoBusca").append(newRow);

  $("#tableResultadoBusca tbody tr").click(function () {
    var id = $(this).find("th").html();
    var noticia = undefined;
    noticiasDaBusca.forEach(element => {
      if (element.news_id.substring(0, 10) + "..." == id) {
        noticia = element;
      }
    });
      mostraNoticiaTableResultadoBusca(noticia);
  });
}

function resultadoBuscaNextPage() {
  if ((paginaResultadoBusca * 5) + 1 < noticias.length) {
    paginaResultadoBusca++;
    $("#tableResultadoBusca tbody tr").remove();
    for (let index = ((paginaResultadoBusca - 1) * 5); index < paginaResultadoBusca * 5; index++) {
      if (noticias.length > index)
        adicionaNoticiaResultadoBusca(index);
    }
  }
}

function resultadoBuscaPreviousPage() {
  if (paginaResultadoBusca != 1) {
    paginaResultadoBusca--;
    $("#tableResultadoBusca tbody tr").remove();
    for (let index = ((paginaResultadoBusca - 1) * 5); index < paginaResultadoBusca * 5; index++) {
      adicionaNoticiaResultadoBusca(index);
    }
  }
}

document.getElementById('mostraLogin').addEventListener('click', mostraLoginOuDesconecta);
document.getElementById('mostraIndex').addEventListener('click', mostraIndex);
document.getElementById('mostraCadastro').addEventListener('click', mostraCadastro);
document.getElementById('voltaLoginCadastro').addEventListener('click', voltaLoginCadastro);
document.getElementById('buscarNoticia').addEventListener('click', mostraBuscarNoticias);
document.getElementById('buscaVoltaIndex').addEventListener('click', buscaVoltaIndex);
document.getElementById('verNoticias').addEventListener('click', verNoticias);
document.getElementById('listVoltaIndex').addEventListener('click', listVoltaIndex);
document.getElementById('viewScreenMyNewsVoltaIndex').addEventListener('click', viewScreenMyNewsVoltaIndex);
document.getElementById('viewScreenNewsGeralVoltaIndex').addEventListener('click', viewScreenNewsGeralVoltaIndex);
document.getElementById('imgAvaliacaoInfo').addEventListener('click', mostraAvaliacaoInfoScreen);
document.getElementById('avaliacaoInfoVoltaIndex').addEventListener('click', voltaAvaliacaoInfoScreen);
document.getElementById('botaoLogar').addEventListener('click', logar);
document.getElementById('listMyNewsButtonNext').addEventListener('click', myNewsNextPage);
document.getElementById('listMyNewsButtonPrev').addEventListener('click', myNewsPreviousPage);
document.getElementById('listButtonNext').addEventListener('click', geralNextPage);
document.getElementById('listButtonPrev').addEventListener('click', geralPreviousPage);
document.getElementById('votarFake').addEventListener('click', votarFake);
document.getElementById('votarNaoFake').addEventListener('click', votarNaoFake);
document.getElementById('botaoBusca').addEventListener('click', procurarNews);
document.getElementById('voltaBuscaProcurar').addEventListener('click', voltaTelaResultBusca);
document.getElementById('listResultadoBuscaButtonNext').addEventListener('click', resultadoBuscaNextPage);
document.getElementById('listResultadoBuscaButtonPrev').addEventListener('click', resultadoBuscaPreviousPage);
document.getElementById('viewScreenMNewsBuscaVoltaTabBusca').addEventListener('click', viewScreenTableResultadoBusca);
document.getElementById('botaoFinalizarCadastro').addEventListener('click', finalizarCadastro);

document.getElementById('go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('graficos.html'));
  }
});