//自调用函数

//#region 常量
const 设备Uid = 44110607986693;
//#endregion

//#region 共用函数
var _G = {};
_G.Status = {
    炉膛温度: 0,
    上区PV:0,
    中区PV:0,
    下区PV:0,
    上区SV:0,
    中区SV:0,
    下区SV:0,
    上区MV:0,
    中区MV:0,
    下区MV:0,
    上区起停:0,
    中区起停:0,
    下区起停:0,
    上区运行时间:0,
    中区运行时间:0,
    下区运行时间:0,
    中区加热X: false,
    真空泵X: false,
    冷风机X: false,
    //....更多其他参数
}
_G.stringToBoolean = function (str) {
    switch (str.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        // 可以根据需要添加更多 case
        default:
            return undefined; // 或者抛出错误，取决于你的需求
    }
}
_G.refreshCurrentStatus = function (keys) {
    $.ajax({
        type: "GET",
        url: "http://192.168.3.250:7790/biapiserver/getcurrentstatus",
        data: {
            equipmentUid: 设备Uid, // 设备的唯一标识符
            keys: keys // 需要获取的温度类型
        }, // Parameters to send
        dataType: "json",
        success: function (data) {
            console.log(data.Data)
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

            _G.refreshCurrentStatus(statusString);
        }

        // 每 1 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 使用新的数据更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
    });
})();
//#endregion

// 模块状态（定时器）
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const statuses = {
            [true]: '进行中',
            [false]: '停止',
        };

        // 更新页面中的模块状态
        function updateData(data) {
            // 更新加热状态
            // document.getElementById('heatingStatus').innerHTML = data.heatingStatus;
            document.getElementById('heatingStatus').innerHTML = statuses[_G.stringToBoolean(_G.Status.中区加热X)];

            // 更新真空泵状态
            document.getElementById('vacuumPumpStatus').innerHTML = statuses[_G.stringToBoolean(_G.Status.真空泵X)];

            // 更新对流风机状态
            document.getElementById('fanStatus').innerHTML = statuses[_G.stringToBoolean(_G.Status.冷风机X)];
        }

        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
    });
})();

