import { Vue, Options } from "vue-class-component";
import cornerstone from "cornerstone-core";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
// import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader/dist/dynamic-import/cornerstoneWADOImageLoader.min.js';
import { useUserStore } from "../../../../store/user.js";
import * as Utility from 'uih-mcsf-utility';
import * as Viewer from 'uih-mcsf-medviewercontrol';
import { AppBase } from 'uih-mcsf-vue-apptoolkit';
import { cloneDeep } from "lodash";
@Options({
  props: {
    appBase: Object,
  },
  components: {},
})
// 4。手动调控IndexedDB读取和写入；我们控制下载和IndexedDB的读写。

export default class CornerStone extends Vue {
  showMultiCell = false
  imageIdURLTemp = "http://shenzhou.10.6.120.160.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID="
  allImageInfo = null
  imageIds = null
  isCacheAllImages = false
  isRequesting = false
  downloadList = [] // 下载项
  requestingList = {} // 当前已经提交下载，正在下载，还没有下载完的数据
  cacheFiles = [] // 暂时缓存在内存里，待存到indexedDB的数据，item值为file
  cleanCacheTimer = null
  preLoadTimer = null
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
    'Reset Windowing': 'resetWindow', // 重置窗宽窗位
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

  cornerList = []

  cornerInfo = {
    topLeft: {
      name: {
        tag: '00100010',
        value: ''
      },
      id: {
        tag: '00100020',
        value: ''
      },
      birthDate: {
        tag: '00100030',
        value: ''
      },
      sex: {
        tag: '00100040',
        value: ''
      },
      age: {
        tag: '00101010',
        value: ''
      },
      acquisitionDate: {
        tag: '00080022',
        value: ''
      },
      acquisitionTime: {
        tag: '00080032',
        value: ''
      },
      seriesNumber: {
        tag: '00200011',
        value: ''
      },
      instanceNumber: {
        tag: '00200013',
        value: ''
      },
      imagesInAcquisition: {
        tag: '00201002',
        value: ''
      },
    },
    topRight: {
      institutionName: {
        tag: '00080080',
        value: ''
      },
      modality: {
        tag: '00080060',
        value: ''
      },
      manufacturer: {
        tag: '00080070',
        value: ''
      },
      modelName: {
        tag: '00081090',
        value: ''
      },
    },
    bottomLeft: {
      sliceThickness: {
        tag: '00180050',
        value: ''
      },
      sliceLocation: {
        tag: '00201041',
        value: ''
      }
    },
    bottomRight: {
      scale: {
        tag: '00731001',
        value: ''
      },
      windowWidth: {
        tag: '00281051',
        value: ''
      },
      windowCenter: {
        tag: '00281050',
        value: ''
      },
      renderType: {
        tag: '90000000',
        value: ''
      },
    }
  }
  isShowLeftProgressBar = false
  leftProgressInfo = ''
  leftProgressPercent = 0
  appBase: AppBase;

  mounted(): void {
    this.$watch(
      () => this.userStore.patientInfo,
      () => {
        if (this.studyList.length === 0) {
          this.studyList = this.userStore.patientInfo.StudyList
          this.curSeriesUID = this.studyList[0].SeriesList[0].UID
          // this.start()
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
    })
    setTimeout(() => {
      this.initCellDom()
      const boxDom = document.querySelector(".cornerstone-box")
      const cornerMsgDom = document.querySelector(".corner-msg")
      boxDom.classList.add('cornerstone-1x1')
      cornerMsgDom.classList.add('cornermsg-1x1')
      this.initCornerstone()
      this.initCornerstoneTools()
      this.initProxy()
      this.initCornerInfo()
    }, 500)
  }

  getCurrentDom() {
    const index = this.getCurrentCellIndex()
    return document.querySelector(".cornerstoneCell" + index)
  }

  getCurrentCellIndex() {
    const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl);
    const currentCell = viewerControl?.selectedCell as any
    return currentCell?.cellIndex || 0
  }

