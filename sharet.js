//倒计时
// var countDown = $('#times').text();
// $('.countdown').downCount({
//     date: countDown,
//     offset: +10
// }, function () {
//     //alert('倒计时结束!');
// });

//轮播图片
var imgList = $("#imgList").val().split(",");
for (var i = 0; i < imgList.length; i++) {
    $('.shop .left img').attr('src', imgList[0]);
    $('.shop .right').append('<div><img class="banner" src="' + imgList[i] + '" alt=""></div>')
}
$(document).on('click', '.banner', function () {
    $('.shop .left img').attr('src', $(this).attr('src'))
});


// 百度地图API功能

/*var map = new BMap.Map("allmap");
map.centerAndZoom(new BMap.Point(116.328749, 40.026922), 13);
map.enableScrollWheelZoom(true);

var index = 0;
var myGeo = new BMap.Geocoder();
var adds = [
    new BMap.Point(add.split('.')[0], add.split(',')[1])
];

function bdGEO() {
    var pt = adds[index];
    geocodeSearch(pt);
    index++;
}

function geocodeSearch(pt) {
    if (index < adds.length - 1) {
        setTimeout(window.bdGEO, 400);
    }
    myGeo.getLocation(pt, function (rs) {
        var addComp = rs.addressComponents;
        document.getElementById("result").innerHTML += addComp.city + ", " + addComp.district;
    });
}
bdGEO();*/

var add = $('#datAdd').val();
var map = new BMap.Map("allmap");
var point = new BMap.Point(add.split('.')[0], add.split(',')[1]);
map.centerAndZoom(point,12);
var geoc = new BMap.Geocoder();
geoc.getLocation(point, function(rs){
    var addComp = rs.addressComponents;
   // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
    document.getElementById("result").innerHTML += addComp.city + ", " + addComp.district;
});

//立即购买

var st = true;
$('#buyA').click(function () {
    alert('buy-btn');
    if(st){
        inputShow();st = false;
    }else{
        $('.buy-btn a').unbind("click",inputShow);
    }
});
function inputShow() {
    $(this).css('opacity', '0.8');
    $(".mess-box").fadeIn();
    $('#pcode').val('');
}

$('#buyB').click(function () {
    alert('buy11');
});

var wait = 60;
var urlId = $("#urlId").val().trim();
$("#getPcode").click(function () {
    var userPhone = $("#userPhone").val().trim();
    if (!is_mobile(userPhone)) {
        // $("#userPhone").siblings('em').text('请输入正确的手机号码');
        $.iBox.error('请输入正确的手机号码');
        return;
    }
    $.ajax({
        type: 'POST',
        url: "/share/sendSms",
        dataType: 'json',
        data: {
            phone: userPhone
        },
        beforeSend: function () {
            time();
        },
        success: function (data) {
            if (!data.r) {
                $("#pcode").val("");
            }
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
        }
    });
});
var token = '';
$("#next-page").click(function () {
    var pcode = $('#pcode').val().trim();
    var userPhone = $("#userPhone").val().trim();
    if (!checkVcodePhone(pcode)) {
        return;
    }
    $.ajax({
        type: 'POST',
        url: "/share/createPurchase",
        dataType: 'json',
        data: {shareResourceUrlId: urlId, phone: userPhone, pcode: pcode},
        beforeSend: function () {
            $("#next-page").attr("disabled", "disabled");
        },
        success: function (data) {
            $.iBox.success(data.m);
            $("#next-page").removeAttr("disabled");
            if (data.r === false) {
                return false;
            }
            $('.mess-box').fadeOut();
            var isOld = data.data.isOldUser;
            token = data.data.token;
            $("#money").val(data.data.money);
            $("#available").val(data.data.available);
            // if(parseInt(isOld) === 1){
            OldUser(token);
            // } else {
            //     // newsUser()
            // }
            $('.operate-box').fadeIn();
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
            // alert("网络繁忙，请重试");
            $("#reset-pass").removeAttr("disabled");
        }
    });
});

