import { Vue, Options } from "vue-class-component";
import localforage from "localforage";
import cornerstone from "cornerstone-core";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { useUserStore } from "../../../../store/user.js";
import arr from "./names.js"
import { CommandResultObject, DicomServerCommandType, WebSocketHelper } from "../../../../services/dicomServerCommandHelper";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

@Options({
  props: {},
  components: {},
})

export default class CornerStone extends Vue {
  webSocket: WebSocketHelper = null
  canvasDom: HTMLCanvasElement = null
  imageLoaderCB = null
  files = arr
  initDone = false
  currentImageIndex = 0
  imageIds = []
  cache = []
  public userStore = useUserStore();
  public patientInfo = [];
  public cetusImgIds = []

  mounted(): void {
    setTimeout(() => {
      console.log(8888, this.userStore.patientInfo)
      this.canvasDom = document.querySelector("#medContainer")
      const box1Dom = document.querySelector("#box1")
      const box2Dom = document.querySelector("#box2")
      cornerstone.enable(this.canvasDom)
      cornerstone.enable(box1Dom)
      cornerstone.enable(box2Dom)
      cornerstone.registerImageLoader('websocket', this.imageLoader)
      cornerstone.imageCache.setMaximumSizeBytes(83886080)
      // cornerstone.imageCache.setMaximumSizeBytes(85899345920)
      const _this = this
      this.openWS()
    }, 500);

    cornerstoneTools.init({
      showSVGCursors: true,
    });
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

  openWS() {
    var _this = this;
    if (!this.webSocket) {
        // this.webSocket = new WebSocketHelper("ws://10.5.65.20:5053/ws");
        this.webSocket = new WebSocketHelper("ws://10.5.66.10:12590/ws")
        // 发送完请求后的回调
        this.webSocket.registerCommandHandler(DicomServerCommandType.DICOMData, async (event: CommandResultObject) => {
          _this.wsEndCB(event)
        });
        this.webSocket.register().then(res => {
          if (res) {
            _this.initDone = true
            cornerstone.loadImage('websocket:' + _this.files[_this.currentImageIndex]).then(function(image) {
              console.log(99999999, image)
              cornerstoneTools.addStackStateManager(_this.canvasDom, ["stack"])
              const stack = {
                currentImageIdIndex: 0,
                imageIds: _this.imageIds
              }
              // 为启用元素添加 stack 工具状态
              cornerstoneTools.addToolState(_this.canvasDom, "stack", stack);
              cornerstone.displayImage(_this.canvasDom, image);
            })
            // _this.loadImage(_this.currentImageIndex)
          }
        })
    }
  }

  // 发送下载image指令
  loadImage(index) {
    // this.webSocket.paging(this.files[index].toString(), "Cell_0")
  }

  parseImageId(imageId) {
    const firstColonIndex = imageId.indexOf(':')
    let filename = imageId.substring(firstColonIndex + 1)
    return filename
  }

  imageLoader(imageId) {
    const filename = this.parseImageId(imageId);
    const _this = this
    const promise = new Promise(async (resolve, reject) => {
      let cacheFile = await localforage.getItem(filename)
      if(cacheFile) {
        let file = cacheFile
        const wandoImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
        cornerstone.loadImage(wandoImageId).then(function(image) {
          image.imageId = imageId
          _this.currentImageIndex++
          // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
          let num = _this.parseImageId(wandoImageId) - 2 || 0
          cornerstoneWADOImageLoader.wadouri.fileManager.remove(num)
          cacheFile = undefined
          file = undefined
          resolve(image)
        })
      } else {
        // _this.webSocket.paging(filename.toString(), "Cell_0")
        _this.imageLoaderCB = async (res) => {
          _this.imageIds.push(imageId);
          let file = new File([res], filename)
          localforage.setItem(filename, file)
          const wandoImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
          console.log(3333333, wandoImageId)
          cornerstone.loadImage(wandoImageId).then(async function(image) {
              image.imageId = imageId
              _this.currentImageIndex++
              if(_this.player.isPlay ) {

                if(_this.currentImageIndex >= _this.files.length) {
                  _this.player.isPlay = false
                  cornerstoneTools.stopClip(this.canvasDom)
                } else {
                  cornerstone.loadImage('websocket:' + _this.files[_this.currentImageIndex])
                }
              }
              let num = _this.parseImageId(wandoImageId) - 2 || 0
              cornerstoneWADOImageLoader.wadouri.fileManager.remove(num)
              // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
              cacheFile = undefined
              file = undefined
              resolve(image)
          })
        }
      }
    })
    return {
      promise
    }
  }

  // loadCetusImage() {
  //   let imageId =
  //         "wadouri:http://shenzhou.10.6.120.160.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=1.2.840.113704.1.111.18664.1584083328.2024";
  // }

  public player = {
    isPlay: false,
    startPlay: (startIndex = this.currentImageIndex) => {
      this.player.isPlay = true
      cornerstone.loadImage('websocket:' + this.files[startIndex])
      // this.loadImage(startIndex)
    },
    stopPlay: () => {
      this.player.isPlay = false
    }
  }


  // websocket请求完影像数据后的回调
  async wsEndCB(event: CommandResultObject ) {
    const _this = this
    _this.imageLoaderCB(event.ResultBinaryData)

    // const file = new File([event.ResultBinaryData], this.files[this.currentImageIndex])
    // const dicomInfo = JSON.parse(event.ResultJson);
    // const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
    // this.cache.push({fileName: dicomInfo.FileID, fileIndex: imageId.replace(/[^0-9]/g, '')})
    // _this.imageIds.push(imageId);
    // if(_this.initDone && _this.currentImageIndex === 0) {
    // cornerstone.loadImage(imageId).then(function(image) {
    //     console.log(999996, image)
    //     cornerstoneTools.addStackStateManager(_this.canvasDom, ["stack"])
    //     const stack = {
    //       currentImageIdIndex: 0,
    //       imageIds: _this.imageIds
    //     }
    //     // 为启用元素添加 stack 工具状态
    //     cornerstoneTools.addToolState(_this.canvasDom, "stack", stack);
    //     cornerstone.displayImage(_this.canvasDom, image);
    // })
    // }
    // _this.currentImageIndex++
    // if(_this.player.isPlay ) {
    //   if(_this.currentImageIndex >= _this.files.length) {
    //     _this.player.isPlay = false
    //     cornerstoneTools.stopClip(this.canvasDom)
    //   } else {
    //     _this.loadImage(_this.currentImageIndex)
    //   }
    // }
  }
  dicomWebSocket(e) {
      const _this = this
      console.log(55555555, cornerstone, cornerstone.imageCache.getCacheInfo())
      if (e.target.innerText === "播 放") {
        this.player.startPlay()
        cornerstoneTools.playClip(_this.canvasDom, 60)
        e.target.innerText = "暂 停"
      } else if (e.target.innerText === "暂 停") {
        this.player.stopPlay()
        cornerstoneTools.stopClip(this.canvasDom)
        console.log(55555555, cornerstone, cornerstone.imageCache.getCacheInfo(),cornerstoneWADOImageLoader.wadouri.fileManager.get(0),cornerstoneWADOImageLoader.wadouri.fileManager.get(161))
        e.target.innerText = "播 放"
      }
  }
  cleanCache(e) {
    debugger
    cornerstone.imageCache.purgeCache()
    cornerstoneWADOImageLoader.wadouri.fileManager.purge()
  }
}

