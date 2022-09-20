$('.js-start').on('click', function () {

function getRandom(x){
    return Math.floor(Math.random()*x)+1;
};

var x=getRandom(37);

x=1+x*3;


    $('.js-result').text('等待結果...');
    setTimeout(function() {

        $('.js-result').text('抽到的人是：' + gradedata[x]);
    }, 2000);
});
