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
// 4。手动调控IndexedDB读取和写入；我们控制下载和IndexedDB的读写。

export default class CornerStone extends Vue {
  showMultiCell = false
  imageIdURLTemp = "http://shenzhou.10.6.120.160.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID="
  canvasDom: HTMLCanvasElement = null
  maxChacheFiles = 3
  db = null
  infoStore = null
  fileStore = null
  isAddIndexedDB = false
  addIndexedDBlList = []
  indexedDBConfig = {
    dbName: 'myIndexedDB',
    autoIncrement: false,
    infoStoreName: 'infoStore',
    infoStoreKey: 'uid',
    fileStoreName: 'filesStore',
  }
  allImageInfo = null
  imageIds = null
  isCacheAllImages = false
  isRequesting = false
  downloadList = [] // 下载项
  requestingList = {} // 当前已经提交下载，正在下载，还没有下载完的数据
  cacheFiles = [] // 暂时缓存在内存里，待存到indexedDB的数据，item值为file
  indexedDBFiles = {} // 当前序列，所有缓存到indexedDB的数据，item值为uid
  cleanCacheTimer = null
  public userStore = useUserStore()

  mounted(): void {
    setTimeout(() => {
      this.initCornerstone()
      this.initIndexDB(this.indexedDBConfig)
    }, 1000)
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
    // cornerstone.imageCache.setMaximumSizeBytes(524288000) // 500mb
    // cornerstone.imageCache.setMaximumSizeBytes(85899345920) //1G

    // cornerstoneWADOImageLoader的配置
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

    cornerstoneTools.init({
      showSVGCursors: true,
    })
    // 添加 stack 状态管理器
    cornerstoneTools.addStackStateManager(this.canvasDom, ["stack"])
  }

  initIndexDB(indexedDBConfig) {
    if(this.db) return
    const { dbName, autoIncrement, infoStoreName, infoStoreKey, fileStoreName } = indexedDBConfig
    let indexedDB = window.indexedDB
    const req = indexedDB.open(dbName)
    req.onsuccess = (event: any) => {
      this.db = event.target.result
    }
    req.onupgradeneeded = (event: any) => {
      const db = event.target.result
      // 创建影像信息仓库，确认该影像是否之前彻底缓存到indexedDB中
      db.createObjectStore(infoStoreName, {
        keyPath: infoStoreKey,
        autoIncrement,
      })
      // 创建对象仓库
      db.createObjectStore(fileStoreName)
    }
  }

  async start() {
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
    // 添加快速滑动翻页
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
    this.indexedDBFiles = {}
    const data = await this.checkSeriesListLoaded(uid) as any
    if (data?.isCached) {
      this.imageIds.forEach(item => this.indexedDBFiles[this.parseImageId(item).uid] = true)
    } else {
      this.cacheAllImages(this.imageIds)
    }
    this.displayFistImage(this.canvasDom)

  }

  dicomWebSocket(e) {
    console.log(55555555, cornerstone.imageCache)
    if (e.target.innerText === "播 放") {
      cornerstoneTools.playClip(this.canvasDom, 30)
      // this.cleanCacheTimer = setInterval(this.cleanCache, 3000)
      e.target.innerText = "暂 停"
    } else if (e.target.innerText === "暂 停") {
      // clearInterval(this.cleanCacheTimer)
      cornerstoneTools.stopClip(this.canvasDom)
      e.target.innerText = "播 放"
    }
  }

