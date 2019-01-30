const BASE_URL = "http://localhost:3000";

//const BASE_URL = "http://conseg.lad.pucrs.br:3000";
//encodeURIComponent("aHR0cHM6Ly93d3cudzNzY2hvb2xzLmNvbS9qc3JlZi9qc3JlZl9lbmNvZGV1cmkuY/XNw")
const NodeRSA = require('node-rsa');
const aes = require('js-crypto-aes');
const jQuery = require('jquery');
paginaVoltarMostraNews = 0;
//
//
//    CHROME SCRIPTS
//
//

function onClickHandler(info, tab) {
  var voto = true;
  if (info.menuItemId === "noFakeNewsFake") {
    voto = false;
  }
  var obj;
  obj = toJSON(info.pageUrl);
  enviarNoticia(obj.url, voto);

};

//envia a noticia / vota
function enviarNoticia(urlNews, voto) {

  chrome.storage.sync.get(['aes'], function (result) {
    aesKey = result.aes;
    chrome.storage.sync.get(['privKey'], function (result) {
      privKey = atob(result.privKey);
      var key = new NodeRSA();
      key.importKey(privKey, 'private')
      key.setOptions({ encryptionScheme: 'pkcs1' });
      //Decript Aes
      aesKey = key.decrypt(aesKey);
      var aesDecripted = aesKey.slice(92, aesKey.length);

      var publicKey = key.exportKey(["public"]);
      //Aes encrypt data
      vote = {
        "userPublicKey": publicKey,
        "vote": voto,
        "newsUrl": btoa(urlNews),
        "date": Date.now()
      };

      vote = JSON.stringify(vote);

      signature = key.sign(vote, 'base64');
      encryptedVote = {
        "vote": btoa(vote),
        "signature": signature
      };
      encryptedVote = JSON.stringify(encryptedVote);
      iv = 4242424242424242;

      encryptedVote = new TextEncoder("utf-8").encode(encryptedVote);
      iv = new TextEncoder("utf-8").encode(iv);

      aes.encrypt(encryptedVote, aesDecripted, { name: 'AES-CBC', iv }).then((encrypted) => {

        encyVoteSigned = arrayBufferToBase64(encrypted);

        jQuery.ajax({
          async: true,
          crossDomain: true,
          url: BASE_URL + "/vote",
          type: 'POST',
          headers: {
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded"
          },
          data: {
            "encryptedVote": encyVoteSigned,
            "userPublicKey": publicKey
          },
          success: function (result) {
            console.log(result);
            atualizaNews(urlNews);
          },
          error: function (jqXHR, status, err) {
            console.log(jqXHR);
            console.log(status);
            console.log(err);
          }
        });
      });
    });
  });
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
      chrome.storage.sync.set({ logado: false, privKey: undefined }, function () {
        desativaFuncoesDeLogado();
      });
    } else {
      $("#indexScreen").hide();
      $("#loginScreen").slideDown();
    }
  });
}

