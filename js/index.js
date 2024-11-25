//自调用函数

//#region 常量
const 主数据库名称 = "PEM1"
const IP = "192.168.3.250"
const 端口 = 7790
const 地址 = `${IP}:${端口}`;

const 设备id = 13;
const 设备Uid = 44110607986693;
const 默认上次获取的最后时间 = '2024-01-01 00:00:00'

const 输出调试信息 = false;
const globalOption = {
    useTimeModeForChart: 0,  // 0:以分秒推进，1:以分钟推进
}

//#endregion

//#region 共用函数
var _G = {};
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
    真空泵X: false,
    冷风机X: false,
    //....更多其他参数
}
_G.StatusEx = {
    //特殊
    最低温度: 0,
    最高温度: 0,
    最后启动时间_str: null
}
_G.isBoolean = function (value) {
    return typeof value === 'boolean';
};
_G.stringToBoolean = function (str) {
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
//刷新当前状态
_G.refreshCurrentStatus = function (keys) {
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
                _G.Status[result[i]] = obj[result[i]];
            }
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

            if (data === null) {
                _G.StatusEx.最后启动时间_str = null;
                return;
            }

            _G.StatusEx.最后启动时间_str = _G.convertDateStrToFormatDateStr(data);
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

    // 当文档加载完成时执行
    document.addEventListener('DOMContentLoaded', () => {

        // 更新页面中的数据显示
        function updateData() {
            // 定义一个数组
            let statusArray = Object.keys(_G.Status);

            // 使用 join 方法将数组元素拼接成一个字符串，元素之间用逗号分隔
            let statusString = statusArray.join(",");

            _G.获取最后启动时间();
            _G.refreshCurrentStatus(statusString);
            // 刷新最小和最大温度
            _G.refreshMinAndMaxTemperature();
        }

        // 每 1 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 使用新的数据更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
        updateData();
    });
})();
//#endregion

// 模块状态（定时器）
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const statuses = {
            true: { text: '进行中', color: '#00CC00' },  // 状态为 true 时
            false: { text: '停止', color: '#FF0000' }      // 状态为 false 时
        };

        // 更新页面中的模块状态
        function updateData(data) {
            // 更新加热状态
            const heatingStatusElement = document.getElementById('heatingStatus');
            const heatingStatus = statuses[_G.stringToBoolean(_G.Status.中区加热X)];
            heatingStatusElement.innerHTML = heatingStatus.text;
            heatingStatusElement.style.color = heatingStatus.color;

            // 更新真空泵状态
            const vacuumPumpStatusElement = document.getElementById('vacuumPumpStatus');
            const vacuumPumpStatus = statuses[_G.stringToBoolean(_G.Status.真空泵X)];
            vacuumPumpStatusElement.innerHTML = vacuumPumpStatus.text;
            vacuumPumpStatusElement.style.color = vacuumPumpStatus.color;

            // 更新对流风机状态
            const fanStatusElement = document.getElementById('fanStatus');
            const fanStatus = statuses[_G.stringToBoolean(_G.Status.冷风机X)];
            fanStatusElement.innerHTML = fanStatus.text;
            fanStatusElement.style.color = fanStatus.color;
        }

        // 每 1 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 1000);
    });
})();


// 炉膛温度、最高温度、最低温度（定时器）
(function () {

    // 定义一个函数，用于刷新温度
    function refreshCurrentTemperature() {
        document.getElementById('currentTemperature').innerHTML = `${_G.Status.炉膛温度}℃`;
    }

    // 刷新页面上的最低和最高温度
    function refreshMinAndMaxTemperature() {

        // 更新最高温度
        document.getElementById('maxTemperature').innerHTML = `${_G.StatusEx.最高温度}℃`;

        // 更新最低温度
        document.getElementById('minTemperature').innerHTML = `${_G.StatusEx.最低温度}℃`;
    }

    // 当文档加载完成时执行
    document.addEventListener('DOMContentLoaded', () => {

        // 更新页面中的数据显示
        function updateData() {

            // 刷新当前温度
            refreshCurrentTemperature();

            // 刷新最低和最高温度
            refreshMinAndMaxTemperature();
        }

        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 使用新的数据更新页面上的显示
        }, 1000);  // 每 5 秒更新一次
    });
})();

