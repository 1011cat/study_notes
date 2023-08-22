import { Vue, Options } from "vue-class-component";
import localforage from "localforage";
import cornerstone from "cornerstone-core";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { useUserStore } from "../../../../store/user.js";
import { floor } from "lodash";

@Options({
  props: {},
  components: {},
})


export default class CornerStone extends Vue {
  canvasDom: HTMLCanvasElement = null
  box1Dom: HTMLCanvasElement = null
  box2Dom: HTMLCanvasElement = null
  box3Dom: HTMLCanvasElement = null
  box4Dom: HTMLCanvasElement = null
  db = null
  imageInfoDB = null
  imageFileDB = null
  storeName = 'dicomFileStore'
  allImageInfo = {}
  imageIds = []
  currentImageIndex = 0
  cleanCacheTimer = null
  showMultiCell = true
  downLoadImagesFlag = false
  highRequests = []
  downloadPersent = '0%'

  cache = []
  public userStore = useUserStore();
  public patientInfo = [];
  public cetusImgIds = []

  mounted(): void {
    // 500ms 等uhive添加#medContainer标签和this.userStore.patientInfo
    setTimeout(() => {
      this.initCornerstone()
      this.initLocalforage()
      this.initIndexDB('myIndexedDB')
    //   this.cacheImages(this.imageIds)
    }, 1000)
  }

  initIndexDB(dbName, version = 2) {
    if(this.db) return
    let indexedDB = window.indexedDB
    const req = indexedDB.open(dbName, version)
    req.onsuccess = (event: any) => {
      // 赋值数据库实例
      this.db = event.target.result
    }
    req.onupgradeneeded = (event: any) => {
      const db = event.target.result
      // 创建对象仓库
      db.createObjectStore(this.storeName, {
        keyPath: "name",
        autoIncrement: false
      })
    }
  }

  addData(data) {
    return new Promise((resolve, reject) => {
      const req = this.db.transaction([this.storeName], "readwrite")
      .objectStore(this.storeName)
      .add(data)
      req.addEventListener('success', e => {
        resolve(e.result || e.target.result)
      })
    })
    // this.db.transaction([this.storeName], "readwrite")
    // .objectStore(this.storeName)
    // .add(data)
  }

  addData1(filse) {
    return new Promise((resolve, reject) => {
      const trans = this.db.transaction([this.storeName], "readwrite")
      const store = trans.objectStore(this.storeName)
      filse.forEach(file => {
        store.add(file)
      })
      trans.oncomplete = (e) => {
        resolve(Date.now())
      }
    })
    // this.db.transaction([this.storeName], "readwrite")
    // .objectStore(this.storeName)
    // .add(data)
  }

  getData(name) {
    return new Promise((resolve, reject) => {
      const req = this.db.transaction([this.storeName], "readwrite")
      .objectStore(this.storeName)
      .get(name)
      req.addEventListener('success', e => {
        resolve(e.result || e.target.result)
      })
    })
  }

  initLocalforage() {
    // 专门存储影像序列信息，是否已经都缓存在indexedDB上
    this.imageInfoDB = localforage.createInstance({
      name: 'localforageDB',
      storeName: 'imageInfo',
    })
    this.imageFileDB = localforage.createInstance({
      name: 'localforageDB',
      storeName: 'imageFile',
    })
  }

  initCornerstone() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneTools.init({
      showSVGCursors: true,
    })
    this.canvasDom = document.querySelector("#medContainer")
    cornerstone.enable(this.canvasDom)
    // 注冊自定义imageLoader
    cornerstone.registerImageLoader('cetus', this.imageLoader)
    // cornerstone.imageCache.setMaximumSizeBytes(600000)
    // 设置cornerstone内存为100mb
    cornerstone.imageCache.setMaximumSizeBytes(83886080)
    // cornerstone.imageCache.setMaximumSizeBytes(524288000)
    // cornerstone.imageCache.setMaximumSizeBytes(85899345920)
    cornerstoneTools.init({
      showSVGCursors: true,
    })
    // cornerstoneWADOImageLoader.webWorkerManager.initialize({
    //   maxWebWorkers: navigator.hardwareConcurrency || 1,
    //   startWebWorkersOnDemand: true,
    //   taskConfiguration: {
    //       decodeTask: {
    //         loadCodecsOnStartup : false,
    //         initializeCodecsOnStartup: false,
    //       },
    //   },
    // })