  cleanCache(e) {
    cornerstoneTools.stopClip(this.canvasDom)
    cornerstone.imageCache.purgeCache()
    // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    setTimeout(() => {
      cornerstoneWADOImageLoader.webWorkerManager.terminate()
      // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
      // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
      cornerstoneTools.playClip(this.canvasDom, 30)
    }, 20);

  }

  getImageInfoAndImageIds(patientInfo) {
    const allImageInfo = {}
    const imageIds = []
    let imageList = patientInfo.StudyList[0].SeriesList[0].ImageList
    imageList.forEach((item, index) => {
      const imageInfo: Record<string, string> = {}
      imageInfo.uid = item.UID
      imageInfo.imageId = "cetus:" + this.imageIdURLTemp + item.UID
      // imageInfo.imageId = "wadouri:" + this.imageIdURLTemp + item.UID
      // imageInfo.imageId = "wadouri:http://shenzhou.10.6.120.131.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=" + item.UID
      imageInfo.instanceNum = index
      imageInfo.wandoImageId = "wadouri:" + this.imageIdURLTemp + item.UID
      allImageInfo[imageInfo.uid] = imageInfo
      imageIds.push(imageInfo.imageId)
    })
    return { allImageInfo, imageIds}
  }

  // 获取indexedDB中缓存的数据
  getIndexedDBData(uid) {
    const storeName = this.indexedDBConfig.fileStoreName
    return new Promise((resolve, reject) => {
      const start = Date.now()
      // console.log('开始获取IndexedDB')
      const req = this.db.transaction([storeName], "readonly")
      .objectStore(storeName)
      .get(uid)
      req.addEventListener('success', e => {
        resolve(e.result || e.target.result)
        // console.log('获取IndexedDB', (Date.now() - start)/1000)
      })
    })
  }

  addIndexedDBData() {
    this.isAddIndexedDB = true
    const storeName = this.indexedDBConfig.fileStoreName
    const trans = this.db.transaction([storeName], "readwrite")
    const store = trans.objectStore(storeName)
    const run = async () => {
      if(this.addIndexedDBlList.length === 0) {
        this.isAddIndexedDB = false
        return
      }
      const start = Date.now()
      console.log('开始写入IndexedDB')
      const item = this.addIndexedDBlList[0]
      item.forEach((data, index) => {
        const uid = data.uid
        const req = store.put(data.dataSet.byteArray, data.uid)
        data = null
        req.addEventListener('success', e => {
          this.indexedDBFiles[uid] = true
          if(index === item.length -1) {
            this.addIndexedDBlList.shift()
            console.log('写入IndexedDB',this.addIndexedDBlList,  (Date.now() - start)/1000)
            run()
          }
        })
      })
    }
    run()
  }

  // addIndexedDBData(data) {
  //   this.isAddIndexedDB = true
  //   const storeName = this.indexedDBConfig.fileStoreName
  //   const trans = this.db.transaction([storeName], "readwrite")
  //   const store = trans.objectStore(storeName)
  //   const start = Date.now()
  //   console.log('开始写入IndexedDB')
  //   data.forEach((item, index) => {
  //     const req = store.put(item.dataSet.byteArray, item.uid)
  //     req.addEventListener('success', e => {
  //       this.indexedDBFiles[item.uid] = true
  //       console.log('写入IndexedDB', (Date.now() - start)/1000)
  //     })
  //   })
  // }

  // 获取dicom影像数据
  getInfoData(uid) {
    const storeName = this.indexedDBConfig.infoStoreName
    return new Promise((resolve, reject) => {
      const req = this.db.transaction([storeName], "readwrite")
      .objectStore(storeName)
      .get(uid)
      req.addEventListener('success', e => {
        resolve(e.result || e.target.result)
      })
    })
  }

  // 获取dicom影像数据
  addInfoData(data) {
    const storeName = this.indexedDBConfig.infoStoreName
    this.db.transaction([storeName], "readwrite")
    .objectStore(storeName)
    .add(data)
  }

  async checkSeriesListLoaded(uid) {
    return await this.getInfoData(uid)
  }

  imageLoader(imageId) {
    const uid = this.parseImageId(imageId).uid
    const imageInfo = this.allImageInfo[uid]
    const promise = new Promise(async (resolve, reject) => {
      // TODO: 先判断是否已经缓存了，然后再根据isCacheAllImages，选择下载方式。如果isCacheAllImages结束了，缓存也没有，说明有bug，或者indexedDB被删除了
      const byteArray = await this.checkCacheAndDB(uid)
      if (byteArray) {
        const image = await this.getImageFromByteArray(byteArray, imageInfo)
        resolve(image)
      } else {
        this.downloadCtrl(imageInfo, (image) => {
          resolve(image)
        })
      }
    })
    return {
      promise
    }
  }

  parseImageId(imageId) {
    const uidIndex = imageId.indexOf('&OBJECTUID=')
    let uid = imageId.substring(uidIndex + 11)
    return { uid }
  }

  // 下载并缓存所有dicom到indexedDB
  async cacheAllImages(imageIds) {
    this.downloadList = []
    this.isCacheAllImages = true
    imageIds.forEach(async (imageId) => {
      const uid = this.parseImageId(imageId).uid
      const imageInfo = this.allImageInfo[uid]
      this.downloadList.push({
        imageInfo,
        requestFn:  this.downloadCtrl
      })
        // TODO: 当为最后一张时，需要触发下载和缓存到indexedDB中，使用cb实现
    })
    this.requestCtrl(5, () => {
      // 全部缓存完
      const uid = this.userStore.patientInfo.StudyList[0].SeriesList[0].UID
      this.addInfoData({uid, isCached: true})
      this.isCacheAllImages = false
      console.log(6666666,  '下载缓存完毕')
    })
  }

  // 控制发送请求
  requestCtrl(max = 5, cb = null){
    this.isRequesting = true
    let index = 0
    let arr = new Array(max).fill(null)
    arr = arr.map(() => {
      return new Promise((resolve) => {
        const run = async () => {
          // 出口，结束递归条件
          if(index >= this.downloadList.length) {
            this.isRequesting = false
            console.log(11111111111, '下载完成')
            resolve(null)
            return
          }
          // TODO：判断image是否已经下载了，或者已经缓存了,因为全都是异步的。
          const { imageInfo, requestFn, callback } =  this.downloadList[index]
          index = index + 1
          const byteArray = await this.checkCacheAndDB(imageInfo.uid)
          if(byteArray) {
            const image = await this.getImageFromByteArray(byteArray, imageInfo)
            callback && callback(image)
            run()
          } else if (this.requestingList[imageInfo.uid]) {
            // 如果请求影像已经正在请求中，则将callback添加到正在请求的回调中
            callback && this.requestingList[imageInfo.uid].push(callback)
            run()
          } else {
            requestFn(imageInfo, (image) => {
              callback && callback(image)
              run()
            })
          }
        }
        run()
      })
    })
    Promise.all(arr).then(() => {
      console.log(22222222, '下载完成')
      cb && cb()
    })
  }

  // 检查目标影像是否在cachefiles和indexedDB中，如果在则返回对应的缓存，如果不在则返回false
  async checkCacheAndDB(uid) {
    // 先判断是否在cacheFiles中
    const res = this.cacheFiles.find(val => val.uid === uid)
    if (res?.dataSet?.byteArray) {
      return res.dataSet.byteArray
    }
    // 再判断是否在indexedDB中
    if (this.indexedDBFiles[uid]) {
      let indexedDBCache = await this.getIndexedDBData(uid)
      return indexedDBCache
    }
    return false
  }

  // TODO :优化成通过requestCtrl来进行下载
  async displayFistImage(dom) {
    const uid = this.parseImageId(this.imageIds[0]).uid
    const imageInfo = this.allImageInfo[uid]
    const byteArray = await this.checkCacheAndDB(imageInfo.uid)
    if(byteArray) {
      const image = await this.getImageFromByteArray(byteArray, imageInfo)
      cornerstone.displayImage(dom, image)
      return
    } else {
      this.downloadCtrl(imageInfo, (image) => {
        cornerstone.displayImage(dom, image)
      })
    }
  }

  loadImageFromDataSet(
    dataSet,
    imageId,
    frame = 0,
    sharedCacheKey,
    options = {},
  ) {
    const start = new Date().getTime()
    const promise = new Promise((resolve, reject) => {
      const loadEnd = new Date().getTime()
      let imagePromise
      try {
        const pixelData = this.getPixelData(dataSet, frame)
        // const pixelData = dataSet.byteArray
        const transferSyntax = dataSet.string('x00020010')
        imagePromise = cornerstoneWADOImageLoader.createImage(imageId, pixelData, transferSyntax, options)
      } catch (error) {
        reject({
          error,
          dataSet,
        })
        return
      }

      imagePromise.then((image) => {
        image.data = dataSet
        image.sharedCacheKey = sharedCacheKey
        const end = new Date().getTime()
        image.loadTimeInMS = loadEnd - start
        image.totalTimeInMS = end - start
        resolve(image)
      }, reject)
    })
    return promise
  }

  getPixelData(dataSet, frameIndex = 0) {
    const pixelDataElement = dataSet.elements.x7fe00010 || dataSet.elements.x7fe00008
    if (!pixelDataElement) {
      return null
    }
    if (pixelDataElement.encapsulatedPixelData) {
      return cornerstoneWADOImageLoader.wadouri.getEncapsulatedImageFrame(dataSet, frameIndex)
    }
    return cornerstoneWADOImageLoader.wadouri.getUncompressedImageFrame(dataSet, frameIndex)
  }


  // 只负责从cetus下载数据，加入到cacheFiles,并回调存到indexedDB
  downloadCtrl(imageInfo, callback) {
    this.requestingList[imageInfo.uid] = []
    cornerstone.loadImage(imageInfo.wandoImageId).then(async (image) => {
      image.imageId = imageInfo.imageId
      // 合并有插入的回调
      // console.log('nnnnnnnnnnnnnn', cornerstoneWADOImageLoader, image)
      const callbacks = this.requestingList[imageInfo.uid] ? [...this.requestingList[imageInfo.uid], callback] : [callback]
      delete this.requestingList[imageInfo.uid]
      callbacks.length > 0 &&  callbacks.forEach(cb => typeof cb === "function" && cb(image))
      this.cacheFiles.push({uid: imageInfo.uid, dataSet: image.data})
      // 如果达到缓存最高数量, 或者都已经下载完毕，则执行存入到indexedDB中
      if((this.cacheFiles.length >= this.maxChacheFiles) || (!this.isRequesting && this.cacheFiles.length > 0)) {
        this.addIndexedDBlList.push(this.cacheFiles)
        this.cacheFiles = []
        this.isAddIndexedDB || this.addIndexedDBData()
        // this.addIndexedDBData(this.cacheFiles)
        // this.cacheFiles = null
        // this.cacheFiles = []
      }
    })
  }

  wandoParseImageId(imageId) {
    const firstColonIndex = imageId.indexOf(':')
    let url = imageId.substring(firstColonIndex + 1)
    const frameIndex = url.indexOf('frame=')
    let frame
    if (frameIndex !== -1) {
      const frameStr = url.substr(frameIndex + 6)
      frame = parseInt(frameStr, 10)
      url = url.substr(0, frameIndex - 1)
    }
    return {
      scheme: imageId.substr(0, firstColonIndex),
      url,
      frame,
    }
  }

  async getImageFromByteArray(byteArray, imageInfo) {
    const dataSet = dicomParser.parseDicom(byteArray)
    const parsedImageId = this.wandoParseImageId(imageInfo.wandoImageId)
    const image = await this.loadImageFromDataSet(dataSet, imageInfo.wandoImageId, parsedImageId.frame, parsedImageId.url)
    return image
  }
}
displayFistImage(dom) {
  cornerstone.loadAndCacheImage(this.imageIds[0]).then(image => {
    cornerstone.displayImage(dom, image)
  })
}
