
$(function () {
    var st = true;
    $('#buyA').click(function () {
        alert('buy-btn');
        if(st){
            inputShow();st = false;
        }else{
            $('.buy-btn a').unbind("click",inputShow);
        }
    });
    
    $('#buyB').click(function () {
        alert('buy11');
    });
    
    $('#buyC').click(function () {
        alert('buyCCC');
    });
})

function inputShow() {
    $(this).css('opacity', '0.8');
    $(".mess-box").fadeIn();
    $('#pcode').val('');
}