    // 添加 stack 状态管理器
    cornerstoneTools.addStackStateManager(this.canvasDom, ["stack"])
  }

  async start() {
    this.showMultiCell = false
    const res = this.getImageInfoAndImageIds(this.userStore.patientInfo)
    this.allImageInfo = res.allImageInfo
    this.imageIds = res.imageIds
    // 添加 stack 状态管理器
    const stack = {
      currentImageIdIndex: 0,
      imageIds: this.imageIds,
      // preventCache: true
    }
    cornerstoneTools.clearToolState(this.canvasDom, "stack")
    cornerstoneTools.addToolState(this.canvasDom, "stack", stack)
    const StackScrollTool = cornerstoneTools.StackScrollTool
    const props = {
      configuration: {
        // 是否在序列内循环
        loop: true,
        // 是否跳帧
        allowSkipping: true
      }
    }
    cornerstoneTools.addTool(StackScrollTool, props)
    cornerstoneTools.setToolActive("StackScroll", { mouseButtonMask: 1 });
    // 判断该序列是否已经缓存
    const uid = this.userStore.patientInfo.StudyList[0].SeriesList[0].UID
    const isCacheImages = await this.checkSeriesListLoaded(uid)
    isCacheImages || this.cacheImages(this.imageIds)
    this.loadFistImage(this.canvasDom)
    // this.initCornerstone()
    // this.cacheImages(this.imageIds)
  }

  async multiStart() {
    this.showMultiCell = true
    this.box1Dom = document.querySelector("#box1")
    this.box2Dom = document.querySelector("#box2")
    this.box3Dom = document.querySelector("#box3")
    this.box4Dom = document.querySelector("#box4")
    cornerstone.enable(this.box1Dom)
    cornerstone.enable(this.box2Dom)
    cornerstone.enable(this.box3Dom)
    cornerstone.enable(this.box4Dom)
    cornerstoneTools.addStackStateManager(this.box1Dom, ["stack"])
    cornerstoneTools.addStackStateManager(this.box2Dom, ["stack"])
    cornerstoneTools.addStackStateManager(this.box3Dom, ["stack"])
    cornerstoneTools.addStackStateManager(this.box4Dom, ["stack"])
    const res = this.getImageInfoAndImageIds(this.userStore.patientInfo)
    this.allImageInfo = res.allImageInfo
    this.imageIds = res.imageIds
    // 添加 stack 状态管理器
    const stack = {
      currentImageIdIndex: 0,
      imageIds: this.imageIds,
      // preventCache: true
    }
    cornerstoneTools.clearToolState(this.box1Dom, "stack")
    cornerstoneTools.addToolState(this.box1Dom, "stack", stack)
    cornerstoneTools.clearToolState(this.box2Dom, "stack")
    cornerstoneTools.addToolState(this.box2Dom, "stack", stack)
    cornerstoneTools.clearToolState(this.box3Dom, "stack")
    cornerstoneTools.addToolState(this.box3Dom, "stack", stack)
    cornerstoneTools.clearToolState(this.box4Dom, "stack")
    cornerstoneTools.addToolState(this.box4Dom, "stack", stack)
    // 判断该序列是否已经缓存
    const uid = this.userStore.patientInfo.StudyList[0].SeriesList[0].UID
    const isCacheImages = await this.checkSeriesListLoaded(uid)
    isCacheImages || this.cacheImages(this.imageIds)
    this.loadFistImage(this.box1Dom)
    this.loadFistImage(this.box2Dom)
    this.loadFistImage(this.box3Dom)
    this.loadFistImage(this.box4Dom)
  }

  getImageInfoAndImageIds(patientInfo) {
    const allImageInfo = {}
    const imageIds = []
    let imageList = patientInfo.StudyList[0].SeriesList[0].ImageList
    imageList.forEach((item, index) => {
      const imageInfo: Record<string, string> = {}
      imageInfo.uid = item.UID
      imageInfo.imageId = "cetus:http://shenzhou.10.6.120.131.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=" + item.UID
      // imageInfo.imageId = "wadouri:http://shenzhou.10.6.120.131.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=" + item.UID
      imageInfo.instanceNum = index
      imageInfo.wandoImageId = "wadouri:http://shenzhou.10.6.120.131.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=" + item.UID
      allImageInfo[imageInfo.uid] = imageInfo
      imageIds.push(imageInfo.imageId)
    })
    return { allImageInfo, imageIds}
  }

  async loadFistImage(dom) {
    const uid = this.parseImageId(this.imageIds[0]).uid
    const imageInfo = this.allImageInfo[uid]
    let indexedDBCache = await this.imageFileDB.getItem(uid)
    if (indexedDBCache) {
      const image = await this.getImageFromIndexedDBCache(indexedDBCache)
      cornerstone.displayImage(dom, image)
    } else {
      this.cacheIndexedDB(imageInfo, (image) => {
        cornerstone.displayImage(dom, image)
      })
    }
  }

  cacheImages(imageIds) {
    const requests = []
    this.downLoadImagesFlag = true
    imageIds.forEach(async (imageId, index) => {
      const uid = this.parseImageId(imageId).uid
      const imageInfo = this.allImageInfo[uid]
      // TODO: 判断该文件是否已经缓存，缓存在内存还是在indexedDB
      // 这里先统一全部都缓存在indexedDB中
      // let indexedDBCache = await this.imageFileDB.getItem(imageInfo.uid)
      // let indexedDBCache = await this.getData(imageInfo.uid)
      // if (!indexedDBCache) {
        requests.push({
          imageInfo,
          requestFn:  this.cacheIndexedDB
        })
      // }
      if (index === imageIds.length -1 && requests.length > 0) {
        this.sendRequest(requests, 5, () => {
          this.imageInfoDB.setItem(this.userStore.patientInfo.StudyList[0].SeriesList[0].UID, true)
          this.downLoadImagesFlag = false
          console.log(6666666,  '下载缓存完毕')
        })
      }
    })

  }

  // 发送cetus请求
  sendRequest(requests, max, callback){
    let index = 0
    let arr = new Array(max).fill(null)
    arr = arr.map(() => {
      return new Promise((resolve) => {
        const run = () => {
          if(index >= requests.length) {
            resolve(null)
            return
          }
          let cur = index
          let requestInfo = requests[index++]
          this.downloadPersent = floor((index/requests.length) * 100) + '%'
          if (this.highRequests.length > 0) {
            let cb = this.highRequests[0].callback
            this.cacheIndexedDB(this.highRequests[0].imageInfo, (image) => {
              cb(image)
              this.highRequests.shift()
              run()
            })
          } else {
            requestInfo.requestFn(requestInfo.imageInfo, () => {
              run()
            })
          }
        }
        run()
      })
    })
    Promise.all(arr).then(() => callback())
  }

  async getImageFromIndexedDBCache(indexedDBCache) {
    const wandoImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(indexedDBCache)
    const image = await cornerstone.loadImage(wandoImageId)
    return image
  }

  // 下载并缓存到indexedDB中
  cacheIndexedDB(imageInfo, callback = null) {
      const _this = this
      // step1 先用WADOImageLoader下载cetus的dicom
      cornerstone.loadImage(imageInfo.wandoImageId).then((image) => {
        // 将影像的imageId换成我们自定义的cetus:开头的
        image.imageId = imageInfo.imageId
        // step2 将影像转换成file格式，存储到indexedDB中
        let file = new File([image.data.byteArray], imageInfo.uid)
        this.imageFileDB.setItem(imageInfo.uid, file).then(() => {
          if(imageInfo.imageId === this.imageFileDB[this.imageIds.length -1]) {
            this.downloadPersent = "回调完毕"
          }
        })
        // _this.addData(file)
        // step3 执行回调函数
        callback && callback(image)
      })
  }

  async checkSeriesListLoaded(uid) {
    return await this.imageInfoDB.getItem(uid)
  }


  parseImageId(imageId) {
    const uidIndex = imageId.indexOf('&OBJECTUID=')
    let uid = imageId.substring(uidIndex + 11)
    return { uid }
  }

  imageLoader(imageId) {
    const uid = this.parseImageId(imageId).uid
    const imageInfo = this.allImageInfo[uid]
    const promise = new Promise(async (resolve, reject) => {
      // TODO: 判断该文件是否在cornerstoneCache
      // 这里先只考虑i是否在ndexedDB
      if (this.downLoadImagesFlag) {
        this.highRequests.push({
          imageInfo,
          callback: (image) => {
            resolve(image)
          }
        })
      } else {
        let indexedDBCache = await this.imageFileDB.getItem(imageInfo.uid)
        // let indexedDBCache = await this.getData(imageInfo.uid)
        if(indexedDBCache) {
            const wandoImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(indexedDBCache)
            // cornerstone.loadImage(wandoImageId).then(function(image) {
            cornerstoneWADOImageLoader.wadouri.loadImage(wandoImageId).promise.then(function(image) {
              const i = wandoImageId.substring(wandoImageId.indexOf('dicomfile:') + 10)
              resolve(image)
              cornerstoneWADOImageLoader.wadouri.fileManager.remove(i)
              indexedDBCache = null
              image = null
            })
        } else {
          // TODO: 判断是存在cornerstone还是indexedDB
          // 这里先统一存储到indexedDB中
          if(this.downLoadImagesFlag) {
            this.highRequests.push({
              imageInfo,
              callback: (image) => {
                resolve(image)
              }
            })
          } else {
            this.cacheIndexedDB(imageInfo, (image) => {
              resolve(image)
            })
          }

        }
      }

    })
    return {
      promise
    }
  }

  public player = {
    isPlay: false,
    startPlay: (startIndex = this.currentImageIndex) => {
      this.player.isPlay = true
      cornerstone.loadImage('websocket:' + this.allImageInfo[startIndex])
    },
    stopPlay: () => {
      this.player.isPlay = false
    }
  }

  dicomWebSocket(e) {
      const _this = this
      console.log(55555555, cornerstone, cornerstone.imageCache.getCacheInfo())
      if (e.target.innerText === "播 放") {
        // let index = 0
        // const interval = setInterval(async () => {
        //   const uid = this.parseImageId(this.imageIds[index]).uid
        //   const imageInfo = this.allImageInfo[uid]
        //   const image = await cornerstone.loadImage(imageInfo.imageId)
        //   cornerstone.displayImage(this.canvasDom, image)
        //   index++
        // }, 100)
        // setTimeout(() => {
        //   clearInterval(interval)
        // }, 100000);
        if (this.showMultiCell) {
          cornerstoneTools.playClip(this.box1Dom, 60)
          cornerstoneTools.playClip(this.box2Dom, 60)
          cornerstoneTools.playClip(this.box3Dom, 60)
          cornerstoneTools.playClip(this.box4Dom, 60)
        } else {
          cornerstoneTools.playClip(this.canvasDom, 60)
        }

        this.cleanCacheTimer = setInterval(this.cleanCache, 3000)
        e.target.innerText = "暂 停"
      } else if (e.target.innerText === "暂 停") {
        // this.player.stopPlay()
        if (this.showMultiCell) {
          cornerstoneTools.stopClip(this.box1Dom, 60)
          cornerstoneTools.stopClip(this.box2Dom, 60)
          cornerstoneTools.stopClip(this.box3Dom, 60)
          cornerstoneTools.stopClip(this.box4Dom, 60)
        } else {
          cornerstoneTools.stopClip(this.canvasDom)
        }
        console.log(55555555, cornerstone, cornerstone.imageCache.getCacheInfo(),cornerstoneWADOImageLoader.wadouri.fileManager.get(0),cornerstoneWADOImageLoader.wadouri.fileManager.get(161))
        e.target.innerText = "播 放"
        clearInterval(this.cleanCacheTimer)
      }
  }
  cleanCache(e) {
    if (this.showMultiCell) {
      cornerstoneTools.stopClip(this.box1Dom)
      cornerstoneTools.stopClip(this.box2Dom)
      cornerstoneTools.stopClip(this.box3Dom)
      cornerstoneTools.stopClip(this.box4Dom)
      cornerstone.imageCache.purgeCache()
      cornerstoneWADOImageLoader.webWorkerManager.terminate()
      cornerstoneWADOImageLoader.wadouri.fileManager.purge()
      cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
      cornerstoneTools.playClip(this.box1Dom, 60)
      cornerstoneTools.playClip(this.box2Dom, 60)
      cornerstoneTools.playClip(this.box3Dom, 60)
      cornerstoneTools.playClip(this.box4Dom, 60)
    } else {
      cornerstoneTools.stopClip(this.canvasDom)
      cornerstone.imageCache.purgeCache()
      cornerstoneWADOImageLoader.webWorkerManager.terminate()
      cornerstoneWADOImageLoader.wadouri.fileManager.purge()
      cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
      cornerstoneTools.playClip(this.canvasDom, 60)
    }
    // cornerstoneTools.stopClip(this.canvasDom)
    // // cornerstoneWADOImageLoader.webWorkerManager.terminate()
    // cornerstone.imageCache.purgeCache()
    // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
    // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    // // setTimeout(() => {
    //   cornerstoneTools.playClip(this.canvasDom, 60)
    // }, 0);
    // console.log(66666666, cornerstoneWADOImageLoader, cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.getInfo())
  }

  changeVisible(e) {
    const dom = document.querySelector(".cornerstone-canvas") as HTMLElement
    if (e.target.innerText === "关 闭") {
      dom.style.display = 'none'
      e.target.innerText = "打 开"
    } else if (e.target.innerText === "打 开") {
      dom.style.display = 'block'
      e.target.innerText = "关 闭"
    }
  }

  test() {
    this.showMultiCell = false
    const res = this.getImageInfoAndImageIds(this.userStore.patientInfo)
    this.allImageInfo = res.allImageInfo
    this.imageIds = res.imageIds
    const _imageIds = this.imageIds.slice(0, 100)
    const files = []
    const timeStart = Date.now()
    console.log('开始时间get100张', Date.now())
    _imageIds.forEach(async (val, i) => {
      const uid = this.parseImageId(val).uid
      this.getData(uid).then(file => {
        files.push(file)
        if(i >= 99) {
          const end = Date.now()
          console.log('结束时间get100张', end, (end - timeStart) / 1000)
          console.log(files)
        }
      })
    })
    setTimeout(() => {
      const timeStart = Date.now()
      console.log('开始时间add100张', Date.now())
      // files.forEach(async (val, i) => {
      //   this.addData(val).then(val => {
      //     if(i >= 99) {
      //       const end = Date.now()
      //       console.log('结束时间add100张', end, (end - timeStart) / 1000)
      //     }
      //   })
      // })
      // this.addData1(files).then((end: any) => {
      //   console.log('结束时间add100张', end, (end - timeStart) / 1000)
      // })
    }, 10000);
  }
}
