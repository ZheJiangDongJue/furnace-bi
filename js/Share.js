// 共用

//#region 常量
const 主数据库名称 = "ERPServerHongMao"
const IP = "192.168.3.31"
const 端口 = 7790
const 地址 = `${IP}:${端口}`;

const 设备id = 1;
const 设备Uid = 44110607986693;

const 输出调试信息 = false;

//#endregion

const enum_WatermarkType = {
    服务器无响应: Math.pow(2, 0),
    查询发生异常: Math.pow(2, 1),
}

//#region 共用函数
var _G = {};
_G.Watermarks = {};
_G.Status = {
    炉膛温度: 0,
    上区PV: 0,
    中区PV: 0,
    下区PV: 0,
    上区SV: 0,
    中区SV: 0,
    下区SV: 0,
    上区MV: 0,
    中区MV: 0,
    下区MV: 0,
    上区起停: 1,
    中区起停: 1,
    下区起停: 1,
    上区运行时间: 0,
    中区运行时间: 0,
    下区运行时间: 0,
    中区加热X: false,
    水泵X: false,
    冷风机X: false,
    //....更多其他参数
}
_G.StatusEx = {
    //特殊
    最低温度: 0,
    最高温度: 0,
    设备累积运行时间_秒: 0,
    设备总运行时间本次单次起始时间: null,
    加热状态改变的时间点: new Date(),
    最后启动时间_str: null,
    最后完整烧炉的启动时间_str: null,
    最后完整烧炉的结束时间_str: null,
    与Api的连接状态: false,
}
_G.isBoolean = function (value) {
    return typeof value === 'boolean';
};
_G.stringToBoolean = function (str) {
    if (str === undefined || str === null) {
        return false;
    }
    if (_G.isBoolean(str)) {
        return str; // 如果已经是布尔值，则直接返回
    }
    switch (str.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        // 可以根据需要添加更多 case
        default:
            return undefined; // 或者抛出错误，取决于你的需求
    }
};
_G.TimeLabelFormatter = function (value, index) {
    if (value === undefined) {
        return '';
    }
    //传入分钟数，返回n时n分
    var minute = value % 60;
    var hour = (value - minute) / 60;
    if (minute === 0) {
        return hour + '时';
    }
    return hour + '时' + minute + '分';
}
_G.获取N天前的现在 = function (n) {
    const now = new Date();
    now.setDate(now.getDate() - n);
    return now;
};
// _G.获取N天前的0时 = function (n) {
//     const now = _G.获取N天前的现在(n);
//     now.setHours(0, 0, 0, 0);
//     return now;
// };
_G.getCurrentFormattedTime = function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始计数，所以需要+1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
//转换时间格式字符串为时间字符串
_G.convertDateStrToFormatDateStr = function (date_str) {

    var date = new Date(date_str);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
//转换时间格式字符串为简单的时间字符串(24.12.18 11:11)
_G.convertDateStrToSimpleFormatDateStr = function (date_str) {

    var date = new Date(date_str);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year.toString().slice(-2)}.${month}.${day} ${hours}:${minutes}`;
};
//转换时间为时间字符串
_G.convertDateToFormatDateStr = function (date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
//秒转时分秒格式
_G.secondsToHms = function (seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return { 时: hours, 分: minutes, 秒: remainingSeconds };
};
//时分秒结构转字符串
_G.HmsToStr = function (hms, limitType) {
    //type 1秒 2分 3时
    var type = _G.HmsToMaxUnitType(hms);
    if (limitType != undefined) {
        type = limitType;
    }
    if (type == 3) {
        return { result: `${hms.时}时${hms.分}分${hms.秒}秒`, type: 3 };
    } else if (type == 2) {
        return { result: `${hms.分 + hms.时 * 60}分${hms.秒}秒`, type: 2 };
    } else if (type == 1) {
        return { result: `${hms.秒 + hms.时 * 3600 + hms.分 * 60}秒`, type: 1 };
    } else {
        return { result: `${hms.秒 + hms.时 * 3600 + hms.分 * 60}秒`, type: 1 };
    }
};
//时分秒结构转字符串
_G.HmsToMaxUnitType = function (hms) {
    //type 1秒 2分 3时
    if (hms.时 > 0) {
        return 3;
    } else if (hms.分 > 0) {
        return 2;
    } else {
        return 1;
    }
};
//计算从某个时间到现在的时间差(秒)
_G.GetTimeDiff = function (time) {
    var timeDiff = Math.floor((new Date().getTime() - new Date(time).getTime()) / 1000);
    return timeDiff;
}
//刷新当前状态
_G.refreshCurrentStatus = function (keys) {

    var 中区加热 = _G.stringToBoolean(_G.Status.中区加热X);
    //如果加热状态改变时间点离现在已经有5分钟了,且当前加热状态是false,则清空设备总运行时间
    if (_G.GetTimeDiff(_G.StatusEx.加热状态改变的时间点) > (5 * 60) && 中区加热 == false) {
        _G.StatusEx.设备累积运行时间_秒 = 0;
    }

    // if (_G.StatusEx.最后启动时间_str == null) {
    //     _G.Status.中区加热X = false;
    //     _G.Status.水泵X = false;
    //     _G.Status.冷风机X = false;
    //     return;
    // }

    $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getcurrentstatus`,
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            keys: keys // 需要获取的温度类型
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            if (输出调试信息 === true) {
                console.log(data.Data)
            }
            var obj = JSON.parse(data.Data)

            let result = keys.split(",");
            for (let i = 0; i < result.length; i++) {
                var 拉取的数据 = obj[result[i]]
                //判断中区加热X变更
                if (result[i] == "中区加热X") {
                    var 中区加热 = _G.stringToBoolean(_G.Status.中区加热X);
                    var 拉取的中区加热 = _G.stringToBoolean(拉取的数据);
                    if (拉取的中区加热 != 中区加热) {
                        _G.StatusEx.加热状态改变的时间点 = new Date();
                        if (拉取的中区加热) {
                            //中区加热开启
                            if (_G.StatusEx.设备总运行时间本次单次起始时间 == null) {
                                _G.StatusEx.设备总运行时间本次单次起始时间 = new Date();
                            }
                        } else {
                            //中区加热关闭
                            //_计算单次运行时间
                            _G.StatusEx.设备累积运行时间_秒 += _G.GetTimeDiff(_G.StatusEx.设备总运行时间本次单次起始时间);
                            _G.StatusEx.设备总运行时间本次单次起始时间 = null;
                        }
                    }
                }
                _G.Status[result[i]] = 拉取的数据;
            }
        },
        error: function (error) {
            console.error("Error fetching data:", error);

            // 如果连接失败，则设置与Api的连接状态为false
            _G.StatusEx.与Api的连接状态 = false;
        }
    });
};
_G.获取最后完整烧炉的启动时间 = function () {
    $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getlaststarttime`,
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            afterDateTime: _G.getCurrentFormattedTime()
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            if (data === null) {
                _G.StatusEx.最后完整烧炉的启动时间_str = null;
                return;
            }

            _G.StatusEx.最后完整烧炉的启动时间_str = _G.convertDateStrToFormatDateStr(data);

            _G.获取最后完整烧炉的结束时间();
        },
        error: function (error) {
            console.error("Error fetching data:", error);
        }
    });
};
_G.获取最后启动时间 = function () {
    $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getlastopendatetime`,
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            condition: "ParameterName='中区加热X'" // 需要获取的温度类型
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            _G.StatusEx.与Api的连接状态 = true;

            if (data === null) {
                _G.StatusEx.最后启动时间_str = null;
                return;
            }

            _G.StatusEx.最后启动时间_str = _G.convertDateStrToFormatDateStr(data);
        },
        error: function (error) {
            _G.StatusEx.与Api的连接状态 = false;
            console.error("Error fetching data:", error);
        }
    });
};
_G.获取最后完整烧炉的结束时间 = function () {
    if (_G.StatusEx.最后完整烧炉的启动时间_str == null) {
        return;
    }
    $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getfirstendtimeafter`,
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            afterDateTime: _G.StatusEx.最后完整烧炉的启动时间_str
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            _G.StatusEx.最后完整烧炉的结束时间_str = _G.convertDateStrToFormatDateStr(data);
        },
        error: function (error) {
            console.error("Error fetching data:", error);
        }
    });
};
//刷新最大最小温度
_G.refreshMinAndMaxTemperature = function () {
    // 定义一个函数，用于刷新最小和最大温度
    if (_G.StatusEx.最后启动时间_str == null) {
        return;
    }

    // 使用ajax发送GET请求，获取指定时间范围内的最高和最低温度
    $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getminandmaxvalueintimerange`,
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            minDateTime: _G.StatusEx.最后启动时间_str, // 最小时间
            maxDateTime: _G.getCurrentFormattedTime(), // 最大时间
            temperatureKey: "炉膛温度" // 需要获取的温度类型
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            var obj = JSON.parse(data.Data)

            _G.StatusEx.最低温度 = obj.MinValue;
            _G.StatusEx.最高温度 = obj.MaxValue;
        },
        error: function (error) {
            console.error("Error fetching data:", error);
        }
    });
};
//#endregion

