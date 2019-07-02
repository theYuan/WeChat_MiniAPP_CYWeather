const weatherColorMap = {
  'sunny': '#BCEE68',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

Page({
  data: {
    nowTemp: 0,
    nowWeather: "",
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    latitude: "",
    longitude: ""
  },

  onPullDownRefresh() {
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad(){
    this.qqmapsdk = new QQMapWX({
      key: 'ITMBZ-AFGH4-MD5UB-DAGB3-ONY4T-7SB5P'
    })
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
        this.setNow(result)
        this.setHourlyWeather(result)     
        this.setToday(result)
      },
        
      complete: ()=>{
        callback && callback()
      }
    })
  },
  // set current weather
  setNow(result){  
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
  },

  // set hourly weather forecast
  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push(
        {
          time: (nowHour + i * 3) % 24 + "h",
          iconPath: '/images/' + forecast[i].weather + '-icon.png',
          temp: forecast[i].temp + "°"
        }
      )
    }
    hourlyWeather[0].time = 'Now'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() +1 }-${date.getDate()} TODAY`
    })
  },

  onTapDayWeather(){
    wx.navigateTo({
      url: "/pages/list/list"
    })
  },

  onTapLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        //调用接口
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
          }
        });
      
      }
    })
  }
})

