// 右侧区域
// 温度折线图（定时器）
(function () {
    // 把温度折线图对应的watermark的key放到局部变量中
    var local_watermark_key = "temperature_watermark";

    // const default_count = 10;

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
                formatter: _G.TimeLabelFormatter,
                // formatter:"{value}",
                // backgroundColor: '#000',
                color: '#4c9bfd',  // X轴标签的颜色
                interval: (index, value) => {
                    const maxKey = Math.max(...Object.keys(option.series[0].data));
                    if (index === 0 || index === maxKey) {
                        return true;
                    }
                    //当刻度比其他刻度离maxKey更近时,隐藏当前刻度
                    if (Math.abs(maxKey - index) < 20) {
                        return false;
                    }
                    return value % 60 == 0 ? value : null;  // 每 60 分钟显示一个刻度
                }
            },
            axisLine: {
                show: false  // 不显示X轴的轴线
            },
            boundaryGap: false,  // 不留白
            min: 0,  // X轴的最小值
            max: 4 * 60,  // X轴的最大值
        },
        yAxis: {
            type: 'value',  // Y轴显示数值
            axisTick: {
                show: false  // 不显示刻度线
            },
            axisLabel: {
                color: '#4c9bfd',  // Y轴标签的颜色
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
                    // { type: 'min', name: 'Min' }   // 最小值标记
                ]
            },
            // markLine: {
            //     data: [
            //         { type: 'average', name: 'Avg' }  // 平均值标记
            //     ]
            // },
            label: {
                show: true,  // 显示数据点的标签
                position: 'top',  // 标签位置在数据点上方
                color: '#4c9bfd'  // 标签的颜色
            }
        }]
    };

    var 最后一次获取的时间 = { date: null };  // 最后一次获取的时间
    var isShowLastData = false;

    function getMoreTemperatureForAjax(data) {
        $.ajax({
            type: "GET",
            url: `http://${地址}/biapiserver/getinfosintimerangeandcalctimespan`,
            data: data, // Parameters to send
            dataType: "json",
            success: function (data) {
                // 查询成功了就移除watermark
                _G.Watermarks[local_watermark_key].showTag &= ~enum_WatermarkType.查询发生异常;

                var obj = JSON.parse(data.Data)

                if (输出调试信息 === true) {
                    console.log(obj)
                }

                for (let i = 0; i < obj.length; i++) {
                    const element = obj[i];
                    element.MinuteSpan = Number(element.MinuteSpan);
                    option.xAxis.data[element.MinuteSpan] = element.MinuteSpan;
                    option.series[0].data[element.MinuteSpan] = element.Value;
                }

                //取option.xAxis.data的key最大值
                const maxKey = Math.max(...Object.keys(option.series[0].data));
                for (let i = 0; i <= maxKey; i++) {
                    if (option.xAxis.data[i] === undefined) {
                        option.xAxis.data[i] = i;
                    }
                    if (i > -1 && option.series[0].data[i] === undefined) {
                        option.series[0].data[i] = option.series[0].data[i - 1];
                    }
                }

                //更新X轴最大刻度
                // option.xAxis.min = 0;
                // option.xAxis.max = 4 * 60;
                // option.xAxis.interval = 30; // 设置X轴间隔为30分钟
                // option.xAxis.axisLabel.interval = 30; // 设置X轴标签显示刻度

                // //更新最小刻度
                // if (option.series[0].data.length > 0) {
                //     option.yAxis.min = Math.min.apply(null, option.series[0].data) - 1;
                // }

                if (obj.length > 0) {
                    最后一次获取的时间.date = _G.convertDateStrToFormatDateStr(obj[0].GetTime.replace("T", " "));
                }
            },
            error: function (error) {
                console.error("Error fetching data:", error);
                // error了就设置watermark
                _G.Watermarks[local_watermark_key].showTag |= enum_WatermarkType.查询发生异常;
            }
        });
    }

    function getMoreTemperature() {
        if (_G.StatusEx.最后启动时间_str == null) {
            if (!isShowLastData) {
                // 清除旧数据
                option.series[0].data = [];
                option.xAxis.data = [];

                isShowLastData = true;
                getMoreTemperatureForAjax({
                    dbName: 主数据库名称, // 需要获取的温度类型
                    equipmentUid: 设备Uid, // 设备的唯一标识符
                    afterDateTime: _G.StatusEx.最后完整烧炉的启动时间_str,
                    keys: '炉膛温度',
                    fromTime: _G.StatusEx.最后完整烧炉的启动时间_str,
                    count: 99999,
                });
            }
            return;
        }
        else {
            if (isShowLastData) {
                isShowLastData = false;
                最后一次获取的时间.date = null; // 清空最后一次获取的时间
                // option.xAxis.data = [0];
                option.series[0].data = [0];
                return;
            }
        }

        if (最后一次获取的时间.date == null) {
            最后一次获取的时间.date = _G.StatusEx.最后启动时间_str;
            // option.xAxis.data = [0];
            // option.series[0].data = [0];

            for (let i = 0; i < 4 * 60; i++) {
                option.xAxis.data[i] = i; // 更新X轴数据（时间）说
            }
        }
        getMoreTemperatureForAjax({
            dbName: 主数据库名称, // 需要获取的温度类型
            equipmentUid: 设备Uid, // 设备的唯一标识符
            afterDateTime: 最后一次获取的时间.date,
            keys: '炉膛温度',
            fromTime: _G.StatusEx.最后启动时间_str,
            count: 99999,
        });
    }

    var myechart = echarts.init($('.line')[0]);  // 获取第一个图表容器并初始化图表
    myechart.setOption(option);  // 设置图表的配置项

    // 每隔1秒获取一次数据并更新图表
    setInterval(function () {
        // var newData = getRealTimeData();  // 获取新的数据点
        getMoreTemperature()

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
    // 把区域温度折线图对应的watermark的key放到局部变量中
    var local_watermark_key = "region_temperature_watermark";

    const maxDataPoints = 10;  // 每个选项卡最大可见数据点

    function getMoreTemperatureForAjax(group, key, data) {
        $.ajax({
            type: "GET",
            url: `http://${地址}/biapiserver/getinfosintimerangeandcalctimespan`,
            data: data, // Parameters to send
            dataType: "json",
            success: function (data) {
                // 查询成功了就移除watermark
                _G.Watermarks[local_watermark_key].showTag &= ~enum_WatermarkType.查询发生异常;

                var obj = JSON.parse(data.Data)

                if (输出调试信息 === true) {
                    console.log(obj)
                }

                for (let i = 0; i < obj.length; i++) {
                    const element = obj[i];
                    element.MinuteSpan = Number(element.MinuteSpan);
                    group[key].xData[element.MinuteSpan] = element.MinuteSpan;
                    group[key].yData[element.MinuteSpan] = element.Value;
                }

                //取group[key].xData的key最大值
                const maxKey = Math.max(...Object.keys(group[key].yData));
                for (let i = 0; i <= maxKey; i++) {
                    if (group[key].xData[i] === undefined) {
                        group[key].xData[i] = i;
                    }
                    if (i > -1 && group[key].yData[i] === undefined) {
                        group[key].yData[i] = group[key].yData[i - 1];
                    }
                }

                //更新X轴最大刻度
                // option.xAxis.min = 0;
                // option.xAxis.max = 4 * 60;
                // option.xAxis.interval = 30; // 设置X轴间隔为30分钟
                // option.xAxis.axisLabel.interval = 0; // 设置X轴标签显示所有刻度

                // //更新最小刻度
                // if (option.series[0].data.length > 0) {
                //     option.yAxis.min = Math.min.apply(null, option.series[0].data) - 1;
                // }

                if (obj.length > 0) {
                    group[key].最后一次获取的时间 = _G.convertDateStrToFormatDateStr(obj[0].GetTime.replace("T", " "));
                }
            },
            error: function (error) {
                console.error("Error fetching data:", error);
                // error了就设置watermark
                _G.Watermarks[local_watermark_key].showTag |= enum_WatermarkType.查询发生异常;
            }
        });
    }

    function getMoreTemperature(group, key, relativeTimeBaseValue) {
        if (_G.StatusEx.最后启动时间_str == null) {
            if (!group[key].isShowLastData) {
                // 清除旧数据
                group[key].xData = [];
                group[key].yData = [];

                group[key].isShowLastData = true;
                getMoreTemperatureForAjax(group, key, {
                    dbName: 主数据库名称, // 需要获取的温度类型
                    equipmentUid: 设备Uid, // 设备的唯一标识符
                    afterDateTime: _G.StatusEx.最后完整烧炉的启动时间_str,
                    keys: group[key].Keys,
                    fromTime: _G.StatusEx.最后完整烧炉的启动时间_str,
                    count: 99999,
                });
            }
            return;
        }
        else {
            if (group[key].isShowLastData) {
                group[key].isShowLastData = false;
                group[key].最后一次获取的时间 = null; // 清空最后一次获取的时间
                // option.xAxis.data = [0];
                option.series[0].data = [0];
                return;
            }
        }

        if (_G.StatusEx.最后启动时间_str == null) {
            return;
        }

        // 如果group[key].最后一次获取的时间为空
        if (group[key].最后一次获取的时间 == null) {
            // 将group[key].最后一次获取的时间设置为_G.StatusEx.最后启动时间_str
            group[key].最后一次获取的时间 = _G.StatusEx.最后启动时间_str;

            // group[key].xData = [0];

            // 将group[key].yData设置为[0]
            group[key].yData = [0];
        }
        getMoreTemperatureForAjax(group, key, {
            dbName: 主数据库名称, // 需要获取的温度类型
            equipmentUid: 设备Uid, // 设备的唯一标识符
            afterDateTime: group[key].最后一次获取的时间,
            keys: group[key].Keys,
            fromTime: relativeTimeBaseValue,
            count: 99999,
        });
    }

    // 配置区域温度趋势图的选项
    var option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: [],
            axisTick: { show: false },
            axisLabel: {
                formatter: _G.TimeLabelFormatter,
                color: '#4c9bfd',
                interval: (index, value) => {
                    const maxKey = Math.max(...Object.keys(option.series[0].data));
                    if (index === 0 || index === maxKey) {
                        return true;
                    }
                    //当刻度比其他刻度离maxKey更近时,隐藏当前刻度
                    if (Math.abs(maxKey - index) < 20) {
                        return false;
                    }
                    return value % 60 == 0 ? value : null;  // 每 60 分钟显示一个刻度
                }
            },
            axisLine: { show: false },
            boundaryGap: false,
            min: 0,  // X轴的最小值
            max: 4 * 60,  // X轴的最大值
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
            // markLine: { data: [{ type: 'average', name: 'Avg' }] },
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
        // data[key].xData = [0];
        data[key].yData = [0];
        // data[key].helperData = [];
        data[key].最后一次获取的时间 = null;
        data[key].isShowLastData = false;
        // data[key].最大单位 = 0;
        // data[key].当前最大单位占用总个数 = 0;
        for (let i = 0; i < 4 * 60; i++) {
            data[key].xData[i] = i; // 更新X轴数据（时间）说
        }
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