// 页面布局
(function () {
    // 1、页面一加载就要知道页面宽度计算
    var setFont = function () {
        // 因为要定义变量可能和别的变量相互冲突，污染，所有用自调用函数
        var html = document.documentElement;// 获取html
        // 获取宽度
        var width = html.clientWidth;

        // 判断
        if (width < 1024) width = 1024
        if (width > 1920) width = 1920
        // 设置html的基准值
        var fontSize = width / 80 + 'px';
        // 设置给html
        html.style.fontSize = fontSize;
    }
    // var refreshViewport = function () {
    //     // 获取新的视口大小
    //     const newViewportWidth = window.innerWidth;
    //     const newViewportHeight = window.innerHeight;

    //     console.log("新视口宽度:", newViewportWidth);
    //     console.log("新视口高度:", newViewportHeight);
    // }
    setFont();
    // 2、页面改变的时候也需要设置
    // 尺寸改变事件
    window.onresize = function () {
        setFont();
    }
})();

// 选项卡绑定
(function () {
    // 事件委托：为 .monitor 下的所有 <a> 标签绑定点击事件
    $('.monitor').on('click', ' a', function () {
        // 点击当前的 <a> 标签时，为它添加 'active' 类，移除同级兄弟元素的 'active' 类
        $(this).addClass('active').siblings().removeClass('active');

        // 获取当前点击的 <a> 标签的索引值
        var index = $(this).index();

        // 根据点击的索引值，显示对应的 .content 元素，同时隐藏其他 .content 元素
        $('.content').eq(index).show().siblings('.content').hide();
    });

    // 滚动效果
    // 原理：通过将 .marquee 下的所有子元素复制一遍并加入到原有的 .marquee 元素中，
    // 然后利用动画让内容向上滚动，滚动到一半时重新开始滚动。
    // 因为页面上可能有多个 .marquee 元素，所以需要遍历每个 .marquee 元素。
    $('.monitor .marquee').each(function (index, dom) {
        // 获取当前 .marquee 元素的所有子元素并复制一份
        var rows = $(dom).children().clone();

        // 将复制的内容追加到原 .marquee 元素的末尾
        $(dom).append(rows);
    });
})();

