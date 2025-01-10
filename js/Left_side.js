// 左侧区域

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
// 炉膛温度图列
(function () {
    var 半圆单位 = 400;

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
                        value: 0,  // 初始进度条为0
                        itemStyle: { // 颜色渐变#00c9e0->#005fc1
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 1,
                                y2: 0,
                                colorStops: [
                                    { offset: 0, color: '#00c9e0' },
                                    { offset: 1, color: '#f30a62' }
                                ]
                            }
                        }
                    },
                    { value: 半圆单位, itemStyle: { color: '#12274d' } }, // 颜色#12274d

                    { value: 半圆单位, itemStyle: { color: 'transparent' } }// 透明隐藏第三块区域
                ]
            }
        ]
    };

    var myechart = echarts.init($('.gauge')[0]);
    myechart.setOption(option);

    function updateData() {
        var 百分比 = (_G.Status.炉膛温度 - _G.StatusEx.最低温度) / (_G.StatusEx.最高温度 - _G.StatusEx.最低温度);
        // 判断是否是NaN
        if (isNaN(百分比)) {
            return;
        }
        var value = Math.round(百分比 * 半圆单位);
        var value2 = 半圆单位 - value;

        // 更新进度条
        option.series[0].data[0].value = value;
        option.series[0].data[1].value = value2;
        myechart.setOption(option);
    }

    updateData(); // 初始化进度条为0

    document.addEventListener('DOMContentLoaded', () => {
        // 每 1 秒钟模拟一次 API 调用并更新数据
        setInterval(() => {
            updateData();  // 更新页面上的显示
        }, 1000);  // 每 1 秒更新一次
    });

    // 监听窗口大小变化，自动调整图表尺寸
    window.addEventListener('resize', function () {
        myechart.resize();  // 调整图表大小
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

        // 如果连接状态为false，则设置为红色
        if (!_G.StatusEx.与Api的连接状态) {
            colorClass = "status-inactive";
            text = "访问失败";
        }

        // 返回带有颜色的 HTML
        return `<span class="${colorClass}">${text}</span>`;
    }

    // 更新页面中的数据
    function updateData() {
        if (_G.StatusEx.与Api的连接状态) {
            var span = _G.secondsToHms(_G.StatusEx.设备累积运行时间_秒 + _G.GetTimeDiff(_G.StatusEx.最后启动时间_str ?? new Date()));
            var deviceRunTime = _G.HmsToStr(span).result;

            // 检查元素是否存在
            var element = document.getElementById('device_run_time');
            if (element) {
                element.innerHTML = `设备总运行时间: ${deviceRunTime}`;
            }
        } else {
            // 检查元素是否存在
            var element = document.getElementById('device_run_time');
            if (element) {
                element.innerHTML = '访问失败';
            }
        }

        // 更新上区
        var upStatus = document.getElementById('upStatus');
        if (upStatus) upStatus.innerHTML = `${转换状态文本(_G.Status.上区起停)}`;

        var upPV = document.getElementById('upPV');
        if (upPV) upPV.innerHTML = `${_G.Status.上区PV} <small>℃</small>`;

        var upSV = document.getElementById('upSV');
        if (upSV) upSV.innerHTML = `${_G.Status.上区SV} <small>℃</small>`;

        var upOutput = document.getElementById('upOutput');
        if (upOutput) upOutput.innerHTML = `${_G.Status.上区MV} <small>%</small>`;

        var upTime = document.getElementById('upTime');
        if (upTime) upTime.innerHTML = `${_G.Status.上区运行时间} <small>分钟</small>`;

        // 更新中区
        var midStatus = document.getElementById('midStatus');
        if (midStatus) midStatus.innerHTML = `${转换状态文本(_G.Status.中区起停)}`;

        var midPV = document.getElementById('midPV');
        if (midPV) midPV.innerHTML = `${_G.Status.中区PV} <small>℃</small>`;

        var midSV = document.getElementById('midSV');
        if (midSV) midSV.innerHTML = `${_G.Status.中区SV} <small>℃</small>`;

        var midOutput = document.getElementById('midOutput');
        if (midOutput) midOutput.innerHTML = `${_G.Status.中区MV} <small>%</small>`;

        var midTime = document.getElementById('midTime');
        if (midTime) midTime.innerHTML = `${_G.Status.中区运行时间} <small>分钟</small>`;

        // 更新下区
        var downStatus = document.getElementById('downStatus');
        if (downStatus) downStatus.innerHTML = `${转换状态文本(_G.Status.下区起停)}`;

        var downPV = document.getElementById('downPV');
        if (downPV) downPV.innerHTML = `${_G.Status.下区PV} <small>℃</small>`;

        var downSV = document.getElementById('downSV');
        if (downSV) downSV.innerHTML = `${_G.Status.下区SV} <small>℃</small>`;

        var downOutput = document.getElementById('downOutput');
        if (downOutput) downOutput.innerHTML = `${_G.Status.下区MV} <small>%</small>`;

        var downTime = document.getElementById('downTime');
        if (downTime) downTime.innerHTML = `${_G.Status.下区运行时间} <small>分钟</small>`;

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

