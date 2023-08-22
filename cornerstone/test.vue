<template>
  <div class="wrapper" v-loading="loading">

    <el-row class="Container">

      <!--菜单栏--图片列表-->

      <el-col :span="4">

        <div class="menuBar">

          <li @click="choose(index, item)" :class="{ clickClass: activeIndex === index }" v-for="(item, index) in group"
            :key="index">

            <!-- 已标注 -->

            <img v-if="item.state === 'complete'" :src="completeMark" />

            <!-- 未标注 -->

            <img v-else-if="item.state === 'wait'" :src="waitMark" />

            <span>{{ item.dataName }}</span>

          </li>

        </div>

      </el-col>

      <!--   标注区域-->

      <el-col :span="20">

        <div class="mainBar">

          <div class="toolBar">

            <div class="tool">

              <img :src="rectangleRoiImg" alt="标注笔" title="标注笔" @click="activeTool(cornerstoneToolsType)" />

            </div>

            <div class="tool">

              <img :src="eraserImg" alt="橡皮擦" title="橡皮擦" @click="activeTool('Eraser')" />

            </div>

          </div>

          <div style="width: 100%">

            <div id="cornerstone" class="imgContainer"></div>

          </div>

        </div>

      </el-col>

    </el-row>

  </div>
</template>




<script>

// 渲染我们的图像，并提供有用的事件和方法来使响应视口变化的工具成为可能

import cornerstone from "cornerstone-core"

// 某些工具用于辅助向量数学或其他复杂运算的依赖项

import cornerstoneMath from "cornerstone-math"

import cornerstoneTools from "cornerstone-tools"

// 触摸事件和手势的跨浏览器支持

import Hammer from "hammerjs"

// web图片加载

import cornerstoneWebImageLoader from "cornerstone-web-image-loader"




cornerstoneTools.external.cornerstone = cornerstone

cornerstoneTools.external.Hammer = Hammer

cornerstoneTools.external.cornerstoneMath = cornerstoneMath

cornerstoneWebImageLoader.external.cornerstone = cornerstone




