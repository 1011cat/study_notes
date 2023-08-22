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
// 3，给足内存，写入IndexedDB完毕后再删内存；经验证，读取内存和写入不冲突，考虑边下载边写入。写入完毕后再删除内存。

export default class CornerStone extends Vue {
  showMultiCell = false
  imageIdURLTemp = "http://shenzhou.10.6.120.160.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID="
  canvasDom: HTMLCanvasElement = null
  maxChacheFiles = 100
  db = null
  infoStore = null
  fileStore = null
  isIndexedDBCtrl = false
  fileGetList = []
  fileAddList = []
  indexedDBConfig = {
    dbName: 'myIndexedDB',
    version: 2,
    autoIncrement: false,
    infoStoreName: 'infoStore',
    infoStoreKey: 'uid',
    fileStoreName: 'filesStore',
    fileStoreKey: 'name'
  }
  allImageInfo = null
  imageIds = null
  isCacheAllImages = false
  isRequesting = false
  lowList = [] // 普通优先级下载
  highList = [] // 优先下载数据
  requestingList = {} // 当前已经提交下载，正在下载，还没有下载完的数据
  cacheFiles = [] // 暂时缓存在内存里，待存到indexedDB的数据，item值为file
  indexedDBFiles = {} // 当前序列，所有缓存到indexedDB的数据，item值为uid
  cleanCacheTimer = null
  cacheIndex = 0
  public userStore = useUserStore()

  mounted(): void {
    setTimeout(() => {
      this.initCornerstone()
      this.initIndexDB(this.indexedDBConfig)
    }, 1000)
    this.$watch(() => [this.fileGetList, this.cacheFiles], (newVal, oldVal) => {
      if(!this.isIndexedDBCtrl && (this.fileGetList.length > 0 || this.cacheFiles.length > 0)) {
        this.indexedDBCtrl()
      }
    }, {immediate: true, deep: true})
    this.$watch(() => [this.lowList, this.highList], (newVal, oldVal) => {
      if(!this.isRequesting && (this.lowList.length > 0 || this.highList.length > 0)) {
        this.requestCtrl(5, () => {
          // 全部缓存完
          if (this.lowList.length === 0) {
            const uid = this.userStore.patientInfo.StudyList[0].SeriesList[6].UID
            this.addInfoData({uid, isCached: true})
            this.isCacheAllImages = false
            console.log(6666666,  '下载缓存完毕')
          }
        })
      }
    }, {immediate: true, deep: true})
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
    cornerstone.imageCache.setMaximumSizeBytes(600000)
    // 设置cornerstone内存为100mb
    // cornerstone.imageCache.setMaximumSizeBytes(83886080)
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
    const { dbName, version, autoIncrement, infoStoreName, infoStoreKey, fileStoreName, fileStoreKey } = indexedDBConfig
    let indexedDB = window.indexedDB
    const req = indexedDB.open(dbName, version)
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
      db.createObjectStore(fileStoreName, {
        keyPath: fileStoreKey,
        autoIncrement
      })
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
    const uid = this.userStore.patientInfo.StudyList[0].SeriesList[6].UID
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
    console.log(55555555, this.highList, this.requestingList, this.cacheFiles, this.indexedDBFiles)
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
    cornerstoneWADOImageLoader.webWorkerManager.terminate()
    cornerstoneWADOImageLoader.wadouri.fileManager.purge()
    cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    cornerstoneTools.playClip(this.canvasDom, 30)
  }