//Mostra a tela inicial e esconde a tela de login
function mostraIndex() {
  $("#loginScreen").hide();
  $("#indexScreen").show();
  $("#loginPrivateKey").val("");
  $("#alertLogin").hide();
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
  $("#alertSearch").hide();
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

//mostra index e esconde visualizacao de noticia do usuario
function viewScreenTableResultadoBusca() {
  $("#viewScreen").hide();
  $("#votarNaoFake").text("VERDADEIRA");
  $("#votarFake").text("FAKE");
  $("body").width(300);
  $("#searchScreen").show();
}

//mostra index e esconde visualizacao de noticia do usuario
function viewScreenMyNewsVoltaIndex() {
  $("#viewScreenMyNews").hide();
  $("body").width(300);
  $("#indexScreen").show();
}

//Busca o titulo de uma noticia no site
function getTitle(url){
  jQuery.support.cors = true;
  jQuery.ajax({
    url: url,
    crossDomain: true,
    success: function(data) {
      var matches = data.match(/<title>(.*?)<\/title>/);
      $("#tituloView").val(matches[0].replace('&#39;', "'").replace('<title>', '').replace('</title>', '').replace('&#39;', "'").replace('&#39;', "'").replace('&#39;', "'"));
    }, error: function (xhr, ajaxOptions, thrownError) {
      $("#tituloView").val("Não disponível no momento :(");
    }
  });

}

//Recebe uma noticia completa ao clicar na tabela de noticias gerais e mostra
function mostraNoticia(noticia, paginaAnterior) {
  $("#listScreen").hide();
  $("#searchScreen").hide();
  $("body").width(600);
  getTitle(atob(noticia.url));
  $("#votosView").val(noticia.voters.length);
  $("#urlView").html("<a target='_blank' id='viewUrlLink' href='" + atob(noticia.url) + "'>" + atob(noticia.url) + "</a>");

  if (noticia.reliabilityIndex === 1)
    $("#resultView").val("FATO");
  else if (noticia.reliabilityIndex === 2)
    $("#resultView").val("NEUTRA");
  else if (noticia.reliabilityIndex === 0)
    $("#resultView").val("FAKE");
  else if (noticia.reliabilityIndex === 3)
    $("#resultView").val("PODE SER FAKE");
  else if (noticia.reliabilityIndex === 4)
    $("#resultView").val("PODE SER FATO");

  chrome.storage.sync.get(['logado'], function (result) {
    if (result.logado) {
      $("#botoesDeVoto").show();
    } else
      $("#botoesDeVoto").hide();
  });

  var votosFake = 0;
  var votosFato = 0;
  var votou = undefined;
  chrome.storage.sync.get(['privKey'], function (result) {
    var publicKey;

    if (result.privKey != undefined){
      var privKey = atob(result.privKey);
      var key = new NodeRSA();
      key.importKey(privKey, 'private')
      key.setOptions({ encryptionScheme: 'pkcs1' });
      publicKey = key.exportKey(["public"]);
    }
    noticia.voters.forEach(voto => {
      if (voto.vote == true) {
        votosFato++; 
      } else {
        votosFake++;
      }
      if(voto.user.userPublicKey === publicKey){
        votou = voto.vote;
      }
    });

    if(votou == true){
      $("#votarNaoFake").text("VERDADEIRA (X)");
      $("#votarFake").text("FAKE");
    } else if (votou == false){
      $("#votarFake").text("FAKE (X)");
      $("#votarNaoFake").text("VERDADEIRA");
    }

    $("#votosViewFake").val(votosFake);
    $("#votosViewFato").val(votosFato);

  });

  if(paginaAnterior == 1){
    document.getElementById('viewScreenVolta').addEventListener('click', viewScreenVoltaIndex);
    document.getElementById('viewScreenVolta').removeEventListener('click', viewScreenTableResultadoBusca);
  } else if (paginaAnterior == 2){
    document.getElementById('viewScreenVolta').removeEventListener('click', viewScreenVoltaIndex);
    document.getElementById('viewScreenVolta').addEventListener('click', viewScreenTableResultadoBusca);
  }

  $("#viewScreen").show();
}

function atualizaNews(url){
  noticia = buscaNews(url);
  mostraNoticia(noticia, paginaVoltarMostraNews);
}

//mostra index e esconde visualizacao de noticia 
function viewScreenVoltaIndex() {
  $("#viewScreen").hide();
  $("#votarNaoFake").text("VERDADEIRA");
  $("#votarFake").text("FAKE");
  paginaNewsGeral = 1;
  $("#tableNewsGeral tbody tr").remove();
  carregaNoticiasGeral()
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



//FUNCOES ESPECIAS DE HTML

function ativaFuncoesDeLogado() {
  $("#botoesDeVoto").show();
  $("#indexScreenLoged").show();
  $("#mostraLogin").html("Sair");
  //$("#rating").html(usuario.avaliacao);
  $("#loginPrivateKey").val("");

  chrome.contextMenus.create({ "title": "Notícia Falsa, enviar para analise", "id": "noFakeNewsFake" });
  chrome.contextMenus.create({ "title": "Notícia Verdadeira, enviar para analise", "id": "noFakeNewsVerdade" });

  carregaNoticiasUsuario();
}

function desativaFuncoesDeLogado() {
  $("#botoesDeVoto").hide();
  $("#indexScreenLoged").hide();
  $("#mostraLogin").html("Login / Criar conta");
  $("#tableMyNews tbody tr").remove();

  chrome.contextMenus.removeAll();
}


//
//
//      LOGIN
//
//
function logar() {
  var privKey = $("#loginprivKey").val();

  if (privKey.trim() !== "") {
    //Gera as chaves RSA
    var key = new NodeRSA(privKey);
    var publicKey = key.exportKey(["public"]);

    $.ajax({
      async: true,
      crossDomain: true,
      url: BASE_URL + "/createBlock",
      type: 'POST',
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        "userPublicKey": btoa(publicKey)
      },
      success: function (result) {
        if (result.aesKey === undefined) {
          $("#alertLogin").html("A chave informada é inválida");
          $("#alertLogin").show();
        } else {
          //logado
          chrome.storage.sync.set({ logado: true, privKey: btoa(privKey), aes: result.aesKey }, function () {
            ativaFuncoesDeLogado();
            mostraIndex();
          });
        }
      },
      error: function (jqXHR, status, err) {
        console.log("Erro");
      }
    });
  } else {
    $("#alertLogin").html("Informe ou gere uma chave privada");
    $("#alertLogin").show();
  }
}


function gerarprivKey() {
  var key = new NodeRSA({ b: 1024 });
  key.setOptions({ encryptionScheme: 'pkcs1' });
  $("#loginprivKey").val(key.exportKey(["private"]));
}

function copiarChave() {
  chrome.storage.sync.get(['privKey'], function (result) {
    if (result.privKey) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(atob(result.privKey)).select();
      document.execCommand("copy");
      $temp.remove();

      alert("Chave copiada, não revele este conteúdo a estranhos.");
    }
  });

}

