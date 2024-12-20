function 测试(params) {
  console.log(params);
}

async function 获取最后启动时间test() {
  try {
    const response = await $.ajax({
      type: "GET",
      url: `http://${地址}/biapiserver/getlastopendatetime`,
      data: {
        equipmentUid: 设备Uid, // 设备的唯一标识符
        condition: "ParameterName='中区加热X'", // 需要获取的温度类型
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
      },
    }).then((data) => data);
    // 处理 response 数据
    console.log(response);
  } catch (error) {
    // 处理错误
    console.error(error);
  }
}
