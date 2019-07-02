const weatherColorMap = {
  'sunny': '#BCEE68',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: 0,
    nowWeather: "",
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    latitude: "",
    longitude: "",
    city: "北京市",
    locationAuthType: UNPROMPTED,
  
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
    wx.getSetting({
      success: res =>{
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED:
          (auth===false)? UNAUTHORIZED:UNPROMPTED,
        })
          
        if(auth)
          this.getLocation()
        else
          this.getNow()
      }
    })
    this.getNow()
  },

  onShow(){
    wx.getSetting({
      success: res =>{
        let auth = res.authSetting['scope.userLocation']
        if(auth && this.data.locationAuthType !==AUTHORIZED){
          this.setData({
            //权限从无到有
            locationAuthType: AUTHORIZED
          })
          this.getLocation()
        }
        // 权限从有到无
      }
    })
  },
  
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },

      success: res => {
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
      url: "/pages/list/list?city=" + this.data.city
    })
  },

  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting()
    else
      this.getLocation()
  },  
    
  getLocation(){
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        var _this = this;
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            this.getNow()
          },

          fail: function (error) {
            this.setData({
              locationAuthType: UNAUTHORIZED
            })
          },

          complete: function (res) {
            console.log(res);
          }
        })

      }
    })
  }
})

