$(document).ready(function () {
    arrumaTela();
});

$(window).resize(function () {
    arrumaTela();
});

function arrumaTela() {
    var width = $(window).width();
    var height = $(window).height();

    $("#title").css("font-size", (100 * width) / 1366);

    //conter fake
    $("#fakeConter").css("font-size", (40 * width) / 1366);
    $("#grafico1").css("height", (300 * height) / 646);
    $("#grafico2").css("height", (300 * height) / 646);
    $("#grafico3").css("height", (300 * height) / 646);
}

anychart.onDocumentReady(function () {
    ///
    ///
    ///             GRAFICO DE PIZZA
    ///
    //
    // create pie chart with passed data
    var chart = anychart.pie3d(getDataPizza());

    // set chart title text settings
    chart.title('Notícias avaliadas')
        //set chart radius
        .radius('83%')
        // create empty area in pie chart
        .innerRadius('30%');

    // set container id for the chart
    chart.container('grafico1');
    // initiate chart drawing
    chart.draw();

    //
    //
    //          GRAFICO DE LINHAS
    //
    //
    var dataSet = anychart.data.set(getDataLinhas());

    // map data for the first series, take x from the zero column and value from the first column of data set
    var seriesData_1 = dataSet.mapAs({
        'x': 0,
        'value': 1
    });

    // map data for the second series, take x from the zero column and value from the second column of data set
    var seriesData_2 = dataSet.mapAs({
        'x': 0,
        'value': 2
    });

    // map data for the third series, take x from the zero column and value from the third column of data set
    var seriesData_3 = dataSet.mapAs({
        'x': 0,
        'value': 3
    });

    // create line chart
    var chart = anychart.line();

    // turn on chart animation
    chart.animation(true);

    // set chart padding
    chart.padding([10, 20, 5, 20]);

    // turn on the crosshair
    chart.crosshair()
        .enabled(true)
        .yLabel(false)
        .yStroke(null);

    // set tooltip mode to point
    chart.tooltip().positionMode('point');

    // set chart title text settings
    chart.title('Avaliação das notícias por mês');

    // set yAxis title
    chart.yAxis().title('Número de notícias');
    chart.xAxis().labels().padding(5);

    // create first series with mapped data
    var series_1 = chart.line(seriesData_1);
    series_1.name('Fake');
    series_1.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_1.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // create second series with mapped data
    var series_2 = chart.line(seriesData_2);
    series_2.name('Não fake');
    series_2.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_2.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // create third series with mapped data
    var series_3 = chart.line(seriesData_3);
    series_3.name('Total');
    series_3.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_3.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // turn the legend on
    chart.legend()
        .enabled(true)
        .fontSize(13)
        .padding([0, 0, 10, 0]);

    // set container id for the chart
    chart.container('grafico2');
    // initiate chart drawing
    chart.draw();

    //
    //
    //              GRAFICO DE COLUNAS
    //
    //

    // create column chart
    var chart = anychart.column();

    // turn on chart animation
    chart.animation(true);

    // set chart title text settings
    chart.title('Top 5 sites com fake news');

    // create area series with passed data
    var series = chart.column(getDataColunas());

    // set series tooltip settings
    series.tooltip().titleFormat('{%X}');

    series.tooltip()
        .position('center-top')
        .anchor('center-bottom')
        .offsetX(0)
        .offsetY(5)
        .format('{%Value}{groupsSeparator: }')

    // set scale minimum
    chart.yScale().minimum(0);

    // set yAxis labels formatter
    chart.yAxis().labels().format('{%Value}{groupsSeparator: }');

    // tooltips position and interactivity settings
    chart.tooltip().positionMode('point');
    chart.interactivity().hoverMode('by-x');

    // axes titles
    chart.xAxis().title('Site');
    chart.yAxis().title('FakeNews');

    // set container id for the chart
    chart.container('grafico3');

    // initiate chart drawing
    chart.draw(); 


});

//para o grafico de linhas - deve ser substituido pelos dados das fake news
function getDataLinhas() {
    return [
        ['Janeiro/18', 500, 250, 750],
        ['Fevereiro/18', 450, 200, 650],
        ['Março/18', 300, 175, 475],
        ['Abril/18', 250, 50, 300],
        ['Maio/18', 400, 250, 650],
        ['Junho/18', 546, 430, 902],
        ['Julho/18', 234, 140, 415],
        ['Agosto/18', 523, 256, 789],
    ]
}

function getDataColunas(){
    return [
        ['noticiabrasil.com', '80540'],
        ['webjornal.com.br', '94190'],
        ['noticiasja.net', '102610'],
        ['jornalmatinal.net', '110430'],
        ['facebook.com', '128000']
    ]
}

function getDataPizza(){
    return [
        ['Fake', 457],
        ['Não fake', 300],
        ['Não avaliada', 98]
    ]
}