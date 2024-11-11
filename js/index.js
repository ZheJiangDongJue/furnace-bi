//自调用函数

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

// 温度折线图
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
})();

// 上区、中区、下区温度趋势
(function () {
    // 配置区域温度趋势图的选项
    var option = {
        tooltip: {
            trigger: 'axis'  // 鼠标悬浮时显示提示框
        },
        xAxis: {
            type: 'category',
            data: ['30分', '60分', '90分', '120分', '150分', '180分', '210分', '240分', '270分', '300分', '330分', '360分'], // X轴的数据（时间）
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

    var myechart = echarts.init($('.line')[1]);  // 获取第二个图表容器并初始化图表
    myechart.setOption(option);  // 设置图表的配置项

    // 不同区域的温度数据
    var data = {
        quarter: [228, 276, 265, 239, 223, 274, 255, 221, 267, 245, 237, 243],
        month: [266, 235, 210, 253, 271, 234, 229, 267, 280, 259, 218, 237],
        week: [271, 227, 252, 268, 230, 284, 239, 274, 242, 269, 230, 268]
    };

    // 选项卡点击事件处理
    $('.Area').on('click', '.caption a', function () {
        $(this).addClass('active').siblings('a').removeClass('active');  // 切换选项卡的激活状态
        var key = $(this).attr('data-type');  // 获取当前点击的选项卡类型
        var selectedData = data[key];  // 获取对应的数据
        option.series[0].data = selectedData;  // 更新图表数据
        myechart.setOption(option);  // 更新图表显示
    });

    // 每隔6秒自动切换选项卡
    var index = 0;
    var timer = setInterval(function () {
        index++;
        if (index >= $('.Area .caption a').length) {
            index = 0;
        }
        $('.Area .caption a').eq(index).click();
    }, 6000);

    // Trigger the first tab click to display the first data set on page load
    $('.Area .caption a').first().click();
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
ajax("get", "http://192.168.3.250:7790/spiderapiserver/getsmmpricewithdaterange?dbName=PEM1&startDate=2024-10-01&endDate=2024-11-08", null, function(res) {
    // 获取Status并显示在<h4>元素上
    if (res && res.Status !== undefined) {
        document.getElementById('status').textContent = `${res.Status}℃`;
    }
});