//收货地址
function OldUser(token) {
    $.ajax({
        type: 'POST',
        url: "/share/getUserReceiptInfos",
        dataType: 'json',
        data: {token: token},
        beforeSend: function () {

        },
        success: function (data) {
            if (data.data === '') {
                $('.address-box .add').fadeIn();
            } else {
                var str = '';
                $.each(data.data, function (k, v) {
                    str = '<li>'
                        + '<div>'
                        + '<input class="pu name borBot" type="text" value="' + v.consignee + '" disabled>'
                        + '<input class="pu tel borBot" type="text" value="' + v.tel + '" disabled>'
                        + '</div>'
                        + '<div class="form-inline">'
                        + '<div data-toggle="distpicker" id="dis' + k + '">'
                        + '<div class="form-group">'
                        + '<select class="form-control borBot province3" data-province="' + v.addressSheng + '" disabled></select>'
                        + '</div>'
                        + '<div class="form-group">'
                        + '<select class="form-control borBot city3" data-city="' + v.addressShi + '" disabled></select>'
                        + '</div>'
                        + '<div class="form-group">'
                        + '<select class="form-control borBot district3" data-district="' + v.addressQu + '" disabled></select>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '<input class="de borBot" type="text" value="' + v.addressDetailed + '" disabled>'
                        + '<em class="edit">编辑</em>'
                        + '<em class="okEdit" data-id="' + v.id + '" style="display:none;">确认</em>'
                        + '</li>';
                    $('.history ul').append(str);
                    $('#dis' + k + '').distpicker({
                        province: v.addressSheng,
                        city: v.addressShi,
                        district: v.addressQu
                    });
                    // $('#dis'+k+'').distpicker('reset');
                    // $('#dis'+k+'').distpicker('reset', true);
                });

                $('.history ul li:first-child').addClass('active');
            }
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
        }
    });
}

//打开新增地址
function addBtn() {
    $('.address-box .add').fadeIn();
    $('.address-box .add p input').val('');
}

// 新增地址
$('#new-address').click(function () {
    var consignee = $('.newName').val();
    var tel = $('.newTel').val();
    var addressDetailed = $('.newAdd').val();
    var addressSheng = $('#province10').val();
    var addressShi = $('#city10').val();
    var addressQu = $('#district10').val();
    if (!isChineseChar(consignee)) {
        $.iBox.error('请输入姓名');
        return;
    }
    if (!is_mobile(tel)) {
        $.iBox.error('请输入正确的手机号码');
        return;
    }
    if ($("#province10").get(0).selectedIndex == 0) {
        $.iBox.error('请选择省');
        return;
    }
    if ($("#city10").get(0).selectedIndex == 0) {
        $.iBox.error('请选择市');
        return;
    }
    if ($("#district10").get(0).selectedIndex == 0) {
        $.iBox.error('请选择区');
        return;
    }
    if (addressDetailed === '') {
        $.iBox.error('请输入地址');
        return;
    }
    $.ajax({
        type: 'POST',
        url: "/share/addUserReceiptInfo",
        dataType: 'json',
        data: {
            state: 1,
            addressSheng: addressSheng,
            addressShi: addressShi,
            addressQu: addressQu,
            addressDetailed: addressDetailed,
            tel: tel,
            consignee: consignee,
            token: token
        },
        beforeSend: function () {

        },
        success: function (data) {
            $.iBox.success('提交成功！');
            $('.address-box .add').fadeOut();
            $('.history ul').html('');
            OldUser(token)
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
        }
    });
});

// 编辑地址
$(document).on('click', '.history .edit', function () {
    $(this).hide();
    $(this).siblings('.okEdit').show();
    $(this).parents('li').find('.borBot').removeAttr("disabled").css({borderBottom: '1px solid rgb(146, 169, 245)'});
});

$(document).on('click', '.history .okEdit', function () {
    var id = $(this).attr('data-id');
    var addressDetailed = $(this).siblings('.de').val();
    var tel = $(this).siblings().find('.tel').val();
    var consignee = $(this).siblings().find('.name').val();
    var addressSheng = $(this).parents('li').find('.province3').val();
    var addressShi = $(this).parents('li').find('.city3').val();
    var addressQu = $(this).parents('li').find('.district3').val();
    $.ajax({
        type: 'POST',
        url: "/share/updUserReceiptInfo",
        dataType: 'json',
        data: {
            id: id,
            addressSheng: addressSheng,
            addressShi: addressShi,
            addressQu: addressQu,
            addressDetailed: addressDetailed,
            tel: tel,
            consignee: consignee,
            token: token
        },
        beforeSend: function () {

        },
        success: function (data) {
            $.iBox.success('修改成功！');
            $('.edit').show();
            $('.okEdit').hide();
            $('.history input').attr("disabled", "disabled").css({borderBottom: 'none'});
            $('.history ul').html('');
            OldUser(token)
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
        }
    });
});