// 炉膛温度、最高温度、最低温度（定时器）
(function () {

    // 定义一个函数，用于刷新温度
    function refreshCurrentTemperature() {
        document.getElementById('currentTemperature').innerHTML = `${_G.Status.炉膛温度}℃`;
    }


    // 定义一个函数，用于刷新最小和最大温度
    function refreshMinAndMaxTemperature() {
        // 使用ajax发送GET请求，获取指定时间范围内的最高和最低温度
        $.ajax({
            type: "GET",
            url: "http://192.168.3.250:7790/biapiserver/getminandmaxtemperatureintimerange",
            data: {
                equipmentUid: 设备Uid, // 设备的唯一标识符
                minDateTime: "2024-11-17 00:00:00", // 最小时间
                maxDateTime: "2024-11-19 00:00:00", // 最大时间
                keys: "炉膛温度" // 需要获取的温度类型
            }, // Parameters to send
            dataType: "json",
            success: function (data) {
                var obj = JSON.parse(data.Data)

                // 更新最高温度
                document.getElementById('maxTemperature').innerHTML = `${obj.MaxValue}℃`;

                // 更新最低温度
                document.getElementById('minTemperature').innerHTML = `${obj.MinValue}℃`;

            },
            error: function (error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // 当文档加载完成时执行
    document.addEventListener('DOMContentLoaded', () => {

        // 更新页面中的数据显示
        function updateData() {

            // 刷新当前温度
            refreshCurrentTemperature();
            // 刷新最小和最大温度
            refreshMinAndMaxTemperature();
        }

        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 使用新的数据更新页面上的显示
        }, 1000);  // 每 5 秒更新一次
    });

    refreshMinAndMaxTemperature(); // 初始化页面时立即更新一次温度
})();

// 实时区间（定时器）
(function () {

    // 更新页面中的数据
    function updateData() {
        // 更新上区
        document.getElementById('upPV').innerHTML = `${_G.Status.上区PV} <small>℃</small>`;
        document.getElementById('upSV').innerHTML = `${_G.Status.上区SV} <small>℃</small>`;
        document.getElementById('upOutput').innerHTML = `${_G.Status.上区MV} <small>%</small>`;
        document.getElementById('upTime').innerHTML = `${_G.Status.上区运行时间} <small>分钟</small>`;

        // 更新中区
        document.getElementById('midPV').innerHTML = `${_G.Status.中区PV} <small>℃</small>`;
        document.getElementById('midSV').innerHTML = `${_G.Status.中区SV} <small>℃</small>`;
        document.getElementById('midOutput').innerHTML = `${_G.Status.中区MV} <small>%</small>`;
        document.getElementById('midTime').innerHTML = `${_G.Status.中区运行时间} <small>分钟</small>`;

        // 更新下区
        document.getElementById('downPV').innerHTML = `${_G.Status.下区PV} <small>℃</small>`;
        document.getElementById('downSV').innerHTML = `${_G.Status.下区SV} <small>℃</small>`;
        document.getElementById('downOutput').innerHTML = `${_G.Status.下区MV} <small>%</small>`;
        document.getElementById('downTime').innerHTML = `${_G.Status.下区运行时间} <small>分钟</small>`;
    }

    document.addEventListener('DOMContentLoaded', () => {

        // // 模拟 API 返回的数据
        // function simulateAPI() {
        //     return {
        //         // 随机生成各区的 PV、SV、输出和时间数据
        //         upPV: Math.floor(Math.random() * (50 - 20 + 1)) + 20,  // 随机生成 20~50 之间的温度
        //         upSV: Math.floor(Math.random() * (50 - 30 + 1)) + 30,  // 随机生成 30~50 之间的温度
        //         upOutput: Math.floor(Math.random() * 100),  // 随机生成 0~100 之间的输出百分比
        //         upTime: Math.floor(Math.random() * (20 - 10 + 1)) + 10,  // 随机生成 10~20 之间的时间（分钟）

        //         midPV: Math.floor(Math.random() * (40 - 10 + 1)) + 10,  // 随机生成 10~40 之间的温度
        //         midSV: Math.floor(Math.random() * (40 - 20 + 1)) + 20,  // 随机生成 20~40 之间的温度
        //         midOutput: Math.floor(Math.random() * 100),  // 随机生成 0~100 之间的输出百分比
        //         midTime: Math.floor(Math.random() * (20 - 10 + 1)) + 10,  // 随机生成 10~20 之间的时间（分钟）

        //         downPV: Math.floor(Math.random() * (50 - 30 + 1)) + 30,  // 随机生成 30~50 之间的温度
        //         downSV: Math.floor(Math.random() * (50 - 40 + 1)) + 40,  // 随机生成 40~50 之间的温度
        //         downOutput: Math.floor(Math.random() * 100),  // 随机生成 0~100 之间的输出百分比
        //         downTime: Math.floor(Math.random() * (20 - 10 + 1)) + 10,  // 随机生成 10~20 之间的时间（分钟）
        //     };
        // }

        // // 更新页面中的数据
        // function updateData(data) {
        //     // 更新上区
        //     document.getElementById('upPV').innerHTML = `${data.upPV} <small>℃</small>`;
        //     document.getElementById('upSV').innerHTML = `${data.upSV} <small>℃</small>`;
        //     document.getElementById('upOutput').innerHTML = `${data.upOutput} <small>%</small>`;
        //     document.getElementById('upTime').innerHTML = `${data.upTime} <small>分钟</small>`;

        //     // 更新中区
        //     document.getElementById('midPV').innerHTML = `${data.midPV} <small>℃</small>`;
        //     document.getElementById('midSV').innerHTML = `${data.midSV} <small>℃</small>`;
        //     document.getElementById('midOutput').innerHTML = `${data.midOutput} <small>%</small>`;
        //     document.getElementById('midTime').innerHTML = `${data.midTime} <small>分钟</small>`;

        //     // 更新下区
        //     document.getElementById('downPV').innerHTML = `${data.downPV} <small>℃</small>`;
        //     document.getElementById('downSV').innerHTML = `${data.downSV} <small>℃</small>`;
        //     document.getElementById('downOutput').innerHTML = `${data.downOutput} <small>%</small>`;
        //     document.getElementById('downTime').innerHTML = `${data.downTime} <small>分钟</small>`;
        // }

        // // 每 5 秒钟模拟一次 API 调用并更新数据
        // setInterval(() => {
        //     const newData = simulateAPI();  // 获取新的数据
        //     updateData(newData);  // 更新页面上的显示
        // }, 1000);  // 每 5 秒更新一次

        // 每 5 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 1000);  // 每 5 秒更新一次
    });
    updateData();
})();

// 温度折线图（定时器）
(function () {
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
                color: '#0047f8'  // 标签的颜色
            }
        }]
    };

    var myechart = echarts.init($('.line')[0]);  // 获取第一个图表容器并初始化图表
    myechart.setOption(option);  // 设置图表的配置项

    // 初始化时间和数据（模拟实时数据）
    var time = 0;  // 时间（单位：秒）
    var data = [];  // 实时数据数组

    // 模拟的温度数据生成函数（你可以将此部分替换为真实的温度数据）
    function getRealTimeData() {
        var newData = Math.floor(Math.random() * 100);  // 模拟一个温度数据
        var newTime = (time++ * 30) + "分";  // 模拟每隔30分钟更新一次时间
        return { time: newTime, value: newData };  // 返回一个新的时间和温度值
    }

    // 每隔1秒获取一次数据并更新图表
    setInterval(function () {
        var newData = getRealTimeData();  // 获取新的数据点
        option.xAxis.data.push(newData.time);  // 更新X轴数据（时间）
        option.series[0].data.push(newData.value);  // 更新Y轴数据（温度）

        // 保证图表显示的时间不会超过60个数据点
        if (option.xAxis.data.length > 30) {
            option.xAxis.data.shift();  // 删除最早的时间数据
            option.series[0].data.shift();  // 删除最早的温度数据
        }

        // 更新图表
        myechart.setOption(option);
    }, 1000);  // 每隔1秒更新一次数据

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
    });
})();