// 实时区间（定时器）
(function () {

    function 转换状态文本(value) {
        let text = "";
        let colorClass = "";

        if (value == 0) {
            text = "进行";
            colorClass = "status-active";  // 给进行状态设置一个绿色的类
        } else if (value == 1) {
            text = "停止";
            colorClass = "status-inactive";  // 给停止状态设置一个红色的类
        } else {
            text = "未知";
            colorClass = "status-unknown";  // 给未知状态设置一个灰色的类
        }

        // 返回带有颜色的 HTML
        return `<span class="${colorClass}">${text}</span>`;
    }

    // 更新页面中的数据
    function updateData() {
        // 更新上区
        document.getElementById('upStatus').innerHTML = `${转换状态文本(_G.Status.上区起停)}`;
        document.getElementById('upPV').innerHTML = `${_G.Status.上区PV} <small>℃</small>`;
        document.getElementById('upSV').innerHTML = `${_G.Status.上区SV} <small>℃</small>`;
        document.getElementById('upOutput').innerHTML = `${_G.Status.上区MV} <small>%</small>`;
        document.getElementById('upTime').innerHTML = `${_G.Status.上区运行时间} <small>分钟</small>`;

        // 更新中区
        document.getElementById('midStatus').innerHTML = `${转换状态文本(_G.Status.中区起停)}`;
        document.getElementById('midPV').innerHTML = `${_G.Status.中区PV} <small>℃</small>`;
        document.getElementById('midSV').innerHTML = `${_G.Status.中区SV} <small>℃</small>`;
        document.getElementById('midOutput').innerHTML = `${_G.Status.中区MV} <small>%</small>`;
        document.getElementById('midTime').innerHTML = `${_G.Status.中区运行时间} <small>分钟</small>`;

        // 更新下区
        document.getElementById('downStatus').innerHTML = `${转换状态文本(_G.Status.下区起停)}`;
        document.getElementById('downPV').innerHTML = `${_G.Status.下区PV} <small>℃</small>`;
        document.getElementById('downSV').innerHTML = `${_G.Status.下区SV} <small>℃</small>`;
        document.getElementById('downOutput').innerHTML = `${_G.Status.下区MV} <small>%</small>`;
        document.getElementById('downTime').innerHTML = `${_G.Status.下区运行时间} <small>分钟</small>`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        // 每 5 秒钟更新一次数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
    });

    // 初次加载时更新一次数据
    updateData();
})();

//#region 中间区域