//#region 全局定时器
(function () {
    _G.Watermarks = {};
    _G.Watermarks.temperature_watermark = {
        blockid: "temperature_watermark",
        textid: "temperature_watermark_text",
        text: "",
        showTag: 0,
    }
    _G.Watermarks.region_temperature_watermark = {
        blockid: "region_temperature_watermark",
        textid: "region_temperature_watermark_text",
        text: "",
        showTag: 0,
    }
    _G.Watermarks.connect_watermark = {
        blockid: "connect_watermark",
        textid: "connect_watermark_text",
        text: "",
        showTag: 0,
    }

    // 当文档加载完成时执行
    document.addEventListener('DOMContentLoaded', () => {

        // 更新页面中的数据显示
        function updateData() {
            // 定义一个数组
            let statusArray = Object.keys(_G.Status);

            // 使用 join 方法将数组元素拼接成一个字符串，元素之间用逗号分隔
            let statusString = statusArray.join(",");

            _G.获取最后启动时间();
            _G.获取最后完整烧炉的启动时间();
            _G.refreshCurrentStatus(statusString);
            // 刷新最小和最大温度
            _G.refreshMinAndMaxTemperature();

            // 在获取最后启动时间中有更新连接状态
            // 判断是否连接并设置所有watermark的元素的显示状态(为防止卡顿,当连接状态改变时才更新)
            if (_G.StatusEx.与Api的连接状态 != _G.StatusEx.与Api的连接状态_last) {
                _G.StatusEx.与Api的连接状态_last = _G.StatusEx.与Api的连接状态;
                if (_G.StatusEx.与Api的连接状态) {
                    Object.keys(_G.Watermarks).forEach(key => {
                        _G.Watermarks[key].showTag &= ~enum_WatermarkType.服务器无响应;
                    });
                } else {
                    Object.keys(_G.Watermarks).forEach(key => {
                        _G.Watermarks[key].showTag |= enum_WatermarkType.服务器无响应;
                    });
                }
            }

            // 更新watermark的显示状态
            Object.keys(_G.Watermarks).forEach(key => {
                // 设置各种情况下watermark的文本
                if (_G.Watermarks[key].showTag & enum_WatermarkType.服务器无响应) {
                    _G.Watermarks[key].text = "服务器无响应";
                }
                if (_G.Watermarks[key].showTag & enum_WatermarkType.查询发生异常) {
                    _G.Watermarks[key].text = "查询发生异常";
                }
            });

            // 显示或者隐藏watermark
            Object.keys(_G.Watermarks).forEach(key => {
                // 只要showTag>0就显示
                if (_G.Watermarks[key].showTag > 0) {
                    $(`#${_G.Watermarks[key].blockid}`).show();
                    $(`#${_G.Watermarks[key].textid}`).text(_G.Watermarks[key].text);
                } else {
                    $(`#${_G.Watermarks[key].blockid}`).hide();
                    $(`#${_G.Watermarks[key].textid}`).text("");
                }
            });
        }

        // 每 1 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 使用新的数据更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
        updateData();
    });
})();
//#endregion
