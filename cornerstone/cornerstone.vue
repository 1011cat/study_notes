<template>
  <div class="cornerstone">
    <div v-if="isShowLeftProgressBar" class="left-progress-bar-container">
      <label ref="progress">{{ leftProgressInfo }}</label>
      <a-progress
        :percent="leftProgressPercent"
        :show-info="false"
        :stroke-color="{ from: '#8295f5', to: '#c7cce2' }"
      />
    </div>
    <!-- <a-button @click="test" style="z-index: 999;">test</a-button> -->
    <div class="corner-msg">
      <template v-for="(item, index) in cornerList" v-if="cornerList.length > 0">
        <div :class="'corner-box' + index" class="corner-box">
          <div class="topLeft">
            <div class="name">{{ item.topLeft.name.value }}</div>
            <div class="id">{{ item.topLeft.id.value }}</div>
            <div class="box">
              <div class="birthDate">{{ item.topLeft.birthDate.value }}</div>
              <div class="sex">{{ item.topLeft.sex.value }}</div>
              <div class="age">{{ item.topLeft.age.value }}</div>
            </div>
            <div class="box">
              <div class="acquisitionDate">{{ item.topLeft.acquisitionDate.value }}</div>
              <div class="acquisitionTime">{{ item.topLeft.acquisitionTime.value }}</div>
            </div>
            <div class="box">
              <div class="seriesNumber">{{ item.topLeft.seriesNumber.value }}</div>
              <div class="instanceNumber">{{ item.topLeft.instanceNumber.value }}</div>
              <div class="imagesInAcquisition">{{ item.topLeft.imagesInAcquisition.value }}</div>
            </div>
          </div>
          <div class="topRight">
            <div class="institutionName">{{ item.topRight.institutionName.value }}</div>
            <div class="modality">{{ item.topRight.modality.value }}</div>
            <div class="box">
              <div class="manufacturer">{{ item.topRight.manufacturer.value }}</div>
              <div class="modelName">{{ item.topRight.modelName.value }}</div>
            </div>
          </div>
          <div class="bottomLeft">
            <div class="box">
              <div class="sliceThickness">{{ item.bottomLeft.sliceThickness.value }}</div>
              <div class="sliceLocation">{{ item.bottomLeft.sliceLocation.value }}</div>
            </div>
          </div>
          <div class="bottomRight">
            <div class="scale">{{ item.bottomRight.scale.value }}</div>
            <div class="box">
              <div class="windowWidth">{{ item.bottomRight.windowWidth.value }}</div>
              <div class="windowCenter">{{ item.bottomRight.windowCenter.value }}</div>
            </div>
            <div class="renderType">{{ item.bottomRight.renderType.value }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" src="./cornerstone.ts" />
<style lang="less">
.cornerstone {
  width: calc(100% - 22px);
  height: calc(100% - 66px);
  position: absolute;
  bottom: 0;

  .left-progress-bar-container {
    left: -195px !important;
    bottom: 100px !important;
  }

  .corner-msg {
    width: 100%;
    height: 100%;
    position: absolute;

    .topLeft {
      display: inline-block;
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 103;
      font-size: 12px;
      font-family: Arial;
      line-height: 1.3;
      color: rgba(255, 255, 255, 255);

      div {
        margin-right: 6px;
      }
    }

    .topRight {
      display: inline-block;
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 103;
      font-size: 12px;
      font-family: Arial;
      text-align: right;
      line-height: 1.3;
      color: rgba(255, 255, 255, 255);

      .div {
        text-align: right;
        margin-left: 6px;
      }
    }

    .bottomLeft {
      display: inline-block;
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 103;
      font-size: 12px;
      font-family: Arial;
      line-height: 1.3;
      color: rgba(255, 255, 255, 255);

      div {
        margin-right: 6px;
      }
    }

    .bottomRight {
      display: inline-block;
      position: absolute;
      bottom: 23px;
      right: 10px;
      z-index: 103;
      font-size: 12px;
      font-family: Arial;
      line-height: 1.3;
      color: rgba(255, 255, 255, 255);

      div {
        text-align: right;
        margin-left: 6px;
      }
    }

    .box {
      div {
        display: inline-block;
      }

    }
  }

  .cornermsg-1x1 {
    .corner-box {
      width: 0;
      height: 0;
      display: none;
    }

    .corner-box0 {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }
  }

  .cornermsg-1x2 {
    display: inline-flex;
    .corner-box {
      width: 0;
      height: 0;
      display: none;
    }

    .corner-box0 {
      display: block;
      width: 50%;
      height: 100%;
      position: relative;
    }

    .corner-box1 {
      display: block;
      width: 50%;
      height: 100%;
      position: relative;
    }
  }

  .cornermsg-2x2 {
    display: inline-flex;
    flex-flow: row wrap;

    .corner-box {
      width: 50%;
      height: 50%;
      position: relative;
    }
  }
}

#medContainer {
  position: relative;
}

.cornerstone-canvas {
  padding: 3px;
}

.cornerstone-box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}

.cornerstone-1x1 {
  div {
    width: 0;
    height: 0;
    position: relative;
    z-index: 101;
  }

  .cornerstoneCell0 {
    width: 100%;
    height: 100%;
  }
}

.cornerstone-1x2 {
  display: inline-flex;
  flex-flow: row wrap;

  div {
    width: 0;
    height: 0;
    position: relative;
    z-index: 101;
  }

  .cornerstoneCell0 {
    width: 50%;
    height: 100%;
  }

  .cornerstoneCell1 {
    width: 50%;
    height: 100%;
  }
}

.cornerstone-2x2 {
  display: inline-flex;
  flex-flow: row wrap;

  div {
    width: 50%;
    height: 50%;
    position: relative;
    z-index: 101;
  }
}

.image-viewer-container-pad {
  #medContainer {
    position: relative;
  }

  .cornerstone {
    width: calc(100% - 182px);
    height: calc(100% - 70px);
    position: absolute;
    top: 55px;
    // display: none !important;
  }

  .cornerstone-canvas {
    // padding: 3px;
    position: absolute;
    top: 3px;
    right: 3px;
    padding-bottom: 5px;
    padding-left: 5px;
    // display: none !important;
  }
  .left-progress-bar-container {
    left: -170px !important;
    bottom: 100px !important;
  }
}
</style>
