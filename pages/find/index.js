// pages/find/index.js
var app = getApp();
var sliderWidth = 96;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs:["个性推荐","歌单","主播电台","排行榜"],
    searchReault: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    inputShowed: false,
    inputVal: "",
    recommend:[]
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: (res)=> {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth)/3,
          sliderOffset: res.windowWidth / that.data.tabs.length * (that.data.activeIndex)
        });
      }
    }),
    wx.request({
      url:'http://neteasemusic.leanapp.cn/top/playlist',
      method: 'GET',
      success: (res)=> {
        var result = res.data.playlists
        that.setData({
          recommend: result
        });
      }
    })
  },
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },
  showInput: function() {
    this.setData({
      inputShowed: true
    })
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: true
    })
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    })
  },
  //获取当前歌曲
  tonow: function(event) {
    var songData = {
      id: event.currentTarget.dataset.id,
      name: event.currentTarget.dataset.name,
      mp3Url: event.currentTarget.dataset.src,
      picUrl: event.currentTarget.dataset.pic,
      singer: event.currentTarget.dataset.singer,
    }
    //将当前点击的歌曲保存到缓存中
    wx.setStorageSync ('clickdata', songData),
    wx.switchTab({
      url: '../now/index'
    })
  },
  inputTyping: function(e) {
    var that = this
    this.setData({
      inputVal : e.detail.value
    });
    wx.request({
      url: 'http://neteasemusic.leanapp.cn/search',
      data: {
        keywords: e.detail.value
      },
      method: 'GET',
      success: function(res) {
        var temp = []
        if(!res.data.result.songs){
          return ;
        }
        res.data.result.songs.forEach((song,index)=>{
          temp.push({
            id: song.id,
            name: song.name,                            
            mp3Url: song.mp3Url,
            picUrl: song.artists[0].picUrl,
            singer: song.artists[0].name
          })
          that.setData({
            searchReault: temp
          })
        })
        wx.setStorage({
          key: 'searchReault',
          data: temp
        })
      }
    })
  }
})