// 选择地址
$(document).on('click', '.history li', function () {
    $('.history li').removeClass('active');
    $(this).addClass('active');
});


function payment() {
    var sign = $('#sign').val();
    var payWay = $(".payment-box input[type='radio']:checked").val();
    var rtid = $('.history li.active .okEdit').attr('data-id');
    var payPassword = '';

    if(payWay == 4){
        $('.maskk').fadeIn();
        $('#form_paypsw').fadeIn();
        $('.sub-btn').click(function () {
            payPassword = $('#payPassword_rsainput').val()
            console.log(payPassword);
        });
    }

    $.ajax({
        type: 'POST',
        url: "/order/wappay.do",
        data: {payWay: payWay, rtid: rtid, token: token, sign: sign},
        dataType: 'json',
        success: function (data) {
            if (data.success) {
                var payway = data.payWay;
                if (payway == 1) {//支付宝
                    var form = $(data.form);
                    $(document.body).append(form);
                    // // 提交表单
                    form.submit();
                } else if (payway == 4) {//钱包支付
                    var settleNum = data.data;
                    var payWay = 4;    //1:支付宝 2：微信 3：零钱 4：钱包支付
                    var password = $("#payPassword_rsainput").val();//支付密码
                    if (payWay == null || payWay == "") {
                        alert("请选择支付方式");
                        return;
                    }
                    if (payWay == 4 && (password == null || password == "")) {
                        alert("请输入支付密码");
                        return;
                    }
                    var pwd = hex_md5(hex_md5(password).toUpperCase() + settleNum);
                    $.ajax({
                        type: 'POST',
                        url: "/order/submitQbPay.do",
                        dataType: 'json',
                        data: {settleNum: settleNum, payWay: payWay, password: pwd},
                        success: function (data) {
                            if (data.success) {
                                window.location.href = "/order/result?reqData=" + data.data + "&v=" + Math.random();
                            } else {
                                alert(data.msg);
                            }
                        },
                        error: function () {
                            alert("网络繁忙，请重试");
                        }
                    });
                } else {
                    alert("支付未开通");
                }

            } else {
                $.iBox.success(data.msg);
            }
        },
        error: function () {
            $.iBox.error("网络繁忙，请重试");
        }
    });
}

function is_mobile(value) {
    var length = value.length;
    var reg = /^((1[3456789]{1}[0-9]{1})+\d{8})$/;
    return (length == 11 && reg.test(value));
};

function time() {
    if (wait == 0) {
        wait = 60;
        $("#getPcode").removeAttr("disabled");
        $("#getPcode").val("获取验证码");
        $("#getPcode").css("background", "#fff");
        $("#tipCode").fadeOut()
    } else {
        $("#getPcode").attr("disabled", "disabled");
        $("#getPcode").val("重新发送(" + wait + ")");
        $("#getPcode").css("background", "#ccc");
        var userPhone = $("#userPhone").val().trim();
        $("#tipCode").fadeIn().find('span').text(userPhone.replace(/^(\d{4})\d{4}(\d+)/, "$1****$2"));
        wait--;
        setTimeout(function () {
            time()
        }, 1000)
    }
};

function checkVcodePhone(pcode) {
    if (!check_length(pcode, 6, 6) || !is_numeric(pcode)) {
        alert("短信验证码为6个数字");
        $("#pcode").focus();
        return false;
    }
    return true;
};

function check_length(val, min, max) {
    if (is_null(val)) {
        if (min != 0) {
            return false;
        } else {
            return true;
        }
    } else {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
            if (val.charCodeAt(i) > 127 || val.charCodeAt(i) == 94) {
                len += 2;
            } else {
                len++;
            }
        }
        if (is_numeric(min) && len < min) {
            return false;
        }
        if (is_numeric(max) && len > max) {
            return false;
        }
    }
    return true;
};

function is_numeric(val) {
    if (is_null(val) || isNaN(val)) {
        return false;
    }
    return true;
};

function is_null(obj) {
    if (typeof(obj) == 'undefined' || obj == null || obj == '') {
        return true;
    }
    return false;
};