//#region 明细列表
(function () {

    var 获取到的最后时间 = { date: _G.convertDateToFormatDateStr(_G.获取N天前的现在(15)) };

    function createRow(data) {
        const newRow = document.createElement('div');
        newRow.className = 'row';
        var 区域;
        switch (data.FurnacePlacement) {
            case 1:
                区域 = "上区"
                break;
            case 2:
                区域 = "中区"
                break;
            case 3:
                区域 = "下区"
                break;
            default:
                区域 = "其他"
                break;
        }

        let newDateString = data.EquipmentStartTime.replace("T", " ");
        newRow.innerHTML = `
        <span class="col">${data.MaterialCode}</span>
        <span class="col">${data.MaterialName}</span>
        <span class="col">${data.MaterialSpecType}</span>
        <span class="col">${区域}</span>
        <span class="col">${newDateString}</span>
        <span class="icon-dot"></span>`;
        return newRow;
    }

    function clearContainer(parentId) {
        const parent = document.getElementById(parentId);
        if (parent) {
            parent.innerHTML = '';
        } else {
            console.error("ID 为 '" + parentId + "' 的元素未找到。");
        }
    }

    function insertRowAtBeginning(parentId, data) {
        const parent = document.getElementById(parentId);

        if (!parent) {
            console.error("ID 为 '" + parentId + "' 的元素未找到。");
            return;
        }

        // 使用 insertBefore 将新行插入到第一个子元素之前
        parent.insertBefore(createRow(data), parent.firstChild);
    }

    function appendRowTemplate(parentId, data) {
        const parent = document.getElementById(parentId);

        if (!parent) {
            console.error("Element with ID '" + parentId + "' not found.");
            return;
        }

        parent.appendChild(createRow(data));
    }


    // 定义一个函数，用于获取最近审批的明细数据
    function getLastDetailOfThisDevice() {
        $.ajax({
            type: "GET",
            url: `http://${地址}/biapiserver/getlastdetailofthisdevice`,
            data: {
                dbName: 主数据库名称, // 需要获取的温度类型
                equipmentid: 设备id, // 设备的唯一标识符
                lastTime: 获取到的最后时间.date,
            }, // Parameters to send
            dataType: "json",
            success: function (data) {
                var obj = JSON.parse(data.Data)

                if (输出调试信息 === true) {
                    console.log(obj)
                }

                for (var i = obj.length - 1; i >= 0; i--) {
                    insertRowAtBeginning('detail_list', obj[i]);
                }

                if (obj.length > 0) {
                    获取到的最后时间.date = obj[obj.length - 1].EquipmentStartTime.replace("T", " ");
                }
            },
            error: function (error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // 更新页面中的数据
    function updateData() {
        getLastDetailOfThisDevice(); // 获取最新的数据
    }

    document.addEventListener('DOMContentLoaded', () => {

        // // 每 5 秒钟模拟一次 API 调用并更新数据
        // setInterval(() => {
        //     const newData = simulateAPI();  // 获取新的数据
        //     updateData(newData);  // 更新页面上的显示
        // }, 1000);  // 每 5 秒更新一次

        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 5000);  // 每 5 秒更新一次
    });
    clearContainer("detail_list")
    updateData();
})();

//#endregion

//#endregion

// 温度折线图（定时器）
(function () {
    const default_count = 10;

    // 配置温度折线图的选项
    var option = {
        tooltip: {
            trigger: 'axis'  // 鼠标悬浮时显示提示框
        },
        xAxis: {
            type: 'category',
            data: [],  // 初始化为空，数据将动态更新
            axisTick: {
                show: false  // 不显示刻度线
            },
            axisLabel: {
                color: '#4c9bfd'  // X轴标签的颜色
            },
            axisLine: {
                show: false  // 不显示X轴的轴线
            },
            boundaryGap: false  // 不留白
        },
        yAxis: {
            type: 'value',  // Y轴显示数值
            axisTick: {
                show: false  // 不显示刻度线
            },
            axisLabel: {
                color: '#4c9bfd'  // Y轴标签的颜色
            },
            axisLine: {
                show: false  // 不显示Y轴的轴线
            },
            boundaryGap: false  // 不留白
        },
        legend: {
            textStyle: {
                color: '#4c9bfd'  // 图例的文本颜色
            },
            right: '10%'  // 图例位置在右侧
        },
        grid: {
            show: true,  // 显示网格
            top: '20%',  // 上边距
            left: '3%',  // 左边距
            right: '4%',  // 右边距
            bottom: '3%',  // 下边距
            borderColor: '#012f4a',  // 网格边框颜色
            containLabel: true  // 包含标签
        },
        series: [{
            name: '区间温度',  // 系列名称
            data: [],  // 数据数组，默认空
            type: 'line',  // 图表类型为折线图
            smooth: true,  // 平滑曲线
            itemStyle: {
                color: '#0047f8'  // 数据点的颜色
            },
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },  // 最大值标记
                    { type: 'min', name: 'Min' }   // 最小值标记
                ]
            },
            markLine: {
                data: [
                    { type: 'average', name: 'Avg' }  // 平均值标记
                ]
            },
            label: {
                show: true,  // 显示数据点的标签
                position: 'top',  // 标签位置在数据点上方
                color: '#4c9bfd'  // 标签的颜色
            }
        }]
    };
    // 初始化数据
    option.xAxis.data.push(0);
    option.series[0].data.push(0);

    var 上次获取的最后时间 = { date: 默认上次获取的最后时间 };  // 上次获取的最后时间

    // 获取更多温度数据
    function getMoreTemperature() {
        if (_G.StatusEx.最后启动时间_str == null) {
            return;
        }

        var count;  // 要获取的数据条数
        if (option.xAxis.data.length <= 1) {
            上次获取的最后时间.date = _G.StatusEx.最后启动时间_str;
            count = default_count;
        }
        else {
            count = 999;
        }
        $.ajax({
            type: "GET",
            url: `http://${地址}/biapiserver/getinfosintimerangeandcalctimespan`,
            data: {
                dbName: 主数据库名称, // 需要获取的温度类型
                equipmentUid: 设备Uid, // 设备的唯一标识符
                afterDateTime: 上次获取的最后时间.date,
                keys: '炉膛温度',
                fromTime: _G.StatusEx.最后启动时间_str,
                count: default_count,
            }, // Parameters to send
            dataType: "json",
            success: function (data) {
                var obj = JSON.parse(data.Data)

                if (输出调试信息 === true) {
                    console.log(obj)
                }

                //倒序追加数据到图表中
                for (let i = obj.length - 1; i >= 0; i--) {
                    const element = obj[i];

                    if (globalOption.useTimeModeForChart == 0) {
                        var hms = _G.secondsToHms(element.SecondSpan);
                        var r = _G.HmsToStr(hms, 2);
                        option.xAxis.data.push(r.result);
                        option.series[0].data.push(element.Value);
                    }
                    else if (globalOption.useTimeModeForChart == 1) {
                        var hms = _G.secondsToHms(element.SecondSpan);
                        // var timeType = _G.HmsToMaxUnitType(time);
                        var timeType;
                        var maxUnitType = _G.HmsToMaxUnitType(hms);
                        var result;
                        if (maxUnitType == 1) {
                            result = element.SecondSpan + "秒";
                            timeType = 1;
                        }
                        else {
                            result = Math.floor(element.SecondSpan / 60) + "分";
                            timeType = 2;
                        }
                        option.xAxis.data.push(result); // 更新X轴数据（时间）
                        option.series[0].data.push(element.Value); // 更新Y轴数据（温度）
                    }
                }

                // 保证图表显示的时间不会超过N个数据点
                while (option.xAxis.data.length > default_count) {
                    option.xAxis.data.shift(); // 删除最早的时间数据
                    option.series[0].data.shift();
                }

                //更新最小刻度
                if (option.series[0].data.length > 0) {
                    option.yAxis.min = Math.min.apply(null, option.series[0].data) - 1;
                }

                if (obj.length > 0) {
                    上次获取的最后时间.date = _G.convertDateStrToFormatDateStr(obj[0].GetTime.replace("T", " "));
                }
            },
            error: function (error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    var myechart = echarts.init($('.line')[0]);  // 获取第一个图表容器并初始化图表
    myechart.setOption(option);  // 设置图表的配置项

    // // 初始化时间和数据（模拟实时数据）
    // var time = 0;  // 时间（单位：秒）
    // var data = [];  // 实时数据数组

    // // 模拟的温度数据生成函数（你可以将此部分替换为真实的温度数据）
    // function getRealTimeData() {
    //     var newData = Math.floor(Math.random() * 100);  // 模拟一个温度数据
    //     var newTime = (time++ * 30) + "分";  // 模拟每隔30分钟更新一次时间
    //     return { time: newTime, value: newData };  // 返回一个新的时间和温度值
    // }

    // 每隔1秒获取一次数据并更新图表
    setInterval(function () {
        // var newData = getRealTimeData();  // 获取新的数据点
        getMoreTemperature()

        // 更新图表
        myechart.setOption(option);
    }, 1000);  // 每隔1秒更新一次数据
    getMoreTemperature()

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
    });
})();

// 上区、中区、下区温度折线图（定时器）
(function () {
    const maxDataPoints = 10;  // 每个选项卡最大可见数据点

    function getMoreTemperature(group, key, relativeTimeBaseValue) {
        $.ajax({
            type: "GET",
            url: `http://${地址}/biapiserver/getinfosintimerangeandcalctimespan`,
            data: {
                dbName: 主数据库名称, // 需要获取的温度类型
                equipmentUid: 设备Uid, // 设备的唯一标识符
                afterDateTime: group[key].上次获取的最后时间,
                keys: group[key].Keys,
                fromTime: relativeTimeBaseValue,
                count: maxDataPoints,
            }, // Parameters to send
            dataType: "json",
            success: function (data) {
                var obj = JSON.parse(data.Data)

                if (输出调试信息 === true) {
                    console.log(obj)
                }

                if (globalOption.useTimeModeForChart == 0) {
                    //倒序追加数据到图表中
                    for (let i = obj.length - 1; i >= 0; i--) {
                        const element = obj[i];
                        var hms = _G.secondsToHms(element.SecondSpan);
                        // var timeType = _G.HmsToMaxUnitType(time);
                        var r = _G.HmsToStr(hms, 2);
                        group[key].xData.push(r.result);
                        group[key].yData.push(element.Value);
                        // group[key].helperData.push({
                        //     timeType: timeType,
                        // });

                        group[key].最大单位 = r.type;
                    }
                }
                else if (globalOption.useTimeModeForChart == 1) {
                    //倒序追加数据到图表中
                    for (let i = obj.length - 1; i >= 0; i--) {
                        const element = obj[i];
                        var hms = _G.secondsToHms(element.SecondSpan);
                        // var timeType = _G.HmsToMaxUnitType(time);
                        var timeType;
                        var maxUnitType = _G.HmsToMaxUnitType(hms);
                        var result;
                        if (maxUnitType == 1) {
                            result = element.SecondSpan + "秒";
                            timeType = 1;
                        }
                        else {
                            result = Math.floor(element.SecondSpan / 60) + "分";
                            timeType = 2;
                        }
                        group[key].xData.push(result);
                        group[key].yData.push(element.Value);
                        // group[key].helperData.push({
                        //     timeType: timeType,
                        // });

                        group[key].最大单位 = timeType;
                    }
                }
                else {
                    //倒序追加数据到图表中
                    for (let i = obj.length - 1; i >= 0; i--) {
                        const element = obj[i];
                        var hms = _G.secondsToHms(element.SecondSpan);
                        // var timeType = _G.HmsToMaxUnitType(time);
                        group[key].xData.push(hms.Time);
                        group[key].yData.push(element.Value);
                        // group[key].helperData.push({
                        //     timeType: timeType,
                        // });

                        // group[key].最大单位 = timeType;
                    }
                }

                // if (obj.length == 0) {
                //     //没有获得任何数据也要添加一个,时间是当前时间,数值复制最后一个
                //     group[key].xData.push(_G.getCurrentFormattedTime());
                //     group[key].yData.push(group[key].yData[group[key].yData.length - 1]);
                // }

                // 确保数据不会超过 maxDataPoints
                while (group[key].xData.length > maxDataPoints) {
                    group[key].xData.shift();
                    group[key].yData.shift();
                    // group[key].helperData.shift();
                }

                // group[key].当前最大单位占用总个数 = 0;
                // for (let i = 0; i < group[key].helperData.length; i++) {
                //     const element = group[key].helperData[i];
                //     if (element.timeType) {
                //         group[key].当前最大单位占用总个数++;
                //     }
                // }

                if (obj.length > 0) {
                    group[key].上次获取的最后时间 = _G.convertDateStrToFormatDateStr(obj[0].GetTime.replace("T", " "));
                }
            },
            error: function (error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // 配置区域温度趋势图的选项
    var option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: [],
            axisTick: { show: false },
            axisLabel: { color: '#4c9bfd' },
            axisLine: { show: false },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            axisTick: { show: false },
            axisLabel: { color: '#4c9bfd' },
            axisLine: { show: false },
            boundaryGap: false
        },
        legend: {
            textStyle: { color: '#4c9bfd' },
            right: '10%'
        },
        grid: {
            show: true,
            top: '20%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            borderColor: '#012f4a',
            containLabel: true
        },
        series: [{
            name: '区间温度',
            data: [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#0047f8' },
            markPoint: { data: [{ type: 'max', name: 'Max' }, { type: 'min', name: 'Min' }] },
            markLine: { data: [{ type: 'average', name: 'Avg' }] },
            label: {
                show: true,
                position: 'top',
                color: '#4c9bfd'
            }
        }]
    };

    var myechart = echarts.init($('.line')[1]);
    myechart.setOption(option);

    // // 模拟的温度数据生成函数
    // function getRandomTemperature() {
    //     return Math.floor(Math.random() * 11) + 20;
    // }

    var data = {
        up: { xData: [], yData: [] },
        mid: { xData: [], yData: [] },
        down: { xData: [], yData: [] }
    };

    //#region 初始化data结构

    Object.keys(data).forEach(key => {
        data[key].Keys = "";
        data[key].xData = [];
        data[key].yData = [];
        data[key].helperData = [];
        data[key].上次获取的最后时间 = 默认上次获取的最后时间;
        data[key].最大单位 = 0;
        data[key].当前最大单位占用总个数 = 0;
    })

    data.up.Keys = "上区PV";
    data.mid.Keys = "中区PV";
    data.down.Keys = "下区PV";

    //#endregion

    var currentTab = 'up';

    // // 初始化数据
    // for (var i = 0; i < 12; i++) {
    //     Object.keys(data).forEach(key => {
    //         data[key].xData.push((i * 30) + "分");
    //         data[key].yData.push(getRandomTemperature());
    //     });
    // }

    // // 定时更新当前选项卡数据
    // var time = 12;
    // setInterval(function () {
    //     var newData = getRandomTemperature();
    //     var newTime = (time++ * 30) + "分";

    //     data[currentTab].xData.push(newTime);
    //     data[currentTab].yData.push(newData);

    //     // 确保数据不会超过 maxDataPoints
    //     while (data[currentTab].xData.length > maxDataPoints) {
    //         data[currentTab].xData.shift();
    //         data[currentTab].yData.shift();
    //     }

    //     // 更新图表
    //     option.xAxis.data = data[currentTab].xData;
    //     option.series[0].data = data[currentTab].yData;
    //     myechart.setOption(option);
    // }, 1000);

    //刷新图表数据
    function refreshChartOption() {
        option.xAxis.data = data[currentTab].xData;
        option.series[0].data = data[currentTab].yData;
        myechart.setOption(option);
    }

    setInterval(function () {
        if (_G.StatusEx.最后启动时间_str == null) {
            return;
        }

        Object.keys(data).forEach(key => {
            getMoreTemperature(data, key, _G.StatusEx.最后启动时间_str)
        })

        refreshChartOption();
    }, 1000);

    // 选项卡点击事件处理
    $('.Area').on('click', '.caption a', function () {
        var $this = $(this);
        $this.addClass('active').siblings('a').removeClass('active');
        currentTab = $this.attr('data-type');

        // 切换选项卡时加载对应数据
        refreshChartOption()
    });

    // 每隔6秒自动切换选项卡
    var index = 0;
    setInterval(function () {
        index++;
        if (index >= $('.Area .caption a').length) {
            index = 0;
        }
        $('.Area .caption a').eq(index).click();
    }, 6000);

    // 页面加载时触发第一个选项卡的点击事件
    $('.Area .caption a').first().click();

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
    });
})();

// 炉膛温度图列
(function () {
    var option = {
        series: [
            {
                type: 'pie',
                radius: ['130%', '150%'],  // 放大图形
                center: ['50%', '80%'],    // 往下移动  套住75%文字
                label: {
                    show: false,
                },
                startAngle: 180,
                hoverOffset: 0,  // 鼠标经过不变大
                data: [
                    {
                        value: 100,
                        itemStyle: { // 颜色渐变#00c9e0->#005fc1
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    { offset: 0, color: '#00c9e0' },
                                    { offset: 1, color: '#005fc1' }
                                ]
                            }
                        }
                    },
                    { value: 100, itemStyle: { color: '#12274d' } }, // 颜色#12274d

                    { value: 200, itemStyle: { color: 'transparent' } }// 透明隐藏第三块区域
                ]
            }
        ]
    };
    var myechart = echarts.init($('.gauge')[0]);
    myechart.setOption(option);

    function updateData() {
        if (_G.StatusEx.最高温度 == 0 || _G.StatusEx.最高温度 == undefined) return;
        var a = _G.StatusEx.炉膛温度 / _G.StatusEx.最高温度;
        var b = 1 - a;
        option.series[0].data[0].value = a * 200;
        option.series[0].data[1].value = b * 200;
        myechart.setOption(option);
    }
    updateData();

    document.addEventListener('DOMContentLoaded', () => {
        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            // updateData();  // 更新页面上的显示
        }, 1000);  // 每 5 秒更新一次
    });

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
    });
})();