  initCellDom() {
    const box = document.createElement('div')
    box.setAttribute('class', 'cornerstone-box')
    document.querySelector("#medContainer").append(box)
    for (let index = 0; index < 4; index++) {
      const cell = document.createElement('div')
      cell.setAttribute('class', 'cornerstoneCell' + index)
      box.appendChild(cell)
    }
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
    // 设置cornerstone内存
    // cornerstone.imageCache.setMaximumSizeBytes(83886080) //100mb
    // cornerstone.imageCache.setMaximumSizeBytes(524288000) // 500mb
    cornerstone.imageCache.setMaximumSizeBytes(1048576000) // 1g
    // cornerstoneWADOImageLoader的配置
    // cornerstoneWADOImageLoader.configure({
    //   useWebWorkers: false,
    // });
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: 5,
      startWebWorkersOnDemand: false,
      taskConfiguration: {
          decodeTask: {
            loadCodecsOnStartup : false,
            initializeCodecsOnStartup: false,
          },
      },
    })
    // 添加 stack 状态管理器
    const dom0 = document.querySelector(".cornerstoneCell0")
    const dom1 = document.querySelector(".cornerstoneCell1")
    const dom2 = document.querySelector(".cornerstoneCell2")
    const dom3 = document.querySelector(".cornerstoneCell3")
    dom0.addEventListener('click', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[0]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom0.addEventListener('touchend', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[0]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom1.addEventListener('click', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[1]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom1.addEventListener('touchend', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[1]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom2.addEventListener('click', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[2]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom2.addEventListener('touchend', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[2]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom3.addEventListener('click', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[3]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    dom3.addEventListener('touchend', e => {
      const divDom =  document.querySelectorAll('.MedViewControl > div > p > div')[3]
      const targetDom = divDom.querySelector('div')
      const cellname = targetDom.getAttribute('data-cellname')
      const viewerControl = this.appBase.getSpecificModel(Viewer.MedViewerControl)
      const cell = viewerControl.cells.find(m => m.cellName === cellname);
      viewerControl.setSelectedCellsStatus(cell);
    })
    cornerstone.enable(dom0)
    cornerstone.enable(dom1)
    cornerstone.enable(dom2)
    cornerstone.enable(dom3)
    cornerstoneTools.addStackStateManager(dom0, ["stack"])
    cornerstoneTools.addStackStateManager(dom1, ["stack"])
    cornerstoneTools.addStackStateManager(dom2, ["stack"])
    cornerstoneTools.addStackStateManager(dom3, ["stack"])
  }

  // 初始化cornerstonetool工具配置
  initCornerstoneTools() {
    this.tools.forEach((tool) => {
      this.addTool(tool.name, tool.props);
    });
  }

  initProxy() {
    Utility.Messenger.on("menuClick", menu => {
      if(menu.uiName === 'ChangeLayout' ) {
        const boxDom = document.querySelector(".cornerstone-box")
        const cornerMsgDom = document.querySelector(".corner-msg")
        if(menu.commandParameter === '2d_1x1') {
          boxDom.setAttribute('class', 'cornerstone-box cornerstone-1x1')
          cornerMsgDom.setAttribute('class', 'corner-msg cornermsg-1x1')
        }
        if(menu.commandParameter === '2d_1x2') {
          boxDom.setAttribute('class', 'cornerstone-box cornerstone-1x2')
          cornerMsgDom.setAttribute('class', 'corner-msg cornermsg-1x2')
        }
        if(menu.commandParameter === '2d_2x2') {
          boxDom.setAttribute('class', 'cornerstone-box cornerstone-2x2')
          cornerMsgDom.setAttribute('class', 'corner-msg cornermsg-2x2')
        }
        this.resetMedDom()
        return
      }
      const toolName = this.toolNameMap[menu.uiName]
      const fns = ['Reset Windowing', 'resetWindow', 'resetImage', 'clearTool', 'playVideo']
      if(fns.includes(toolName)) {
        this[toolName]()
      } else {
        toolName && this.setToolActive(toolName)
      }
    })
  }

  initCornerInfo() {
    for (let index = 0; index < 4; index++) {
      const copy = cloneDeep(this.cornerInfo)
      this.cornerList.push(copy)
    }
    this.cornerList
  }

  // 重置窗宽窗位
  resetWindow() {
    const dom = this.getCurrentDom()
    const image = cornerstone.getImage(dom)
    const viewport = cornerstone.getViewport(dom)
    viewport.voi.windowWidth = image.windowWidth
    viewport.voi.windowCenter = image.windowCenter
    cornerstone.setViewport(dom, viewport)
  }

  resetImage() {
    const dom = this.getCurrentDom()
    cornerstone.reset(dom)
  }

  async start() {
    const res = this.getImageInfoAndImageIds()
    this.allImageInfo = res.allImageInfo
    this.imageIds = res.imageIds
    const dom = this.getCurrentDom()
    // 添加 stack 状态管理器
    const stack = {
      currentImageIdIndex: 0,
      imageIds: this.imageIds,
      preventCache: false,
    }

    cornerstoneTools.clearToolState(dom, "stack")
    cornerstoneTools.addToolState(dom, "stack", stack)
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
    this.displayFistImage(dom, this.resetImage)
    this.cacheImages()
    const index = this.getCurrentCellIndex()
    const target = this.cornerList[index]
    dom.addEventListener("cornerstoneimagerendered", (e: any) => {
      setTimeout(() => {
        this.getCornerInfo(target)
      }, 500);

      this.preLoadImage(e, dom)
      this.cleanCache()
      // cornerstoneWADOImageLoader.webWorkerManager.terminate();
      // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge();
    })
    this.resetMedDom()
  }

  preLoadImage(e, dom) {
    clearTimeout(this.preLoadTimer)
    const imageId = e.detail.image.imageId
    const imageIds = cornerstoneTools.getToolState(dom, 'stack').data[0].imageIds
    const index = imageIds.indexOf(imageId)
    const nextImageId = imageIds[index + 1]
    if (!cornerstone.imageCache.imageCache[nextImageId]) {
      this.preLoadTimer = setTimeout(() => {
        const loadImageIds = imageIds.slice(index + 1, Math.min(index + 101, imageIds.length - 1))
        this.cacheImages(loadImageIds, 5)
        this.preLoadTimer = null
      }, 600);
    }
  }

  resetMedDom() {
    setTimeout(() => {
      const medDoms = document.querySelectorAll(".MedViewControl > div > p > div > div") as any
      medDoms.forEach(dom => {
        dom.style.zIndex = 'initial'
      })
    }, 100);
  }

  getCornerInfo(target) {
    const dom = this.getCurrentDom()
    const image = cornerstone.getImage(dom)
    const dataSet = image.data
    const { topLeft, topRight, bottomLeft, bottomRight } = target
    Object.keys(topLeft).forEach((item: any) => {
      topLeft[item].value = dataSet.string('x' + topLeft[item].tag)
    })
    Object.keys(topRight).forEach((item: any) => {
      if(item === 'institutionName') {
        // 解析中文字符
        const value = dataSet.string('x' + topRight[item].tag)
        topRight[item].value = decodeURIComponent(escape(value));
      } else {
        topRight[item].value = dataSet.string('x' + topRight[item].tag)
      }
    })
    Object.keys(bottomLeft).forEach((item: any) => {
      bottomLeft[item].value = dataSet.string('x' + bottomLeft[item].tag)
    })
    Object.keys(bottomRight).forEach((item: any) => {
      bottomRight[item].value = dataSet.string('x' + bottomRight[item].tag)
    })
  }

  displayFistImage(dom, callback) {
    cornerstone.loadAndCacheImage(this.imageIds[0]).then(image => {
      cornerstone.displayImage(dom, image)
      callback && callback()
    })
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
    const dom = this.getCurrentDom()
    const manager = cornerstoneTools.getElementToolStateManager(dom);
    for (let i = 0; i < this.tools.length; i++) {
      let toolData = manager.get(dom, this.tools[i].name);
      if (toolData) { toolData.data = []; };
    }
    cornerstoneTools.external.cornerstone.updateImage(dom);
  }

  playVideo(e) {
    const dom = this.getCurrentDom()
    if (this.isPlaying === false) {
      cornerstoneTools.playClip(dom, 30)
      // this.cleanCacheTimer = setInterval(this.cleanCache, 3000)
      this.isPlaying = true
    } else if (this.isPlaying === true) {
      // clearInterval(this.cleanCacheTimer)
      cornerstoneTools.stopClip(dom)
      this.isPlaying = false
    }
  }

  cleanCache() {
    // const dom = this.getCurrentDom()
    // const image = cornerstone.getImage(dom);

    // // 封装获取影像信息的方法
    // function getImageInfoByDataSet(dataSet) {
    //   const imageInfo = {
    //     patientName: dataSet.string("x00100010"),
    //     patientBirthday: dataSet.string("x00100030"),
    //     patientSex: dataSet.string("x00100040"),
    //     patientAge: dataSet.string("x00101010")
    //     // ...
    //   };

    //   return imageInfo;
    // }

    // const imageInfo = getImageInfoByDataSet(image.data);
    // cornerstoneTools.stopClip(dom)
    // cornerstone.imageCache.purgeCache()
    // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    if (!this.cleanCacheTimer) {
      this.cleanCacheTimer = setTimeout(() => {
        cornerstoneWADOImageLoader.webWorkerManager.terminate()
        cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
        this.cleanCacheTimer = null
      }, 3000);
    }
    // setTimeout(() => {
    //   cornerstoneWADOImageLoader.webWorkerManager.terminate()
    //   cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    //   // cornerstoneTools.playClip(dom, 30)
    // }, 20);
  }

  test() {
    // cornerstoneWADOImageLoader.webWorkerManager.terminate()
    // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
    // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge()
    console.log(7777777777, cornerstoneWADOImageLoader, cornerstone, cornerstone.imageCache.getCacheInfo())
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
      // imageInfo.imageId = "cetus:" + this.imageIdURLTemp + item.UID
      imageInfo.imageId = "wadouri:" + this.imageIdURLTemp + item.UID
      // imageInfo.imageId = "wadouri:http://shenzhou.10.6.120.131.sslip.io/imageServer/Home/ImageService?CommandType=GetImage&contentType=application%2Fdicom&OBJECTUID=" + item.UID
      imageInfo.instanceNum = index
      // imageInfo.wandoImageId = "wadouri:" + this.imageIdURLTemp + item.UID
      allImageInfo[imageInfo.uid] = imageInfo
      imageIds.push(imageInfo.imageId)
    })
    return { allImageInfo, imageIds}
  }


  parseImageId(imageId) {
    const uidIndex = imageId.indexOf('&OBJECTUID=')
    let uid = imageId.substring(uidIndex + 11)
    return { uid }
  }

  // 控制发送请求
  cacheImages(imageIds = this.imageIds, max = 5, cb = null){
    let index = 0
    let arr = new Array(max).fill(null)
    if (imageIds.length === this.imageIds.length) {
      this.isShowLeftProgressBar = true
      this.leftProgressInfo = '当前影像下载进度：'
      this.leftProgressPercent = 0
    }
    arr = arr.map(() => {
      return new Promise((resolve) => {
        const run = async () => {
          this.leftProgressPercent = Math.floor((index/imageIds.length) * 100)
          // 出口，结束递归条件
          if(index >= imageIds.length) {
            resolve(null)
            this.isShowLeftProgressBar = false
            return
          }
          if (!cornerstone.imageCache.imageCache[imageIds[index]]) {
            cornerstone.loadAndCacheImage(imageIds[index]).then(image => {
              index++
              run()
            })
          } else {
            index++
            run()
          }
        }
        run()
      })
    })
    Promise.all(arr).then(() => {
      // cornerstoneWADOImageLoader.webWorkerManager.terminate();
      // cornerstoneWADOImageLoader.wadouri.fileManager.purge()
      // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge();
      this.isShowLeftProgressBar = false
      console.log(9999999999, cornerstoneWADOImageLoader, cornerstone, cornerstone.imageCache.getCacheInfo())
      cb && cb()
    })
  }
}

