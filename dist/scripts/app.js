$(document).ready(function () {

    /*
        PAGE LOADING, TRANSITION ETC.
    */

    Barba.Pjax.init();
    Barba.Prefetch.init();
    var transition = Barba.BaseTransition.extend({
        start: function start() {
            Promise.all([this.newContainerLoading, this.fadeOut()]).then(this.fadeIn.bind(this));
        },
        fadeOut: function fadeOut() {
            return $(this.oldContainer).animate({ opacity: 0 }).promise();
        },
        fadeIn: function fadeIn() {
            var _this = this;
            url = window.location.toString().slice(23);
            document.body.scrollTop = 0;
            $('.nav-link-active').removeClass('nav-link-active');
            $('.nav-link[href="' + url + '"]').addClass('nav-link-active');
            $(this.oldContainer).hide();
            $(this.newContainer).css({ visibility: 'visible', opacity: 0 });
            $(this.newContainer).animate({ opacity: 1 }, 'slow', function () {
                _this.done();
            });
        }
    }),
        initPage = function initPage() {
        initPopover();
        initChart();
    };
    Barba.Pjax.getTransition = function () {
        return transition;
    };
    Barba.Dispatcher.on('transitionCompleted', initPage);

    /*
        TOGGLE SIDEBAR / MENU
    */

    //Unpin menu
    $('.app').on('click', '.menu .controller__sidebar', function () {
        $('.menu').css('transform', 'translateX(-110%)').removeClass('col-12 col-md-3 col-lg-2');
        $('#barba-wrapper').removeClass('col-md-9 col-lg-10');
        $('.header nav').css('margin-left', '65px');
        $('.header .controller__sidebar').removeClass('invisible');
    });
    //Pin menu
    $('.app').on('click', '.header .controller__sidebar', function () {
        $('.menu').addClass('col-12 col-md-3 col-lg-2').css('transform', 'translateX(0%)');
        $('#barba-wrapper').addClass('col-md-9 col-lg-10');
        $('.header nav').css('margin-left', '0');
        $('.header .controller__sidebar').addClass('invisible');
    });

    /*
        INIT BOOTSTRAP ELEMENTS
    */

    //Dropdown menu
    $('.dropdown-toggle').dropdown();

    //Popover
    initPopover();

    function initPopover() {
        $('.app .controller__search').popover({
            container: '.header',
            content: function content() {
                return '<form class="search" action="#" method="get">\n                            <label for="search">\n                                <input type="search" name="search" id="search-input" placeholder="Search..." autofocus>\n                            </label>\n                            <input type="submit" name="submit" value="OK">\n                        </form>';
            },
            html: true,
            placement: 'bottom',
            trigger: 'click'
        });

        $('.app .controller__settings').popover({
            container: '.header',
            content: function content() {
                return '<ul class="settings">\n                            <li><button type="button">Toggle sidebar</button></li>\n                            <div class="dropdown-divider"></div>\n                            <li><button type="button">Sign in</button></li>\n                        </ul>';
            },
            html: true,
            placement: 'bottom',
            trigger: 'focus'
        });
    }

    /*
        CHART
    */

    $('.app').on('click', '.controller__stats button.dropdown-item', function () {
        var subject = $(this).text().trim();
        //Update current active breadcrumb/dropdown-toggle
        $('.controller__stats .dropdown-toggle').text(subject);
        //(re)draw the chart
        drawChart(subject);
        //Data & Graphs page : Update current stat
        if (window.location.toString().slice(23) === 'details.html') {
            $('.card--current .card__infobox h3').text(subject.toUpperCase());
        }
    });

    //Init chart if and only if canvas#graph found on page
    initChart();

    function initChart() {
        var url = window.location.toString().slice(23);
        if (url === '' || url === 'index.html' || url === 'details.html') {
            var chart = $('.controller__stats .dropdown-toggle').text().trim();
            drawChart(chart);
        }
    }

    function drawChart(chart) {
        var ctx = $('#graph'),
            config = {
            type: 'line',
            labels: [date('2018/02/13'), date('2018/02/14'), date('2018/02/15'), date('2018/02/16'), date('2018/02/17'), date('2018/02/18'), date('2018/02/19')],
            data: {
                datasets: [{
                    data: [{ x: date('2018/02/13'), y: 45.10 }, { x: date('2018/02/14'), y: 45.95 }, { x: date('2018/02/15'), y: 45.56 }, { x: date('2018/02/16'), y: 48.00 }, { x: date('2018/02/17'), y: 45.00 }, { x: date('2018/02/18'), y: 49.97 }, { x: date('2018/02/19'), y: 50.00 }],
                    label: chart,
                    borderColor: '#03A9F4',
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Last 7 days ' + chart + ' stats'
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
                            stepSize: 10,
                            min: 0,
                            max: 100
                        }
                    }]
                }
            }
        };

        return new Chart(ctx, config);

        //Chart helper functions
        function date(dateString) {
            return moment(dateString, 'YYYY/MM/DD').toDate();
        }
    }
});