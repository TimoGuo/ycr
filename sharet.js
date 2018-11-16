(function($){
    $(function(){

        //倒计时
//         var countDown = $('#times').text();
//         $('.countdown').downCount({
//             date: countDown,
//             offset: +10
//         }, function () {
//             //alert('倒计时结束!');
//         });

        //轮播图片
//         var imgList = $("#imgList").val().split(",");
var imgList = ['http://pic8.nipic.com/20100719/3320946_123936081858_2.jpg',
               'http://img3.redocn.com/tupian/20150106/aixinxiangkuang_3797284.jpg']
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

//         var add = $('#datAdd').val();
//         var map = new BMap.Map("allmap");
//         var point = new BMap.Point(add.split('.')[0], add.split(',')[1]);
//         map.centerAndZoom(point,12);
//         var geoc = new BMap.Geocoder();
//         geoc.getLocation(point, function(rs){
//             var addComp = rs.addressComponents;
//            // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
//             document.getElementById("result").innerHTML += addComp.city + ", " + addComp.district;
//         });


        //立即购买
        var st = true;
        $('.buy-btn a').click(function () {
            alert(111);
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


        $('.maskk,.pay-close').click(function () {
            $('.maskk').fadeOut();
            $('#form_paypsw').fadeOut();
        });

        $('.mask2').click(function () {
            $('.stepTip-box').fadeOut();
            $('.mask2').fadeOut();
        });

    });
})(jQuery);

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

var wait = 60;
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


