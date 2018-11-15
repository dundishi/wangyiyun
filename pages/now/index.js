// pages/now/index.js
var Common = require('../../common')
var app = getApp()
Page({
  data: {
    id: 436514312,
    name: "",
    src: "",
    poster: "",
    author: "",
    isplaying: true,
    islyric: false,
    sumduration: 0,
    lyricobj: {},
    lyricArr: [],
    isadd: false,
    items: [
      { name: 'recent', value: '最近' },
      { name: 'like', value: '我的收藏' }
    ],
    percent: '100%'
  },
  addsong: function () {
    this.setData({
      percent: '0'
    })
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      percent: '100%'
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  showCircle: function () {
    this.setData({
      islyric: true,
      percent: '100%'
    })
  },
  showlyric: function () {
    this.setData({
      islyric: false,
      percent: '100%'
    })
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log('正在播放 onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    }),
      wx.setNavigationBarTitle({
        title: '正在播放'
      })
  },
  onShow: function () {
    var that = this;
    Common.asyncGetStorage('clickdata')//本地缓存
      .then(data => {
        console.log(data)
        if (!data) return;
        that.setData({
          id: data.id,
          name: data.name,
          src: data.mp3Url,
          poster: data.picUrl,
          author: data.singer
        })
        return Common.playMusic(data.mp3Url, data.name, data.picUrl);
      })
      .then(status => {
        if (!status) return;
        wx.hideLoading();
        return Common.getlyric(that.data.id)
      })
      .then((lyricArr) => {
        that.setData({
          lyricArr: lyricArr
        })
        return Common.getMusicData()
      })
  },
  audioPlay: function () {
    //背景音乐信息
    wx.getBackgroundAudioManager({
      success(res) {
        const status = res.status
        const dataUrl = res.dataUrl
        const currentPosition = res.currentPosition
        const duration = res.duration
        const downloadPercent = res.downloadPercent
        BackgroundAudioManager.play({
          dataUrl: dataUrl
        })
        BackgroundAudioManager.seek({
          position: currentPosition
        })
      }
    })
    this.setData({
      isplaying: true
    })
  },
  audioPause: function () {
    wx.pauseBackgroundAudio()
    this.setData({
      isplaying: false
    })
  },
  slider3change: function (e) {
    sliderToseek(e, function (dataUrl, cal) {
      wx.playBackgroundAudio({
        dataUrl: dataUrl
      })
      wx.seekBackgroundAudio({
        position: cal
      })
    })

  },
  prev: function () {
    prevSong(this)
  }
})
// 上一曲
function prevSong(that) {
  var id = that.data.id
  wx.getStorage({
    key: 'searchReault',
    success: function (res) {
      console.log(res.data)
      var currentSongIndex = res.data.findIndex((item) => {
        return item.id == id;
      })
      console.log(currentSongIndex)
      currentSongIndex--;
      console.log(res.data[currentSongIndex])
      wx.playBackgroundAudio({
        dataUrl: res.data[currentSongIndex].mp3Url
      })
      wx.switchTab({
        url: '../now/index'
      })

    }
  })
}
//滑动 歌曲快进
function sliderToseek(e, cb) {
  wx.getBackgroundAudioPlayerState({
    success: function (res) {
      var dataUrl = res.dataUrl
      var duration = res.duration
      var val = e.detail.value
      var cal = val * duration / 100
      cb && cb(dataUrl, cal);
    }
  })
}