export default {

  name: "editAnnotation",

  data() {

    return {

      cornerstoneToolsType: "RectangleRoi",

      loading: false,

      // 已标注

      completeMark: require("../../assets/image/dataAnnotation/yiwancheng.png"),

      // 未标注

      waitMark: require("../../assets/image/dataAnnotation/daishenhe.png"),

      // 标注笔

      rectangleRoiImg: require("../../assets/image/dataAnnotation/pencil.png"),

      // 橡皮擦

      eraserImg: require("../../assets/image/dataAnnotation/eraser.png"),

      // 左侧菜单

      activeIndex: -1,

      group: [],

      // 中间图片标注

      imgSrc: "",

      ele: null,

      toolDatas: null,

      markeData: {},

      // markeData: [],

      markeImgName: "",

      markImgId: ""

    }

  },

  mounted() {

    console.log("初始化")

    this.$nextTick(() => {

      // 自定义数据

      let group = [

        {

          id: "3587",

          dataIo: "https://img-blog.csdnimg.cn/f05140deecf5426a8348600b04a1511b.png",

          dataName: "wait-f15d275d82508c72b0d6eec84f11f0f.jpg",

          state: "wait"

        },

        {

          id: "3588",

          dataIo: "https://img-blog.csdnimg.cn/52d607e5ca44450491eae93fdf8916ad.png",

          dataName: "complete-dd17ee5124dcb64154f82e8d0fe4755.png",

          state: "complete"

        }

      ]

      this.imgSrc =

        "https://img-blog.csdnimg.cn/f05140deecf5426a8348600b04a1511b.png"

      this.group = group

      this.activeIndex = 0

      // 初始化

      this.initCornerstoneTools()

      // 加载标注状态

      this.loadToolStates()

    })

  },

  methods: {

    // 切换图片

    choose(index, item) {

      if (this.activeIndex === index) return

      // 保存标注内容

      this.saveToolData()

      this.activeIndex = index

      // this.markeData = {}

      this.activeIndex = index

      this.markImgId = item.id

      this.markeImgName = item.dataName

      this.imgSrc = item.dataIo

      this.clearToolState()

      this.loadToolStates()

      this.loadWebImg(this.imgSrc)

    },

    // 保存标注信息

    save() {

      this.saveToolData()

      // 标注数据

      let labelmeData = this.markeData[[this.markeImgName]]

    },

    // 初始化标注工具

    initCornerstoneTools() {

      cornerstoneTools.init({

        showSVGCursors: true

      })

      // ////console.log(cornerstoneTools)

      // 获取元素标签

      this.ele = document.querySelector("#cornerstone")

      cornerstone.enable(this.ele)

      // this.loadWebImg("https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ffile02.16sucai.com%2Fd%2Ffile%2F2014%2F0917%2F6f7a420c6fc8234bd6239f60057da72d.jpg&refer=http%3A%2F%2Ffile02.16sucai.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628411060&t=d1f3ec89fe316967003e1f757a0fb1a6");

      // 加载图像

      this.loadWebImg(this.imgSrc)

      // 添加方形选框工具

      this.addTools()

      // this.activeTool("RectangleRoi")

      // 激活工具

      this.activeTool(this.cornerstoneToolsType)

      // 添加选框颜色

      cornerstoneTools.toolColors.setToolColor("green")

    },

    // 加载图像

    loadWebImg(url) {

      console.log("图片正在加载中")

      cornerstone.loadAndCacheImage(url).then(image => {

        cornerstone.displayImage(this.ele, image)

      })

    },

    // 添加方形选框工具

    addTools() {

      // 添加工具

      console.log("工具正在加载中")

      // 方形选框

      cornerstoneTools.addTool(

        cornerstoneTools.RectangleRoiTool,

        this.ele

      )

      // 橡皮擦

      cornerstoneTools.addTool(cornerstoneTools.EraserTool, this.ele)

    },

    // 激活工具

    activeTool(toolName) {

      // 启用工具

      // { mouseButtonMask: 1 } //鼠标左键点击触发

      // { mouseButtonMask: 2 } //鼠标右键点击触发

      // { mouseButtonMask: 4 } //鼠标滚轮键点击触发

      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 })

    },

    // 清除工具

    clearToolState() {

      if (!this.ele) return

      // cornerstoneTools.clearToolState(this.ele, "RectangleRoi")



      cornerstoneTools.clearToolState(this.ele, this.cornerstoneToolsType)

      cornerstone.updateImage(this.ele)

    },

    // 保存工具状态

    saveToolData() {

      let data = cornerstoneTools.getToolState(

        this.ele,

        this.cornerstoneToolsType

      )

        ? JSON.parse(

          JSON.stringify(

            cornerstoneTools.getToolState(

              this.ele,

              this.cornerstoneToolsType

            ).data

          )

        )

        : null

      if (!data) return

      // this.markeData[this.markeImgName] = data

      this.markeData[this.group[this.activeIndex].id] = data

    },

    // 加载工具状态

    loadToolStates() {

      const toolDatas = this.markeData[this.group[this.activeIndex].id]

      // const toolDatas = this.markeData[[this.markeImgName]]

      console.log(toolDatas)

      if (!toolDatas) return

      setTimeout(() => {

        toolDatas.forEach(data => {

          cornerstoneTools.addToolState(

            this.ele,

            this.cornerstoneToolsType,

            data

          )

        })

        cornerstone.updateImage(this.ele)

      }, 300)

    }

  },

  beforeDestroy() {

    this.clearToolState()

  }

}

</script>



<style lang="scss" scoped>
.wrapper {

  text-align: left;




  .Container {

    border-top: 1px solid #b8cee0;

    padding-top: 15px;

  }

  .menuBar {

    height: 90vh;

    border: solid 1px grey;

    margin-left: 10px;

    overflow: auto;

    width: 100%;



    li {

      cursor: pointer;

      list-style: none;

      height: 50px;

      white-space: nowrap;

      padding-left: 10px;

      display: flex;

      justify-content: flex-start;

      align-items: center;

      min-width: max-content;

      img {

        width: 34px;

      }

      span {

        margin-left: 10px;

      }

    }

    //li选中颜色

    .clickClass {

      background: darken(#a7a7a7, 5%);

      width: 100%;

    }

    //滚动条

    &::-webkit-scrollbar {

      height: 15px;

      width: 15px;

    }


    &::-webkit-scrollbar-thumb {

      border-radius: 10px;

      box-shadow: inset 0 0 10px rgba(140, 140, 140, 0.8);

    }

  }



  .mainBar {

    margin: 0 16px;

    display: flex;

    flex-direction: row;

    .toolBar {

      display: flex;

      flex-direction: column;

      justify-content: flex-start;

      align-items: center;

      width: 40px;

      background: #e8ebee;


      .tool {

        width: 30px;

        margin: 0 5px;

        height: 36px;

        display: flex;

        justify-content: center;

        align-items: center;

        border-bottom: 1px solid #7a90ab;


        img {

          cursor: pointer;

          width: 22px;

        }

      }

    }

    .imgContainer {

      height: 90vh;

      border: 1px solid blue;

    }

  }

}
</style>
