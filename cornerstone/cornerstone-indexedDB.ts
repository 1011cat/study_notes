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
import * as Utility from 'uih-mcsf-utility';


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
  currentStoreName = ''
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
  curSeriesUID = null
  studyList = []
  public userStore = useUserStore()
  isPlaying = false
  firstPercent = '0%'
  toolNameMap = {
    Pointer: 'StackScroll', // 选择翻页
    Pan: 'Pan', // 平移图像
    Zoom: 'Zoom', // 图像缩放
    Rotate2D: 'Rotate', // 图像旋转
    Rotate3D: 'Rotate', // 图像旋转
    Windowing: 'Wwwc', // 窗宽窗位
    ResetWindowing: 'resetWindow', // 重置窗宽窗位
    Reset: 'resetImage', // 重置
    Line: 'Length', // 直线
    Angle: 'Angle', // 角度
    Rectangle: 'RectangleRoi', // 矩形
    Circle: 'CircleRoi', // 圆形
    Ellipse: 'EllipticalRoi', // 椭圆
    Freehand: 'FreehandRoi', //  自由笔
    PixelLens: 'Probe', //  像素透镜
    Arrow: 'ArrowAnnotate', //  箭头标注
    Text: 'TextMarker', //  文本标注
    ClearGraphic: 'clearTool', //  清除图元
    ImagePlayer: 'playVideo', //  播放
  }
  tools = [
    {
      name: "StackScroll",
      label: "选择/翻页",
      props: {
        configuration: {
          // 是否在序列内循环
          loop: true,
          // 是否跳帧
          allowSkipping: true
        }
      }
    },
    {
      name: "Pan",
      label: "平移图像",
      props: {
        supportedInteractionTypes: ['Mouse', 'Touch'],
      }
    },
    {
      name: "Zoom",
      label: "图像缩放",
      props: {
        configuration: {
          invert: false,
          preventZoomOutsideImage: false,
          minScale: 0.25,
          maxScale: 20.0,
        },
      }
    },
    {
      name: "Rotate",
      label: "图像旋转",
      props: {
        configuration: {
          roundAngles: false,
          flipHorizontal: false,
          flipVertical: false,
          rotateScale: 1,
        },
      }
    },
    {
      name: "Wwwc",
      label: "窗宽窗位",
      props: {
        configuration: {
          orientation: 0,
        },
      }
    },
    {
      name: "Length",
      label: "直线",
      props: {
        configuration: {
          drawHandles: true,
          drawHandlesOnHover: false,
          hideHandlesIfMoving: false,
          renderDashed: false,
          digits: 2,
        },
      }
    },
    {
      name: "Angle",
      label: "角度",
      props: {
        configuration: {
          drawHandles: true,
          drawHandlesOnHover: false,
          hideHandlesIfMoving: false,
          renderDashed: false,
        }
      }
    },
    {
      name: "RectangleRoi",
      label: "矩形",
      props: {
        configuration: {
          drawHandles: true,
          drawHandlesOnHover: false,
          hideHandlesIfMoving: false,
          renderDashed: false,
        }
      }
    },
    {
      name: "CircleRoi",
      label: "圆形",
      props: {
        configuration: {
          centerPointRadius: 0,
          renderDashed: false,
          hideHandlesIfMoving: false,
        }
      }
    },
    {
      name: "EllipticalRoi",
      label: "椭圆",
      props: {
        configuration: {
          drawHandlesOnHover: false,
          hideHandlesIfMoving: false,
          renderDashed: false,
        }
      }
    },
    {
      name: "FreehandRoi",
      label: "自由笔",
      props: {
        configuration: {
          mouseLocation: {
            handles: {
              start: {
                highlight: true,
                active: true,
              },
            },
          },
          spacing: 1,
          activeHandleRadius: 3,
          completeHandleRadius: 6,
          completeHandleRadiusTouch: 28,
          alwaysShowHandles: false,
          invalidColor: 'crimson',
          currentHandle: 0,
          currentTool: -1,
          drawHandles: true,
          renderDashed: false,
        }
      }
    },
    {
      name: "Probe",
      label: "像素透镜",
      props: {
        configuration: {
          drawHandles: true,
          renderDashed: false,
        }
      }
    },
    {
      name: "ArrowAnnotate",
      label: "箭头标注",
      props: {
        configuration: {
          // getTextCallback,
          // changeTextCallback,
          drawHandles: true,
          drawHandlesOnHover: false,
          hideHandlesIfMoving: false,
          arrowFirst: true,
          renderDashed: false,
          allowEmptyLabel: false,
        }
      }
    },
    {
      name: "TextMarker",
      label: "文本标注",
      props: {
        configuration: {
          markers: [' '],
          current: ' ',
          ascending: true,
          loop: true,
          // changeTextCallback,
        }
      }
    },
  ]

  mounted(): void {
    console.log('aaaaaaaaaaaaaaaaaaaaa', cornerstone)
    this.$watch(
      () => this.userStore.patientInfo,
      () => {
        if (this.studyList.length === 0) {
          this.studyList = this.userStore.patientInfo.StudyList
          this.curSeriesUID = this.studyList[0].SeriesList[0].UID
          this.start()
        } else {
          this.userStore.patientInfo.StudyList.forEach(item => {
            const res = this.studyList.find(study => {
              return study.UID === item.UID
            })
            res && this.studyList.push(item)
          })
        }
      },
      {deep: true}
    )
    Utility.Messenger.on("changeSeries", menu => {
      this.curSeriesUID = this.userStore.selectedSeriesUID
      this.start()
      console.log(555666, menu)
    })
    setTimeout(() => {
      this.canvasDom = document.querySelector("#medContainer")
      this.canvasDom.addEventListener('drop',  (ev)=> {
        this.curSeriesUID = this.userStore.selectedSeriesUID
        this.start()
        console.log('zzzzzzzzzzzz', ev, this.userStore)
      })
      this.initCornerstone()
      this.initIndexDB(this.indexedDBConfig)
      this.initCornerstoneTools()
      this.initProxy()
    }, 100)
  }

  initCornerstone() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneTools.init({
      // 当元素被启用时，是否监听鼠标事件
      mouseEnabled: true,
      // 当元素被启用时，是否监听触摸事件
      touchEnabled: true,
      // 全局工具同步
      globalToolSyncEnabled: true,
      // 显示svg光标
      showSVGCursors: true,
      // 自动调整视口大小
      autoResizeViewports: true,
      // 虚线样式
      lineDash: [4, 4],
    })
    // this.canvasDom = document.querySelector(".image-viewer-right")


    // 注冊自定义imageLoader
    cornerstone.registerImageLoader('cetus', this.imageLoader)
    // cornerstone.imageCache.setMaximumSizeBytes(600000)
    // 设置cornerstone内存为100mb
    cornerstone.imageCache.setMaximumSizeBytes(83886080)
    // cornerstone.imageCache.setMaximumSizeBytes(524288000) // 500mb
    // cornerstone.imageCache.setMaximumSizeBytes(85899345920) //1G
    // cornerstoneWADOImageLoader的配置
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 3,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
          decodeTask: {
            loadCodecsOnStartup : false,
            initializeCodecsOnStartup: false,
          },
      },
    })
    // 添加 stack 状态管理器
    cornerstone.enable(this.canvasDom)
    cornerstoneTools.addStackStateManager(this.canvasDom, ["stack"])
  }

  initIndexDB(indexedDBConfig) {
    if(this.db) return
    const { dbName, autoIncrement, infoStoreName, infoStoreKey, fileStoreName } = indexedDBConfig
    let indexedDB = window.indexedDB
    const req = indexedDB.open(dbName)
    req.onsuccess = (event: any) => {
      this.db = event.target.result
      this.currentStoreName = fileStoreName
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
  // 初始化cornerstonetool工具配置
  initCornerstoneTools() {
    this.tools.forEach((tool) => {
      this.addTool(tool.name, tool.props);
    });
  }

  initProxy() {
    Utility.Messenger.on("menuClick", menu => {
      console.log(555666, menu)
      const toolName = this.toolNameMap[menu.uiName]
      const fns = ['resetWindow', 'resetImage', 'clearTool', 'playVideo']
      if(fns.includes(toolName)) {
        this[toolName]()
      } else {
        toolName && this.setToolActive(toolName)
      }
    })
  }

  // 重置窗宽窗位
  resetWindow() {
    const image = cornerstone.getImage(this.canvasDom)
    const viewport = cornerstone.getViewport(this.canvasDom)
    viewport.voi.windowWidth = image.windowWidth
    viewport.voi.windowCenter = image.windowCenter
    cornerstone.setViewport(this.canvasDom, viewport)
  }

  resetImage() {
    cornerstone.reset(this.canvasDom)
  }

  async start() {
    const res = this.getImageInfoAndImageIds()
    this.allImageInfo = res.allImageInfo
    this.imageIds = res.imageIds
    // 添加 stack 状态管理器
    const stack = {
      currentImageIdIndex: 0,
      imageIds: this.imageIds,
      preventCache: true
    }
    cornerstoneTools.clearToolState(this.canvasDom, "stack")
    cornerstoneTools.addToolState(this.canvasDom, "stack", stack)
    // 添加快速滑动翻页
    // const StackScrollTool = cornerstoneTools.StackScrollTool
    // const props = {
    //   configuration: {
    //     // 是否在序列内循环
    //     loop: true,
    //     // 是否跳帧
    //     allowSkipping: false
    //   }
    // }
    // cornerstoneTools.addTool(StackScrollTool, props)
    // cornerstoneTools.setToolActive("StackScroll", { mouseButtonMask: 1 })
    // 默认添加快速翻页
    this.setToolActive('StackScroll')
    // 判断该序列是否已经缓存
    this.indexedDBFiles = {}
    const data = await this.checkSeriesListLoaded(this.curSeriesUID) as any
    if (data?.isCached) {
      this.imageIds.forEach(item => this.indexedDBFiles[this.parseImageId(item).uid] = true)
      this[this.currentStoreName + 'Percent'] = '100%'
    } else {
      this.cacheAllImages(this.imageIds)
    }
    this.displayFistImage(this.canvasDom)
  }

  addTool(toolName, props) {
    const ApiTool = cornerstoneTools[`${toolName}Tool`];
    cornerstoneTools.addTool(ApiTool, props);
  }

  drawImage(toolName) {
    this.setToolActive(toolName)
  }

  setToolActive(toolName, mouseButtonMask = 1) {
    const options = {
      mouseButtonMask: mouseButtonMask
    };

    cornerstoneTools.setToolActive(toolName, options);
  }

  clearTool() {
    const manager = cornerstoneTools.getElementToolStateManager(this.canvasDom);
    for (let i = 0; i < this.tools.length; i++) {
      let toolData = manager.get(this.canvasDom, this.tools[i].name);
      if (toolData) { toolData.data = []; };
    }
    cornerstoneTools.external.cornerstone.updateImage(this.canvasDom);
  }

  playVideo(e) {
    if (this.isPlaying === false) {
      cornerstoneTools.playClip(this.canvasDom, 30)
      // this.cleanCacheTimer = setInterval(this.cleanCache, 3000)
      this.isPlaying = true
    } else if (this.isPlaying === true) {
      // clearInterval(this.cleanCacheTimer)
      cornerstoneTools.stopClip(this.canvasDom)
      this.isPlaying = false
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

  getImageInfoAndImageIds() {
    const allImageInfo = {}
    const imageIds = []
    let imageList = null
    this.studyList.find(study => {
      return study.SeriesList.find(series => {
        if (series.UID === this.curSeriesUID) {
          imageList = series.ImageList
          return true
        }
      })
    })
    // let imageList = patientInfo.StudyList[0].SeriesList[0].ImageList
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
    // const storeName = this.indexedDBConfig.fileStoreName
    const storeName = this.currentStoreName
    return new Promise((resolve, reject) => {
      const start = Date.now()
      console.log('开始获取IndexedDB')
      const req = this.db.transaction([storeName], "readonly")
      .objectStore(storeName)
      .get(uid)
      req.addEventListener('success', e => {
        resolve(e.result || e.target.result)
        console.log('获取IndexedDB', (Date.now() - start)/1000)
      })
    })
  }

  addIndexedDBData(storeName) {
    this.isAddIndexedDB = true
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
            console.log('写入IndexedDB',  (Date.now() - start)/1000)
            run()
          }
        })
      })
    }
    run()
  }

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
        this.downloadCtrl(imageInfo, this.currentStoreName, (image) => {
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
    const uid = this.curSeriesUID
    this.downloadList = []
    this.isCacheAllImages = true
    imageIds.forEach(async (imageId) => {
      const uid = this.parseImageId(imageId).uid
      const imageInfo = this.allImageInfo[uid]
      this.downloadList.push({
        imageInfo,
        requestFn:  this.downloadCtrl,
        storeName: this.currentStoreName
      })
        // TODO: 当为最后一张时，需要触发下载和缓存到indexedDB中，使用cb实现
    })
    this.requestCtrl(5, () => {
      // 全部缓存完
      this.addInfoData({uid, isCached: true})
      this.isCacheAllImages = false
      cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
      cornerstoneWADOImageLoader.webWorkerManager.terminate()
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
          const { imageInfo, requestFn, callback, storeName } =  this.downloadList[index]
          index = index + 1
          this[storeName + 'Percent'] = floor((index / this.downloadList.length) * 100) + '%'
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
            requestFn(imageInfo, storeName, (image) => {
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
      this.downloadCtrl(imageInfo, this.currentStoreName, (image) => {
        // console.log(11111111111, image, image.getPixelData())
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
        imagePromise = this.createImage(imageId, pixelData, transferSyntax, options, dataSet)
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
  downloadCtrl(imageInfo, storeName, callback) {
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
        this.isAddIndexedDB || this.addIndexedDBData(storeName)
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
    const parsedImageId = this.wandoParseImageId(imageInfo.imageId)
    const image = await this.loadImageFromDataSet(dataSet, imageInfo.imageId, parsedImageId.frame, parsedImageId.url)
    return image
  }

  createImage(imageId, pixelData, transferSyntax, options = {} as any, dataSet) {
    // whether to use RGBA for color images, default true as cs-legacy uses RGBA
    // but we don't need RGBA in cs3d, and it's faster, and memory-efficient
    // in cs3d
    let useRGBA = true;

    if (options.useRGBA !== undefined) {
      useRGBA = options.useRGBA;
    }

    // always preScale the pixel array unless it is asked not to
    options.preScale = {
      enabled:
        options.preScale && options.preScale.enabled !== undefined
          ? options.preScale.enabled
          : false,
    };

    if (!pixelData || !pixelData.length) {
      return Promise.reject(new Error('The file does not contain image data.'));
    }

    const canvas = document.createElement('canvas');
    const imageFrame = this.getImageFrame(imageId, dataSet);

    // Get the scaling parameters from the metadata

    const { decodeConfig } = cornerstoneWADOImageLoader.internal.getOptions();

    const decodePromise = cornerstoneWADOImageLoader.decodeImageFrame(
      imageFrame,
      transferSyntax,
      pixelData,
      canvas,
      options,
      decodeConfig
    );

    const { convertFloatPixelDataToInt, use16BitDataType } = decodeConfig;

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line complexity
      decodePromise.then((imageFrame) => {
        // if it is desired to skip creating image, return the imageFrame
        // after the decode. This might be useful for some applications
        // that only need the decoded pixel data and not the image object
        if (options.skipCreateImage) {
          return resolve(imageFrame);
        }
        // If we have a target buffer that was written to in the
        // Decode task, point the image to it here.
        // We can't have done it within the thread incase it was a SharedArrayBuffer.
        let alreadyTyped = false;

        if (options.targetBuffer) {
          let offset, length;
          // If we have a target buffer, write to that instead. This helps reduce memory duplication.

          ({ offset, length } = options.targetBuffer);
          const { arrayBuffer, type } = options.targetBuffer;

          let TypedArrayConstructor;

          if (length === null || length === undefined) {
            length = imageFrame.pixelDataLength;
          }

          if (offset === null || offset === undefined) {
            offset = 0;
          }

          switch (type) {
            case 'Uint8Array':
              TypedArrayConstructor = Uint8Array;
              break;
            case use16BitDataType && 'Uint16Array':
              TypedArrayConstructor = Uint16Array;
              break;
            case use16BitDataType && 'Int16Array':
              TypedArrayConstructor = Int16Array;
              break;
            case 'Float32Array':
              TypedArrayConstructor = Float32Array;
              break;
            default:
              throw new Error(
                'target array for image does not have a valid type.'
              );
          }

          if (length !== imageFrame.pixelDataLength) {
            throw new Error(
              'target array for image does not have the same length as the decoded image length.'
            );
          }

          // TypedArray.Set is api level and ~50x faster than copying elements even for
          // Arrays of different types, which aren't simply memcpy ops.
          let typedArray;

          if (arrayBuffer) {
            typedArray = new TypedArrayConstructor(arrayBuffer, offset, length);
          } else {
            typedArray = new TypedArrayConstructor(imageFrame.pixelData);
          }

          // If need to scale, need to scale correct array.
          imageFrame.pixelData = typedArray;
          alreadyTyped = true;
        }

        // if (!alreadyTyped) {
        //   setPixelDataType(imageFrame, imageFrame.preScale);
        // }

        const imagePlaneModule =
          this.getMetaData('imagePlaneModule', dataSet);
        const voiLutModule =
          this.getMetaData('voiLutModule', dataSet) as any
        const modalityLutModule =
          this.getMetaData('modalityLutModule', dataSet);
        const sopCommonModule =
          this.getMetaData('sopCommonModule', dataSet);
        const isColorImage = cornerstoneWADOImageLoader.isColorImage(imageFrame.photometricInterpretation);

        if (isColorImage) {
          if (useRGBA) {
            // JPEGBaseline (8 bits) is already returning the pixel data in the right format (rgba)
            // because it's using a canvas to load and decode images.
            if (!cornerstoneWADOImageLoader.isJPEGBaseline8BitColor(imageFrame, transferSyntax)) {
              canvas.height = imageFrame.rows;
              canvas.width = imageFrame.columns;

              const context = canvas.getContext('2d');

              const imageData = context.createImageData(
                imageFrame.columns,
                imageFrame.rows
              );

              cornerstoneWADOImageLoader.convertColorSpace(imageFrame, imageData.data, useRGBA);

              imageFrame.imageData = imageData;
              imageFrame.pixelData = imageData.data;
            }
          } else if (cornerstoneWADOImageLoader.isJPEGBaseline8BitColor(imageFrame, transferSyntax)) {
            // If we don't need the RGBA but the decoding is done with RGBA (the case
            // for JPEG Baseline 8 bit color), AND the option specifies to use RGB (no RGBA)
            // we need to remove the A channel from pixel data
            const colorBuffer = new Uint8ClampedArray(
              (imageFrame.pixelData.length / 4) * 3
            );

            // remove the A from the RGBA of the imageFrame
            imageFrame.pixelData = this.removeAFromRGBA(
              imageFrame.pixelData,
              colorBuffer
            );
          } else if (imageFrame.photometricInterpretation === 'PALETTE COLOR') {
            canvas.height = imageFrame.rows;
            canvas.width = imageFrame.columns;

            const context = canvas.getContext('2d');

            const imageData = context.createImageData(
              imageFrame.columns,
              imageFrame.rows
            ) as any

            cornerstoneWADOImageLoader.convertColorSpace(imageFrame, imageData.data, true);

            const colorBuffer = new imageData.data.constructor(
              (imageData.data.length / 4) * 3
            );

            // remove the A from the RGBA of the imageFrame
            imageFrame.pixelData = this.removeAFromRGBA(imageData.data, colorBuffer);
          }

          // calculate smallest and largest PixelValue of the converted pixelData
          const minMax = this.getMinMax(imageFrame.pixelData);

          imageFrame.smallestPixelValue = minMax.min;
          imageFrame.largestPixelValue = minMax.max;
        }

        imageFrame.pixelData = new Uint16Array(pixelData.buffer);

        const image = {
          imageId,
          color: isColorImage,
          columnPixelSpacing: imagePlaneModule.columnPixelSpacing,
          columns: imageFrame.columns,
          height: imageFrame.rows,
          preScale: imageFrame.preScale,
          intercept: modalityLutModule.rescaleIntercept
            ? modalityLutModule.rescaleIntercept
            : 0,
          slope: modalityLutModule.rescaleSlope
            ? modalityLutModule.rescaleSlope
            : 1,
          invert: imageFrame.photometricInterpretation === 'MONOCHROME1',
          minPixelValue: imageFrame.smallestPixelValue,
          maxPixelValue: imageFrame.largestPixelValue,
          rowPixelSpacing: imagePlaneModule.rowPixelSpacing,
          rows: imageFrame.rows,
          sizeInBytes: imageFrame.pixelData.byteLength,
          width: imageFrame.columns,
          windowCenter: voiLutModule.windowCenter
            ? voiLutModule.windowCenter[0]
            : undefined,
          windowWidth: voiLutModule.windowWidth
            ? voiLutModule.windowWidth[0]
            : undefined,
          voiLUTFunction: voiLutModule.voiLUTFunction
            ? voiLutModule.voiLUTFunction
            : undefined,
          decodeTimeInMS: imageFrame.decodeTimeInMS,
          floatPixelData: undefined,
          imageFrame,
          rgba: isColorImage && useRGBA,
        } as any

        // If pixel data is intrinsically floating 32 array, we convert it to int for
        // display in cornerstone. For other cases when pixel data is typed as
        // Float32Array for scaling; this conversion is not needed.
        if (
          imageFrame.pixelData instanceof Float32Array &&
          convertFloatPixelDataToInt
        ) {
          const floatPixelData = imageFrame.pixelData;
          const results = this.convertToIntPixelData(floatPixelData);

          image.minPixelValue = results.min;
          image.maxPixelValue = results.max;
          image.slope = results.slope;
          image.intercept = results.intercept;
          image.floatPixelData = floatPixelData;
          image.getPixelData = () => results.intPixelData;
        } else {
          image.getPixelData = () => imageFrame.pixelData;
        }
        image.getPixelData = () => imageFrame.pixelData;
        let lastImageIdDrawn = '';
        if (image.color) {
          image.getCanvas = function () {
            if (lastImageIdDrawn === imageId) {
              return canvas;
            }

            canvas.height = image.rows;
            canvas.width = image.columns;
            const context = canvas.getContext('2d');

            context.putImageData(imageFrame.imageData, 0, 0);
            lastImageIdDrawn = imageId;

            return canvas;
          };
        }

        // Modality LUT
        if (
          modalityLutModule.modalityLUTSequence &&
          modalityLutModule.modalityLUTSequence.length > 0 &&
          this.isModalityLUTForDisplay(sopCommonModule.sopClassUID)
        ) {
          image.modalityLUT = modalityLutModule.modalityLUTSequence[0];
        }

        // VOI LUT
        if (
          voiLutModule.voiLUTSequence &&
          voiLutModule.voiLUTSequence.length > 0
        ) {
          image.voiLUT = voiLutModule.voiLUTSequence[0];
        }

        if (image.color) {
          image.windowWidth = 255;
          image.windowCenter = 127;
        }

        // set the ww/wc to cover the dynamic range of the image if no values are supplied
        if (image.windowCenter === undefined || image.windowWidth === undefined) {
          const maxVoi = image.maxPixelValue * image.slope + image.intercept;
          const minVoi = image.minPixelValue * image.slope + image.intercept;

          image.windowWidth = maxVoi - minVoi;
          image.windowCenter = (maxVoi + minVoi) / 2;
        }
        resolve(image);
      }, reject);
    });
  }

  removeAFromRGBA(imageFrame, targetBuffer) {
    const numPixels = imageFrame.length / 4;

    let rgbIndex = 0;

    let bufferIndex = 0;

    for (let i = 0; i < numPixels; i++) {
      targetBuffer[bufferIndex++] = imageFrame[rgbIndex++]; // red
      targetBuffer[bufferIndex++] = imageFrame[rgbIndex++]; // green
      targetBuffer[bufferIndex++] = imageFrame[rgbIndex++]; // blue
      rgbIndex++; // skip alpha
    }

    return targetBuffer;
  }

  getMinMax(storedPixelData) {
    // we always calculate the min max values since they are not always
    // present in DICOM and we don't want to trust them anyway as cornerstone
    // depends on us providing reliable values for these
    let min = storedPixelData[0];

    let max = storedPixelData[0];

    let storedPixel;
    const numPixels = storedPixelData.length;

    for (let index = 1; index < numPixels; index++) {
      storedPixel = storedPixelData[index];
      min = Math.min(min, storedPixel);
      max = Math.max(max, storedPixel);
    }

    return {
      min,
      max,
    };
  }

  convertToIntPixelData(floatPixelData) {
    const floatMinMax = this.getMinMax(floatPixelData);
    const floatRange = Math.abs(floatMinMax.max - floatMinMax.min);
    const intRange = 65535;
    const slope = floatRange / intRange;
    const intercept = floatMinMax.min;
    const numPixels = floatPixelData.length;
    const intPixelData = new Uint16Array(numPixels);

    let min = 65535;

    let max = 0;

    for (let i = 0; i < numPixels; i++) {
      const rescaledPixel = Math.floor((floatPixelData[i] - intercept) / slope);

      intPixelData[i] = rescaledPixel;
      min = Math.min(min, rescaledPixel);
      max = Math.max(max, rescaledPixel);
    }

    return {
      min,
      max,
      intPixelData,
      slope,
      intercept,
    };
  }

  isModalityLUTForDisplay(sopClassUid) {
    // special case for XA and XRF
    // https://groups.google.com/forum/#!searchin/comp.protocols.dicom/Modality$20LUT$20XA/comp.protocols.dicom/UBxhOZ2anJ0/D0R_QP8V2wIJ
    return (
      sopClassUid !== '1.2.840.10008.5.1.4.1.1.12.1' && // XA
      sopClassUid !== '1.2.840.10008.5.1.4.1.1.12.2.1'
    ); // XRF
  }

  getImageFrame(imageId, dataSet) {
    const imagePixelModule = cornerstoneWADOImageLoader.wadouri.metaData.getImagePixelModule(dataSet);

    return {
      samplesPerPixel: imagePixelModule.samplesPerPixel,
      photometricInterpretation: imagePixelModule.photometricInterpretation,
      planarConfiguration: imagePixelModule.planarConfiguration,
      rows: imagePixelModule.rows,
      columns: imagePixelModule.columns,
      bitsAllocated: imagePixelModule.bitsAllocated,
      bitsStored: imagePixelModule.bitsStored,
      pixelRepresentation: imagePixelModule.pixelRepresentation, // 0 = unsigned,
      smallestPixelValue: imagePixelModule.smallestPixelValue,
      largestPixelValue: imagePixelModule.largestPixelValue,
      redPaletteColorLookupTableDescriptor:
        imagePixelModule.redPaletteColorLookupTableDescriptor,
      greenPaletteColorLookupTableDescriptor:
        imagePixelModule.greenPaletteColorLookupTableDescriptor,
      bluePaletteColorLookupTableDescriptor:
        imagePixelModule.bluePaletteColorLookupTableDescriptor,
      redPaletteColorLookupTableData:
        imagePixelModule.redPaletteColorLookupTableData,
      greenPaletteColorLookupTableData:
        imagePixelModule.greenPaletteColorLookupTableData,
      bluePaletteColorLookupTableData:
        imagePixelModule.bluePaletteColorLookupTableData,
      pixelData: undefined, // populated later after decoding
    };
  }

  getMetaData(type, dataSet) {
    if (type === 'imagePlaneModule') {
      const imageOrientationPatient = this.extractOrientationFromDataset(dataSet);

      const imagePositionPatient = this.extractPositionFromDataset(dataSet);

      const pixelSpacing = this.extractSpacingFromDataset(dataSet);

      let frameOfReferenceUID;

      if (dataSet.elements.x00200052) {
        frameOfReferenceUID = dataSet.string('x00200052');
      }

      const sliceThickness = this.extractSliceThicknessFromDataset(dataSet);

      let sliceLocation;

      if (dataSet.elements.x00201041) {
        sliceLocation = dataSet.floatString('x00201041');
      }

      let columnPixelSpacing = null;

      let rowPixelSpacing = null;

      if (pixelSpacing) {
        rowPixelSpacing = pixelSpacing[0];
        columnPixelSpacing = pixelSpacing[1];
      }

      let rowCosines = null;

      let columnCosines = null;

      if (imageOrientationPatient) {
        rowCosines = [
          parseFloat(imageOrientationPatient[0]),
          parseFloat(imageOrientationPatient[1]),
          parseFloat(imageOrientationPatient[2]),
        ];
        columnCosines = [
          parseFloat(imageOrientationPatient[3]),
          parseFloat(imageOrientationPatient[4]),
          parseFloat(imageOrientationPatient[5]),
        ];
      }

      return {
        frameOfReferenceUID,
        rows: dataSet.uint16('x00280010'),
        columns: dataSet.uint16('x00280011'),
        imageOrientationPatient,
        rowCosines,
        columnCosines,
        imagePositionPatient,
        sliceThickness,
        sliceLocation,
        pixelSpacing,
        rowPixelSpacing,
        columnPixelSpacing,
      };
    }

    if (type === 'voiLutModule') {
      const modalityLUTOutputPixelRepresentation =
      cornerstoneWADOImageLoader.wadouri.metaData.getModalityLUTOutputPixelRepresentation(dataSet);

      return {
        windowCenter: this.getNumberValues(dataSet, 'x00281050', 1),
        windowWidth: this.getNumberValues(dataSet, 'x00281051', 1),
        voiLUTSequence: cornerstoneWADOImageLoader.wadouri.metaData.getLUTs(
          modalityLUTOutputPixelRepresentation,
          dataSet.elements.x00283010
        ),
      };
    }

    if (type === 'modalityLutModule') {
      return {
        rescaleIntercept: dataSet.floatString('x00281052'),
        rescaleSlope: dataSet.floatString('x00281053'),
        rescaleType: dataSet.string('x00281054'),
        modalityLUTSequence: cornerstoneWADOImageLoader.wadouri.metaData.getLUTs(
          dataSet.uint16('x00280103'),
          dataSet.elements.x00283000
        ),
      };
    }

    if (type === 'sopCommonModule') {
      return {
        sopClassUID: dataSet.string('x00080016'),
        sopInstanceUID: dataSet.string('x00080018'),
      };
    }
  }

  extractOrientationFromDataset(dataSet) {
    let imageOrientationPatient = this.getNumberValues(dataSet, 'x00200037', 6);

    // Trying to get the orientation from the Plane Orientation Sequence
    if (!imageOrientationPatient && dataSet.elements.x00209116) {
      imageOrientationPatient = this.getNumberValues(
        dataSet.elements.x00209116.items[0].dataSet,
        'x00200037',
        6
      );
    }

    // If orientation not valid to this point, trying to get the orientation
    // from the Detector Information Sequence (for NM images) with image type
    // equal to RECON TOMO or RECON GATED TOMO

    if (!imageOrientationPatient) {
      imageOrientationPatient =
        this.extractOrientationFromNMMultiframeDataset(dataSet);
    }

    return imageOrientationPatient;
  }

  extractPositionFromDataset(dataSet) {
    let imagePositionPatient = this.getNumberValues(dataSet, 'x00200032', 3);

    // Trying to get the position from the Plane Position Sequence
    if (!imagePositionPatient && dataSet.elements.x00209113) {
      imagePositionPatient = this.getNumberValues(
        dataSet.elements.x00209113.items[0].dataSet,
        'x00200032',
        3
      );
    }

    // If position not valid to this point, trying to get the position
    // from the Detector Information Sequence (for NM images)
    if (!imagePositionPatient) {
      imagePositionPatient = this.extractPositionFromNMMultiframeDataset(dataSet);
    }

    return imagePositionPatient;
  }

  extractSpacingFromDataset(dataSet) {
    let pixelSpacing = this.getNumberValues(dataSet, 'x00280030', 2);

    // If pixelSpacing not valid to this point, trying to get the spacing
    // from the Pixel Measures Sequence
    if (!pixelSpacing && dataSet.elements.x00289110) {
      pixelSpacing = this.getNumberValues(
        dataSet.elements.x00289110.items[0].dataSet,
        'x00280030',
        2
      );
    }

    return pixelSpacing;
  }

  extractSliceThicknessFromDataset(dataSet) {
    let sliceThickness;

    if (dataSet.elements.x00180050) {
      sliceThickness = dataSet.floatString('x00180050');
    } else if (
      dataSet.elements.x00289110 &&
      dataSet.elements.x00289110.items.length &&
      dataSet.elements.x00289110.items[0].dataSet.elements.x00180050
    ) {
      sliceThickness =
        dataSet.elements.x00289110.items[0].dataSet.floatString('x00180050');
    }

    return sliceThickness;
  }


  getNumberValues(dataSet, tag, minimumLength) {
    const values = [];
    const valueAsString = dataSet.string(tag);

    if (!valueAsString) {
      return;
    }
    const split = valueAsString.split('\\');

    if (minimumLength && split.length < minimumLength) {
      return;
    }
    for (let i = 0; i < split.length; i++) {
      values.push(parseFloat(split[i]));
    }

    return values;
  }

  extractOrientationFromNMMultiframeDataset(dataSet) {
    let imageOrientationPatient;
    const modality = dataSet.string('x00080060');

    if (modality.includes('NM')) {
      const imageSubType = this.getImageTypeSubItemFromDataset(dataSet, 2);

      if (imageSubType && this.isNMReconstructable(imageSubType)) {
        if (dataSet.elements.x00540022) {
          imageOrientationPatient = this.getNumberValues(
            dataSet.elements.x00540022.items[0].dataSet,
            'x00200037',
            6
          );
        }
      }
    }

    return imageOrientationPatient;
  }

  getImageTypeSubItemFromDataset(dataSet, index) {
    const imageType = dataSet.string('x00080008');

    if (imageType) {
      const subTypes = imageType.split('\\');

      if (subTypes.length > index) {
        return subTypes[index];
      }
    }

    return undefined;
  }

  isNMReconstructable(imageSubType) {
    return imageSubType === 'RECON TOMO' || imageSubType === 'RECON GATED TOMO';
  }

  extractPositionFromNMMultiframeDataset(dataSet) {
    let imagePositionPatient;
    const modality = dataSet.string('x00080060');

    if (modality.includes('NM')) {
      const imageSubType = this.getImageTypeSubItemFromDataset(dataSet, 2);

      if (imageSubType && this.isNMReconstructable(imageSubType)) {
        if (dataSet.elements.x00540022) {
          imagePositionPatient = this.getNumberValues(
            dataSet.elements.x00540022.items[0].dataSet,
            'x00200032',
            3
          );
        }
      }
    }

    return imagePositionPatient;
  }
}
