// list.js
const dayMap = ['Sun','Mon','Tues','Wed','Thur','Fri','Sat'] 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekWeather: [1,2,3,4,5,6,7]
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getWeekWeather()
  },

  getWeekWeather(callback) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: '广州市',
        time: timestamp
      },

      success: res => {
        console.log(res)
        let result = res.data.result
        this.setWeekWeather(result)
      },

      complete: () => {
        callback && callback()
      }
    })
  },
  
  setWeekWeather(result){
    let weekWeather = []
    for (let i = 0; i < 7; i += 1) {
      let date = new Date()
      date.setDate(date.getDate()+i)
      weekWeather.push(
        {   day: dayMap[date.getDay()],
            date: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
            iconPath: '/images/' + result[i].weather + '-icon.png',
            temp: `${result[i].minTemp}° — ${result[i].maxTemp}°`
        }
      )
    }
    weekWeather[0].day = 'Today'
    this.setData({
      weekWeather
    })    
  }

})