// 上区、中区、下区温度折线图（定时器）
(function () {
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
                color: '#0047f8'
            }
        }]
    };

    var myechart = echarts.init($('.line')[1]);
    myechart.setOption(option);

    // 模拟的温度数据生成函数
    function getRandomTemperature() {
        return Math.floor(Math.random() * 11) + 20;
    }

    var maxDataPoints = 30;  // 每个选项卡最大可见数据点
    var updateInterval = 1000;  // 更新间隔时间

    var data = {
        quarter: { xData: [], yData: [] },
        month: { xData: [], yData: [] },
        week: { xData: [], yData: [] }
    };
    var currentTab = 'quarter';

    // 初始化数据
    for (var i = 0; i < 12; i++) {
        Object.keys(data).forEach(key => {
            data[key].xData.push((i * 30) + "分");
            data[key].yData.push(getRandomTemperature());
        });
    }

    // 定时更新当前选项卡数据
    var time = 12;
    setInterval(function () {
        var newData = getRandomTemperature();
        var newTime = (time++ * 30) + "分";

        data[currentTab].xData.push(newTime);
        data[currentTab].yData.push(newData);

        // 确保数据不会超过 maxDataPoints
        if (data[currentTab].xData.length > maxDataPoints) {
            data[currentTab].xData.shift();
            data[currentTab].yData.shift();
        }

        // 更新图表
        option.xAxis.data = data[currentTab].xData;
        option.series[0].data = data[currentTab].yData;
        myechart.setOption(option);
    }, updateInterval);

    // 选项卡点击事件处理
    $('.Area').on('click', '.caption a', function () {
        var $this = $(this);
        $this.addClass('active').siblings('a').removeClass('active');
        currentTab = $this.attr('data-type');

        // 切换选项卡时加载对应数据
        option.xAxis.data = data[currentTab].xData;
        option.series[0].data = data[currentTab].yData;
        myechart.setOption(option);
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

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
    });
})();

//炉膛温度API
function ajax(type, url, params, callback) {
    // 创建ajax引擎对象
    let xhr = new XMLHttpRequest();

    if (type === "get") {
        // 配置请求方式和请求地址，不拼接参数
        xhr.open(type, url);
        // 发送请求
        xhr.send();
    } else {
        // 配置请求方式和请求地址
        xhr.open(type, url);
        // 设置请求头
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // 发送请求
        xhr.send(params);
    }

    // 监听状态变化和接收数据
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 处理数据
            callback(JSON.parse(xhr.responseText));
        }
    };
}

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