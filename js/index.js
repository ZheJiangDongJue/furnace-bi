(function () {
  var local_watermark_key = "connect_watermark";
  let scrollTimeline = gsap.timeline();
  var pause = false;

  // 延迟初始化 Swiper，确保页面元素已渲染
  setTimeout(() => {
    // 第一个 Swiper 实例 (垂直滚动)
    var swiper = new Swiper(".swiper-container", {
      direction: "vertical", // 设置垂直滚动
      slidesPerView: 3, // 每页展示3个卡片
      spaceBetween: 10, // 卡片之间的间距
      loop: true, // 启用无限循环
      autoplay: {
        delay: 1000, // 每1秒自动切换
        disableOnInteraction: false, // 禁用交互后停止自动播放
      },
      speed: 500, // 滑动的速度
    });

    // 获取并更新数据的操作
    function updateData() {
      $.ajax({
        type: "GET",
        url: `http://${地址}/biapiserver/getlastdetailofthisdevice`,
        data: {
          dbName: 主数据库名称,
          equipmentid: 设备id,
          lastTime: _G.convertDateToFormatDateStr(_G.获取N天前的现在(3)),
        },
        dataType: "json",
        success: function (data) {
          _G.Watermarks[local_watermark_key].showTag &=
            ~enum_WatermarkType.查询发生异常;
          var obj = JSON.parse(data.Data);
          var 最后启动时间_无论是否结束 =
            _G.StatusEx.最后启动时间_str ??
            _G.StatusEx.最后完整烧炉的启动时间_str;

          obj.forEach((element) => {
            var 单据设备启动时间 = new Date(element.EquipmentStartTime);
            var 最后启动时间 = new Date(_G.StatusEx.最后启动时间_str);
            var 最后完整烧炉的结束时间 = new Date(
              _G.StatusEx.最后完整烧炉的结束时间_str
            );
            var status = -1;
            if (最后启动时间_无论是否结束 == null) {
              status = -1; //...
            } else if (element.eedid == null) {
              status = 0; //未开始
            } else if (单据设备启动时间 < 最后完整烧炉的结束时间) {
              status = 2; //已完成
            } else if (单据设备启动时间 > 最后启动时间) {
              status = 1; //进行中
            }
            // else if(_G.StatusEx.最后完整烧炉的启动时间_str != null && _G.StatusEx.最后完整烧炉的启动时间_str > element.EquipmentStartTime){
            //     status = 1;//进行中
            // }
            // else {
            //     status = 1;//进行中
            // }
            else {
              status = 0; //未开始
            }
            element.status = status;
          });

          // 清空并重新加载数据
          clearContainer("detail_list");
          //   for (var i = obj.length - 1; i >= 0; i--) {
          //     insertRowAtBeginning("detail_list", obj[i]);
          //   }
          for (var i = 0; i < obj.length; i++) {
            insertRowAtBeginning("detail_list", obj[i]);
          }

          // 更新 Swiper 以确保新插入的元素可以正确滚动
          swiper.update();
          swiper.autoplay.start(); // 确保自动播放立即启动
          mySwiper.update(); // 更新新的 Swiper 实例
        },
        error: function (error) {
          console.error("Error fetching data:", error);
          _G.Watermarks[local_watermark_key].showTag |=
            enum_WatermarkType.查询发生异常;
        },
      });
    }

    // 清除容器内容
    function clearContainer(parentId) {
      const parent = document.getElementById(parentId);
      if (parent) {
        parent.innerHTML = "";
      } else {
        console.error("ID 为 '" + parentId + "' 的元素未找到。");
      }
    }

    // 插入新行
    function insertRowAtBeginning(parentId, data) {
      const parent = document.getElementById(parentId);
      if (!parent) {
        console.error("ID 为 '" + parentId + "' 的元素未找到。");
        return;
      }
      parent.insertBefore(createCard(data), parent.firstChild);
    }

    // 创建新卡片
    function createCard(data) {
      const newCard = document.createElement("div");
      newCard.className = "swiper-slide card"; // 添加 Swiper 卡片类
      var 区域;
      switch (data.FurnacePlacement) {
        case 1:
          区域 = "上区";
          break;
        case 2:
          区域 = "中区";
          break;
        case 3:
          区域 = "下区";
          break;
        default:
          区域 = "其他";
          break;
      }

      var status_str = "";
      var status_color = "";
      switch (data.status) {
        case -1:
          status_str = "计算中";
          status_color = "color-gray";
          break;
        case 0:
          status_str = "未开始";
          status_color = "color-red";
          break;
        case 1:
          status_str = "进行中";
          status_color = "color-orange";
          break;
        case 2:
          status_str = "已完成";
          status_color = "color-green";
          break;
        case 3:
          status_str = "已结案";
          status_color = "color-gray";
          break;
      }

      let newDateString = data.EquipmentStartTime.replace("T", " ");
      newDateString = _G.convertDateStrToSimpleFormatDateStr(newDateString);
      let endDateString = "";
      if (data.status == 2) {
        endDateString = data.EquipmentEndTime.replace("T", " ");
        endDateString = _G.convertDateStrToSimpleFormatDateStr(endDateString);
      }

      newCard.innerHTML = `<div class="swiper-slide">
                <div class="card-content">
                    <h3>${data.MaterialName}</h3>
                    <p><strong>区域:</strong> ${区域}</p>
                    <p><strong>状态:</strong> <span class="${status_color}">${status_str}</span></p>
                    <p><strong>开始时间:</strong> ${newDateString}</p>
                    <p><strong>完成时间:</strong> ${endDateString}</p>
                </div>
                </div>`;
      return newCard;
    }

    // 事件监听
    document.addEventListener("DOMContentLoaded", () => {
      var detail_list_view = document.getElementById("detail_list_view");

      detail_list_view.addEventListener("mouseenter", () => {
        pause = true;
        if (scrollTimeline) scrollTimeline.pause();
      });

      detail_list_view.addEventListener("mouseleave", () => {
        pause = false;
        if (scrollTimeline) scrollTimeline.play();
      });

      setInterval(() => {
        updateData();
      }, 5000);
    });

    // 初始化清空容器并加载数据
    clearContainer("detail_list");
    updateData();
  }, 500); // 延迟500ms后初始化 Swiper，确保内容完全加载
})();
