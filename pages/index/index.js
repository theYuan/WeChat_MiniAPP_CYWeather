const weatherColorMap = {
  'sunny': '#BCEE68',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data: {
    nowTemp: 0,
    nowWeather: "",
    nowWeatherBackground: "",
    forecast: []
  },

  onPullDownRefresh() {
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad(){
    this.getNow()
  },
  
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市'
      },
      success: res => {
        console.log(res)
        let result = res.data.result
        let temp = result.now.temp
        let weather = result.now.weather
        console.log(temp, weather)
        this.setData({
          nowTemp: temp,
          nowWeather: weather,
          nowWeatherBackground: '/images/' + weather + '-bg.png',
        })
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: weatherColorMap[weather],
          })

        //set forecast
        let nowHour = new Date().getHours()
        let forecast = []
        for (let i =0; i<24; i+=3){
          forecast.push(
            {
              time:(nowHour+i)%24,
              iconPath: '/images/'+ weather +'-icon.png',
              temp: temp
            }
          )
        }
        forecast[0].time = 'Now'
        this.setData({
          forecast: forecast
        })
                       
      },
      complete: ()=>{
        callback && callback()
      }
    })
  }
})