  getImageInfoAndImageIds(patientInfo) {
    const allImageInfo = {}
    const imageIds = []
    let imageList = patientInfo.StudyList[0].SeriesList[6].ImageList
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

  indexedDBCtrl() {
    this.isIndexedDBCtrl = true
    const storeName = this.indexedDBConfig.fileStoreName
    const run = () => {
      if(this.fileGetList.length === 0 && this.cacheFiles.length === 0) {
        this.isIndexedDBCtrl = false
        return
      }
      if(this.fileGetList.length > 0 && this.cacheFiles.length < this.maxChacheFiles) {
        const store = this.db.transaction([storeName], "readonly").objectStore(storeName)
        const { uid, callback } = this.fileGetList[0]
        this.fileGetList.shift()
        const req = store.get(uid)
        req.addEventListener('success', e => {
          callback(e.result || e.target.result)
          run()
        })
      } else {
        if(this.cacheIndex >= this.maxChacheFiles) {
          const trans = this.db.transaction([storeName], "readwrite")
          const store = trans.objectStore(storeName)
          const copy = this.cacheFiles.slice(-1 * this.maxChacheFiles)
          this.cacheIndex = 0
          copy.forEach(file => {
            const req = store.add(file)
            req.addEventListener('success', e => {
              this.indexedDBFiles[file.name] = true
            })
          })

          trans.oncomplete = (e) => {
            run()
          }
        }
        this.isIndexedDBCtrl = false
        return
      }
    }
    run()
  }

  // 获取dicom影像数据，name值取的是uid
  getFileData(name) {
    // const storeName = this.indexedDBConfig.fileStoreName
    // if(!this.isIndexedDBCtrl) this.indexedDBCtrl()
    return new Promise((resolve, reject) => {
      this.fileGetList.unshift({uid: name, callback: (data) => {
        resolve(data)
      }})

      // const req = this.db.transaction([storeName], "readonly")
      // .objectStore(storeName)
      // .get(name)
      // req.addEventListener('success', e => {
      //   resolve(e.result || e.target.result)
      // })
    })
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
      const file = await this.checkCachefilesAndDB(uid)
      if (file) {
        const image = await this.getImageFromFile(file)
        resolve(image)
        return
      }
      // 如果缓存都没有则发起请求
      this.highList.push({
        imageInfo,
        requestFn: this.downloadFileCtrl,
        callback: (image) => {
          resolve(image)
        }
      })
      // 如果没有正在下载的请求操作，则手动调用
      // this.isRequesting || this.requestCtrl()
      return
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
    this.lowList = []
    this.isCacheAllImages = true
    imageIds.forEach(async (imageId, index) => {
      const uid = this.parseImageId(imageId).uid
      const imageInfo = this.allImageInfo[uid]
      this.lowList.push({
        imageInfo,
        requestFn:  this.downloadFileCtrl
      })
        // TODO: 当为最后一张时，需要触发下载和缓存到indexedDB中，使用cb实现
    })
    this.requestCtrl(5, () => {
      // 全部缓存完
      if (this.lowList.length === 0) {
        const uid = this.userStore.patientInfo.StudyList[0].SeriesList[6].UID
        this.addInfoData({uid, isCached: true})
        this.isCacheAllImages = false
        console.log(6666666,  '下载缓存完毕')
      }
    })
  }

  // 控制发送请求
  requestCtrl(max = 5, callback = null){
    this.isRequesting = true
    let index = 0
    let arr = new Array(max).fill(null)
    arr = arr.map(() => {
      return new Promise((resolve) => {
        const run = async () => {
          // 出口，结束递归条件
          if((index >= this.lowList.length || this.lowList.length === 0) && this.highList.length === 0) {
            this.isRequesting = false
            resolve(null)
            return
          }
          // TODO：判断image是否已经下载了，或者已经缓存了
          // 需要考虑，如果高优先级是最后一张和requests最后一张的情况
          // 先判断高优先级数组是否为空，即当前用户在操作的数据
          // TODO: 在任何下载前，都需要判断该资源是否已经在cachefiles或者indexedDB中，因为全都是异步的。
          if (this.highList.length > 0) {
            const { imageInfo, requestFn, callback } = this.highList[0]
            // 先判断是否已经缓存了
            const file = await this.checkCachefilesAndDB(imageInfo.uid)
            if(file) {
              this.highList.shift()
              const image = await this.getImageFromFile(file)
              callback && callback(image)
              run()
            } else if (this.requestingList[imageInfo.uid]) {
              // 如果请求影像已经正在请求中，则将callback添加到正在请求的回调中
              this.requestingList[imageInfo.uid].push(callback)
              // this.requestingList[imageInfo.uid] = [callback]
              this.highList.shift()
              run()
            } else {
              this.highList.shift()
              const lowIndex = this.lowList.findIndex(item => item.imageInfo.uid === imageInfo.uid)
              if(lowIndex) {
                this.lowList.splice(lowIndex, 1)
              }
              // 执行下载操作
              requestFn(imageInfo, (image) => {
                callback && callback(image)
                run()
              })
            }
          } else {
            const { imageInfo, requestFn, callback } =  this.lowList[index]
            index = index + 1
            const file = await this.checkCachefilesAndDB(imageInfo.uid)
            if(file) {
              const image = await this.getImageFromFile(file)
              callback && callback(image)
              run()
            } else if (this.requestingList[imageInfo.uid]) {
              // 如果请求影像已经正在请求中，则将callback添加到正在请求的回调中
              this.requestingList[imageInfo.uid].push(callback)
              run()
            } else {
              requestFn(imageInfo, (image) => {
                callback && callback(image)
                run()
              })
            }
            this.isRequesting = false
            resolve(null)
            return
          }
        }
        run()
      })
    })
    Promise.all(arr).then(() => { this.isRequesting = false; callback && callback()})
  }

  // 检查目标影像是否在cachefiles和indexedDB中，如果在则返回对应的file文件，如果不在则返回false
  async checkCachefilesAndDB(uid) {
    // 先判断是否在cacheFiles中
    const file = this.cacheFiles.find(val => val.name === uid)
    if (file) {
      return file
    }
    // 再判断是否在indexedDB中
    if (this.indexedDBFiles[uid]) {
      let indexedDBCache = await this.getFileData(uid)
      return indexedDBCache
    }
    return false
  }

  // TODO :优化成通过requestCtrl来进行下载
  async displayFistImage(dom) {
    const uid = this.parseImageId(this.imageIds[0]).uid
    const imageInfo = this.allImageInfo[uid]
    // 先判断是否在cacheFiles中
    const file = this.cacheFiles.find(val => val.name === uid)
    if (file) {
      const image = await this.getImageFromFile(file)
      cornerstone.displayImage(dom, image)
      return
    }
    // 再判断是否在indexedDB中
    if (this.indexedDBFiles[uid]) {
      let indexedDBCache = await this.getFileData(uid)
      // indexedDBCache如果不存在，则说明有bug或者indexedDB中的缓存被删了
      const image = await this.getImageFromFile(indexedDBCache)
      cornerstone.displayImage(dom, image)
      return
    }
    this.highList.push({
      imageInfo,
      requestFn: this.downloadFileCtrl,
      callback: (image) => {
        cornerstone.displayImage(dom, image)
      }
    })
    // this.isRequesting || this.requestCtrl()
  }

  // 只负责从cetus下载数据，加入到cacheFiles,并回调存到indexedDB
  downloadFileCtrl(imageInfo, callback) {
    // step1 先用WADOImageLoader下载cetus的dicom
    this.requestingList[imageInfo.uid] = []
    cornerstone.loadImage(imageInfo.wandoImageId).then(async (image) => {
      image.imageId = imageInfo.imageId
      // 合并有插入的回调
      const callbacks = [...this.requestingList[imageInfo.uid], callback]
      delete this.requestingList[imageInfo.uid]
      callbacks.length > 0 &&  callbacks.forEach(cb => typeof cb === "function" && cb(image))

      let file = new File([image.data.byteArray], imageInfo.uid)
      // 如果达到缓存最高数量，则执行存入到indexedDB中
      console.log(333333, this.cacheFiles.length)
      this.cacheIndex++
      if(this.cacheFiles.length >= this.maxChacheFiles) {
        const copy = this.cacheFiles
        // this.cacheFiles = []
        // this.batchCacheIndexedDB(copy)
      }
      this.cacheFiles.push(file)
    })
  }

  test() {
    this.batchCacheIndexedDB(this.cacheFiles)
  }

  batchCacheIndexedDB(files) {
    if(!this.isIndexedDBCtrl) this.indexedDBCtrl()
    // return new Promise((resolve, reject) => {
    //   const storeName = this.indexedDBConfig.fileStoreName
    //   const trans = this.db.transaction([storeName], "readwrite")
    //   const store = trans.objectStore(storeName)
    //   const start = Date.now()
    //   console.log('开始存indexedDB')
    //   files.forEach(file => {
    //     const req = store.add(file)
    //     req.addEventListener('success', e => {
    //       this.indexedDBFiles[file.name] = true
    //     })
    //   })
    //   trans.oncomplete = (e) => {
    //     resolve('done')
    //     const end = Date.now()
    //     console.log('批量100张存入indexedDB完成' + ((end -start)/1000))
    //   }
    // })
  }

  async getImageFromFile(indexedDBCache) {
    const wandoImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(indexedDBCache)
    const image = await cornerstone.loadImage(wandoImageId)
    return image
  }
}
const concurrencyRequest = (urls, maxNum) => {
  return new Promise((resolve) => {
      if (urls.length === 0) {
          resolve([]);
          return;
      }
      const results = [];
      let index = 0; // 下一个请求的下标
      let count = 0; // 当前请求完成的数量

      // 发送请求
      async function request() {
          if (index === urls.length) return;
          const i = index; // 保存序号，使result和urls相对应
          const url = urls[index];
          index++;
          console.log(url);
          try {
              const resp = await fetch(url);
              // resp 加入到results
              results[i] = resp;
          } catch (err) {
              // err 加入到results
              results[i] = err;
          } finally {
              count++;
              // 判断是否所有的请求都已完成
              if (count === urls.length) {
                  console.log('完成了');
                  resolve(results);
              }
              request();
          }
      }

      // maxNum和urls.length取最小进行调用
      const times = Math.min(maxNum, urls.length);
      for(let i = 0; i < times; i++) {
          request();
      }
  })
}