// 名字校验正则表达式
function isChineseChar(str) {
    var reg = /^[\u0391-\uFFE5]+$/;
    return reg.test(str);
}

$('.maskk,.pay-close').click(function () {
    $('.maskk').fadeOut();
    $('#form_paypsw').fadeOut();
});

// var _formPay = $('#form_paypsw');
// _formPay.validate({
//     rules: {
//         'payPassword_rsainput': {
//             'minlength': 6,
//             'maxlength': 6,
//             required: true,
//             digits: true,
//             numPassword: true,
//             echoNum: false
//         }
//     },
//     messages: {
//         'payPassword_rsainput': {
//             'required': '<i class="icon icon-attention icon-lg"></i>&nbsp;请填写支付密码',
//             'maxlength': '<i class="icon icon-attention icon-lg"></i>&nbsp;密码最多为{0}个字符',
//             'minlength': '<i class="icon icon-attention icon-lg"></i>&nbsp;密码最少为{0}个字符',
//             'digits': '<i class="icon icon-attention icon-lg"></i>&nbsp;密码只能为数字',
//             'numPassword': '<i class="icon icon-attention icon-lg"></i>&nbsp;连号不可用，相同数字不可用（如：123456，11111）',
//             'echoNum': '<i class="icon icon-attention icon-lg"></i>&nbsp;连号不可用，相同数字不可用（如：123456，11111）'
//         }
//     },
//     errorPlacement: function (error, element) {
//         element.closest('div[data-error="i_error"]').append(error);
//     },
//     // submitHandler: function (form) {
//     //     var _form = $(form);
//     //     form.submit();
//     // }
// });
//
// var payPassword = $("#payPassword_container"),
//     _this = payPassword.find('i'),
//     k = 0, j = 0,
//     password = '',
//     _cardwrap = $('#cardwrap');
// //点击隐藏的input密码框,在6个显示的密码框的第一个框显示光标
// payPassword.on('focus', "input[name='payPassword_rsainput']", function () {
//     var _this = payPassword.find('i');
//     if (payPassword.attr('data-busy') === '0') {
//         //在第一个密码框中添加光标样式
//         _this.eq(k).addClass("active");
//         _cardwrap.css('visibility', 'visible');
//         payPassword.attr('data-busy', '1');
//     }
// });
// //change时去除输入框的高亮，用户再次输入密码时需再次点击
// payPassword.on('change', "input[name='payPassword_rsainput']", function () {
//     _cardwrap.css('visibility', 'hidden');
//     _this.eq(k).removeClass("active");
//     payPassword.attr('data-busy', '0');
//
// }).on('blur', "input[name='payPassword_rsainput']", function () {
//     _cardwrap.css('visibility', 'hidden');
//     _this.eq(k).removeClass("active");
//     payPassword.attr('data-busy', '0');
//
// });
//
// //使用keyup事件，绑定键盘上的数字按键和backspace按键
// payPassword.on('keyup', "input[name='payPassword_rsainput']", function (e) {
//     var e = (e) ? e : window.event;
//     //键盘上的数字键按下才可以输入
//     if (e.keyCode == 8 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
//         k = this.value.length;//输入框里面的密码长度
//         var l = _this.size();//6
//         for (; l--;) {
//
//             //输入到第几个密码框，第几个密码框就显示高亮和光标（在输入框内有2个数字密码，第三个密码框要显示高亮和光标，之前的显示黑点后面的显示空白，输入和删除都一样）
//             if (l === k) {
//                 _this.eq(l).addClass("active");
//                 _this.eq(l).find('b').css('visibility', 'hidden');
//
//             } else {
//                 _this.eq(l).removeClass("active");
//                 _this.eq(l).find('b').css('visibility', l < k ? 'visible' : 'hidden');
//
//             }
//
//             if (k === 6) {
//                 j = 5;
//                 // console.log($('#payPassword_rsainput').val());
//             } else {
//                 j = k;
//             }
//             $('#cardwrap').css('left', j * 46 + 'px');
//
//         }
//     } else {
//         //输入其他字符，直接清空
//         var _val = this.value;
//         this.value = _val.replace(/\D/g, '');
//     }
// });
//

$('.mask2').click(function () {
   $('.stepTip-box').fadeOut();
   $('.mask2').fadeOut();
});