//
// tabela geral
//

paginaNewsGeral = 1;
function carregaNoticiasGeral() {
  //Buscar news na api
  $.ajax({
    async: true,
    crossDomain: true,
    url: BASE_URL + "/trendingNews",
    type: 'GET',
    success: function (result) {
      noticias = result;
      // Add na tabela
      for (let index = 0; index < 5 && index < noticias.length; index++) {
        adicionaNoticiaGeral(index);
      }
    },
    error: function (jqXHR, status, err) {
      alert("Verifique sua conexão.");
    }
  });
}

function adicionaNoticiaGeral(index) {
  var noticia = noticias[index];
  var newRow = $("<tr>");
  var cols = "";
  cols += '<th>' + atob(noticia.url).substring(0, 130) + '...</th>';
  if (noticia.reliabilityIndex === 1)
    cols += '<td style="color: chartreuse">FATO</td>';
  else if (noticia.reliabilityIndex === 2)
    cols += '<td style="color: rgb(0, 0, 0)">NEUTRA</td>';
  else if (noticia.reliabilityIndex === 0)
    cols += '<td style="color: red">FAKE</td>';
  else if (noticia.reliabilityIndex === 3)
    cols += '<td style="color: blue">PODE SER FAKE</td>';
  else if (noticia.reliabilityIndex === 4)
    cols += '<td style="color: blue">PODE SER FATO</td>';
  newRow.append(cols);
  $("#tableNewsGeral").append(newRow);

  $("#tableNewsGeral tbody tr").click(function () {
    var id = $(this).find("th").html();
    var noticia = undefined;
    noticias.forEach(element => {
      if (atob(element.url).substring(0, 130) + "..." == id) {
        noticia = element;
      }
    });
    paginaVoltarMostraNews = 1;
    mostraNoticia(noticia, paginaVoltarMostraNews);
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
  // var noticia = noticias[index];

  // var newRow = $("<tr>");
  // var cols = "";
  // cols += '<th>' + noticia.news_id.substring(0, 10) + '...</th>';
  // if (noticia.validation)
  //   cols += '<td style="color: chartreuse">VERDADEIRA</td>';
  // else if (noticia.validation == null)
  //   cols += '<td style="color: rgb(0, 0, 0)">EM VOTO</td>';
  // else
  //   cols += '<td style="color: red">FAKE</td>';
  // newRow.append(cols);
  // $("#tableMyNews").append(newRow);

  // $("#tableMyNews tbody tr").click(function () {
  //   var id = $(this).find("th").html();
  //   var noticia = undefined;
  //   noticias.forEach(element => {
  //     if (element.news_id.substring(0, 10) + "..." == id) {
  //       noticia = element;
  //     }
  //   });
  //   mostraNoticiaTableMyNews(noticia);
  // });
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
  enviarNoticia($("#viewUrlLink").html(), false);
}

function votarNaoFake() {
  enviarNoticia($("#viewUrlLink").html(), true);
}

function procurarNews() {
  var url= $.trim($("#inputBuscaUrl").val());
  $("#alertSearch").hide();
  if (url != "") {
    //FAZ A BUSCA NA API
    jQuery.ajax({
      async: true,
      crossDomain: true,
      url: BASE_URL + "/newsURL/"+encodeURIComponent(btoa(url)),
      type: 'GET',
      success: function (result) {
        if(result.voters.length == 0){
          $("#alertSearch").show();
        } else {
          $("#searchScreen").hide();
          paginaVoltarMostraNews = 2;
          mostraNoticia(result, paginaVoltarMostraNews);
        }
      },
      error: function (jqXHR, status, err) {
        console.log(jqXHR);
        console.log(status);
        console.log(err);
      }
    });
  }
}

function buscaNews(url) {
  if (url != "") {
    //FAZ A BUSCA NA API
    jQuery.ajax({
      async: true,
      crossDomain: true,
      url: BASE_URL + "/newsURL/"+encodeURIComponent(btoa(url)),
      type: 'GET',
      success: function (result) {
        mostraNoticia(result, paginaVoltarMostraNews);
      },
      error: function (jqXHR, status, err) {
        console.log(jqXHR);
        console.log(status);
        console.log(err);
      }
    });
  }
}

document.getElementById('mostraLogin').addEventListener('click', mostraLoginOuDesconecta);
document.getElementById('mostraIndex').addEventListener('click', mostraIndex);
document.getElementById('buscarNoticia').addEventListener('click', mostraBuscarNoticias);
document.getElementById('buscaVoltaIndex').addEventListener('click', buscaVoltaIndex);
document.getElementById('verNoticias').addEventListener('click', verNoticias);
document.getElementById('listVoltaIndex').addEventListener('click', listVoltaIndex);
document.getElementById('imgAvaliacaoInfo').addEventListener('click', mostraAvaliacaoInfoScreen);
document.getElementById('avaliacaoInfoVoltaIndex').addEventListener('click', voltaAvaliacaoInfoScreen);
document.getElementById('botaoDefineprivKey').addEventListener('click', logar);
document.getElementById('listMyNewsButtonNext').addEventListener('click', myNewsNextPage);
document.getElementById('listMyNewsButtonPrev').addEventListener('click', myNewsPreviousPage);
document.getElementById('listButtonNext').addEventListener('click', geralNextPage);
document.getElementById('listButtonPrev').addEventListener('click', geralPreviousPage);
document.getElementById('votarFake').addEventListener('click', votarFake);
document.getElementById('votarNaoFake').addEventListener('click', votarNaoFake);
document.getElementById('botaoBusca').addEventListener('click', procurarNews);
document.getElementById('gerarprivKey').addEventListener('click', gerarprivKey);
document.getElementById('imgChave').addEventListener('click', copiarChave);

document.getElementById('go-to-options').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('graficos.html'));
  }
});