// //炉膛温度API
// function ajax(type, url, params, callback) {
//     // 创建ajax引擎对象
//     let xhr = new XMLHttpRequest();

//     if (type === "get") {
//         // 配置请求方式和请求地址，不拼接参数
//         xhr.open(type, url);
//         // 发送请求
//         xhr.send();
//     } else {
//         // 配置请求方式和请求地址
//         xhr.open(type, url);
//         // 设置请求头
//         xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//         // 发送请求
//         xhr.send(params);
//     }

//     // 监听状态变化和接收数据
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             // 处理数据
//             callback(JSON.parse(xhr.responseText));
//         }
//     };
// }

// 调用 ajax 函数
// ajax("get", "http://192.168.3.250:7790/spiderapiserver/getsmmpricewithdaterange?dbName=PEM1&startDate=2024-10-01&endDate=2024-11-08", null, function (res) {
//     // 获取Status并显示在<h4>元素上
//     if (res && res.Status !== undefined) {
//         document.getElementById('status').textContent = `${res.Status}℃`;
//     }
// });

// ajax("get", "http://192.168.3.250:7790/biapiserver/getminandmaxtemperatureintimerange", {
//     equipmentUid : 设备Uid,
//     minDateTime:"2024-11-17 00:00:00",
//     maxDateTime:"2024-11-19 00:00:00",
//     keys:"炉膛温度"
// }, function (res) {
//     console.log(res)
// });