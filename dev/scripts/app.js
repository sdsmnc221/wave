$(document).ready(() => {
    const _types = ['Chlore', 'OxyConcentration', 'Oxygene', 'pH', 'Pression', 'Salinite', 'TempeAir', 'TempeEau'],
          t = {
            EN: ['Chlorine', 'Saturation', 'Oxygene', 'pH', 'Pressure', 'Salinity', 'Air Temp.', 'Water Temp.'],
            FR: ['Chlore', 'Saturation', 'Oxygène', 'pH', 'Pression', 'Salinité', 'Temp. d\'Air', 'Temp. d\'Eau'],
            VI: ['Clo', 'Độ bão hoà', 'Ôxy', 'pH', 'Áp suất', 'Nồng độ muối', 'Nhiệt độ không khí', 'Nhiệt độ nước']
          },
          api = '../scripts/api.php',
          loInterval = 1000*30; //every 30s
    let types = t[$('html').attr('lang').trim().toUpperCase()],
        lo,
        _chart;

    /*
        PAGE LOADING, TRANSITION ETC.
    */

    Barba.Pjax.init();
    Barba.Prefetch.init();
    Barba.Pjax.originalPreventCheck = Barba.Pjax.preventCheck;
    Barba.Pjax.preventCheck = function(evt, element) {
        if (!Barba.Pjax.originalPreventCheck(evt, element)) {
            return false;
        }
        if (/vi/.test(element.href.toLowerCase()) || /fr/.test(element.href.toLowerCase()) || /en/.test(element.href.toLowerCase())) {
            return false;
        }
        return true;
    };
    const transition = Barba.BaseTransition.extend({
            start: function() {
                Promise.all([this.newContainerLoading, this.fadeOut()])
                        .then(this.fadeIn.bind(this));
            },
            fadeOut: function() {
                return $(this.oldContainer).animate({opacity: 0}).promise();
            },
            fadeIn: function() {
                let _this = this
                    url = window.location.href.slice(23);
                document.body.scrollTop = 0;
                $('.nav-link-active').removeClass('nav-link-active');
                $(`.nav-link[href='${url}']`).addClass('nav-link-active');
                $(this.oldContainer).hide();
                $(this.newContainer).css({visibility: 'visible', opacity: 0});
                $(this.newContainer).animate({opacity: 1}, 'slow', function() {
                    _this.done();
                });
            }
        }),
        initPage = function() {
            detectLang();
            initButtons();
            initChart();
            if (window.location.href.indexOf('contact.html') === -1 && window.location.href.indexOf('about.html') === -1) {
                initLO();
            }
        },
        detectLang = function() {
            const lang = window.location.href;
            return (lang.indexOf('en') !== -1) ? 'en' : ((lang.indexOf('fr') !== -1) ? 'fr' : 'vi');
        },
        detectTypesLang = function() {
            const lang = window.location.href;
            types = (lang.indexOf('en') !== -1) ? t.EN : ((lang.indexOf('fr') !== -1) ? t.FR : t.VI);
        };
    Barba.Pjax.getTransition = () => {return transition};
    Barba.Dispatcher.on('initStateChange', detectTypesLang);
    Barba.Dispatcher.on('transitionCompleted', initPage);


    /*
        TOGGLE SIDEBAR / MENU
    */

    //Unpin menu
    $('.app').on('click', '.menu .controller__sidebar', unpinMenu);

    //Pin menu
    $('.app').on('click', '.header .controller__sidebar', pinMenu);

    //Responsive
    if ($(window).width() <= 425) unpinMenu()
    else pinMenu();

    $(window).on('resize', () => {
        if ($(window).width() <= 425) unpinMenu();
        else pinMenu();
    });

    //Functions
    function unpinMenu() {
        $('.menu')
            .css('transform', 'translateX(-110%)')
            .removeClass('col-12 col-md-3 col-lg-2');
        $('#barba-wrapper').removeClass('col-md-9 col-lg-10');
        $('.header nav').css('margin-left', '65px');
        $('.header .controller__sidebar').removeClass('invisible');        
    }

    function pinMenu() {
        $('.menu')
            .addClass('col-12 col-md-3 col-lg-2')
            .css('transform', 'translateX(0%)');       
        $('#barba-wrapper').addClass('col-md-9 col-lg-10');
        $('.header nav').css('margin-left', '0');
        $('.header .controller__sidebar').addClass('invisible');
    }


    /*
        INIT BOOTSTRAP ELEMENTS
    */

    //Dropdown menu
    $('.dropdown-toggle').dropdown();

    //Popover
    initButtons();
    tempConvert();

    //Functions
    function initButtons() {
        $('.app .controller__refresh').on('click', (e) => {
            initLO();
        });
    }

    function tempConvert() {
        $('.card__infobox--temp').each((index, node) => {
            const type = (window.location.href.indexOf('details.html') === -1) ? $(node).find('h3').first().text().trim() : $('.controller__stats .dropdown-item.active').text().trim();
            // console.log(type);
            if (type.indexOf('Temp') !== -1 || type.indexOf('Nhiệt độ') !== -1) {
                $(node).attr('title', `${type.indexOf('Temp') !== -1 ? 'Conversion Celsius <-> Farenheit' : 'Đổi Celsius <-> Farenheit'}`)
                    .css('cursor', 'pointer')
                    .on('click', (e) => {
                        let p = $(e.currentTarget).find('p').first(),
                            degree = parseFloat(p.text().trim());
                        if (p.text().indexOf('°C') !== -1) {
                            p.html(`${(degree * 1.8 + 32).toFixed(2)}<span class='unit'>°F</span`);
                        } else {
                            p.html(`${((degree -32)/1.8).toFixed(2)}<span class='unit'>°C</span`);
                        }
                    });
            };
        });
    }

    function destroyTempConvert() {
        $('.card__infobox--temp').each((index, node) => {
            $(node).removeAttr('type').css('cursor', 'default').off('click').removeClass('card__infobox--temp');
        });
    }

    /*
        LIVE OVERVIEW
    */
    if (window.location.href.indexOf('contact.html') === -1 && window.location.href.indexOf('about.html') === -1) {
        initLO();
    }

   function initLO() {
        $('.alert').remove();
        $('.dim').remove();
        $('.content').children().removeClass('blurred');
        if (window.location.href.indexOf('details.html') !== -1) {
            const subject = $('.controller__stats .dropdown-toggle').text().trim();
            $.ajax({
                url: api,
                dataType: 'json',
                data: {read_all: _types[types.findIndex(e => e === subject)]}
            }).done(data => {
                //console.log('ok');
                let value = data[0].Valeurs.toFixed(2),
                    lang = detectLang();
                    graphName = (lang === 'en') ? `<h2>${subject}'s Graph</h2>` : ((lang === 'fr') ? `<h2>Graphe : ${subject}</h2>`: `<h2>Biểu đồ ${subject}</h2>`);
                $('.card--current .card__infobox p').html((subject.indexOf('Temp') !== -1 || subject.indexOf('Nhiệt độ') !== -1) ? `${value}<span class='unit'>°C</span` : ((subject.indexOf('Press') !== -1 || subject.indexOf('Áp suất') !== -1) ? `${value}<span class='unit'>pHa</span` : value));
                $('.card--current .card__infobox h3').text(subject.toUpperCase());
                $($('.card__graph').siblings()[0]).html(graphName);
                initChart();
                // drawTable(data);
            }).fail(err => {
                onNoData();
            });
        } else {
            $.ajax({
                url: api,
                dataType: 'json',
                data: {read_lo: true}
            }).done(data => {
                $('.card__infobox').each((index, node) => {
                    const type = $(node).find('h3').text().trim(),
                        value = data.find(e => e.type === _types[types.findIndex(_e => _e === type)]).Valeurs.toFixed(2);
                    $(node).find('p').html((type.indexOf('Temp') !== -1 || type.indexOf('Nhiệt độ') !== -1) ? `${value}<span class='unit'>°C</span` : ((type.indexOf('Press') !== -1 || type.indexOf('Áp suất') !== -1) ? `${value}<span class='unit'>pHa</span` : value));
                });
                initChart();
                // drawTable(data.slice(0, 7));
            }).fail(err => {
                onNoData();
            });
        }
        lo = setTimeout(() => {
            initLO();
        }, loInterval); 
   }

   function destroyLO() {
       clearTimeout(lo);
   }

    /*
        CHART
    */   

    $('.app').on('click', '.controller__stats button.dropdown-item', function() {
        const subject = $(this).text().trim();
        //Update current active breadcrumb/dropdown-toggle
        $('.controller__stats .dropdown-toggle').text(subject);
        $('.controller__stats .dropdown-menu .dropdown-item').each((index, node) =>  {
            $(node).removeClass('active');
            if ($(node).text() === subject) $(node).addClass('active');
        });
        //(re)draw the chart
        initChart(subject);
        
        //Data & Graphs page : Update current stat
        if (window.location.href.indexOf('details.html') !== -1) {
            initLO();
            if (subject.indexOf('Temp') !== -1 || subject.indexOf('Nhiệt độ') !== -1) {
                $('.card--current-value').addClass('card__infobox--temp');
                tempConvert();
            } else {
                destroyTempConvert();
            }
        }
    });
    
    //Init chart if and only if canvas#graph found on page
    initChart();

    function initChart() {
        const chart = $('.controller__stats .dropdown-toggle').text().trim(),
                type = $('');
        $('canvas#graph').hide('slow').remove();
        $('.card__graph').append('<canvas id="graph"></canvas>');
        drawChart(chart);
    }

    function onNoData() {
        let alert = document.createElement('div'),
            dim = document.createElement('div'),
            lang = detectLang(),
            text;
        text = lang === 'en' ? 'No data. Refresh the page or check database connection.'
             : lang === 'fr' ? 'Aucune donnée. Rechargez la page ou vérifiez la connexion vers la BDD.'
             : 'Không có dữ liệu. Tải lại trang hoặc kiểm tra kết nối với CSDL.';
        $('.content').children().addClass('blurred');
        $(dim).addClass('dimmed').appendTo($('.content')); 
        $(alert).addClass('alert alert-danger')
                .attr('role', 'alert')
                .html(text)
                .appendTo($('.content'));
    }

    function drawChart(chart) {
        const lang = detectLang();
        $.ajax({
            url: api,
            dataType: 'json',
            data: {read_all: _types[types.findIndex(t => t === chart)]}
        }).done(data => {

            if (window.location.href.indexOf('details.html') === -1) {
                drawTable(data.slice(0, 7));
            } else {
                drawTable(data);
            }

            const _data = (window.location.href.indexOf('details.html') === -1) ? dataChart(data, 7) : dataChart(data, data.length),
            ctx = $('#graph'),
            config = {
                type: 'line',
                labels: _data.map(e => e.x), //time
                data: {
                    datasets: [{ 
                        data: _data,
                        label: chart,
                        borderColor: '#03A9F4',
                        fill: false
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: (lang === 'en') ? `Last 7 ${chart} stats` : ((lang === 'fr') ? `${chart} - Les 7 dernières valeurs` : `7 giá trị cuối cùng của ${chart}`)
                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                parser: 'MM/DD/YYYY HH:mm',
                                unit: 'day',
                                tooltipFormat: 'll HH:mm'
                            },
                            scaleLabel: {
                                display: false, //true
                                labelString: 'Date'
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: false, //true
                                labelString: 'Value'
                            },
                            ticks: {
                                stepSize: roundToNearestMultipleOf(_data.map(e => e.y).sort().reverse()[0])/10,
                                min: 0,
                                max: roundToNearestMultipleOf(_data.map(e => e.y).sort().reverse()[0])
                            }
                        }]
                    }
                }
            }; 
            
            return new Chart(ctx, config);
        });
    }

    //Table
    function drawTable(data) {
        let template = '';
        data.forEach((e, i) => {
            template += `<tr>
                <th scope='row'> ${(window.location.href.indexOf('detail.html') !== -1) ? e.ID : i+1} </th>
                <td> ${e.Valeurs} </td>
                <td> ${date(e.time)} </td>
            </tr>`;
        });
        $('#table tbody').html(template);
        $('#table').parent().scrollTop(0);
    }

    //Chart helper functions
    function dataChart(data, max) {
        const _data = data.slice(0, max).map(e => {
            return {
                x: date(e.time), //time
                y: e.Valeurs //value
            }
        });
        return _data;
    }

    function date(dateString) {
        return moment(dateString, 'YYYY/MM/DD HH:mm').toDate();
    }

    function roundToNearestMultipleOf(x, of = 100) {
        return Math.ceil(x/of)*of;
    }

});