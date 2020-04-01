## SVG 描边动画
由于 SVG 是一种 XML 格式的文档，和 HTML 中的 DOM 类似。所以，**SVG 能通过 CSS 执行动画效果，当然通过js也是可以实现的。**

通过 CSS 的关键帧（keyframes）可以很轻松的对 SVG 进行操控，进而执行指定的动画效果。

## SVG 的一些优点

 - 1，与html搭配css实现先比，svg代码量更少（吗？）
 - 2，方便对样式进行修改
 - 3，更方便地制作动画（复杂的那种）

## SVG CSS 描边动画
**PS：** 这部分我将不引用小册的内容，因为讲的很一般。我下面的内容直到`动画原理`几乎都是粘贴这篇文章 [SVG 描边动画就这么简单](https://juejin.im/post/5d46b6eef265da03e05af710) 强烈推荐！，比小册详细，生动形象多了。

在svg里实现描边动画需要用到三个属性： stroke，stroke-dasharray 和 stroke-dashoffset

### stroke相关属性
为什么用相关属性呢，单纯的stroke只是设置stroke的颜色。其实还有很多其他属性。

  - stroke：颜色。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g>
    <path stroke="red" d="M0 20 l200 0" />
    <path stroke="green" d="M0 40 l200 0" />
    <path stroke="blue" d="M0 60 l200 0" />
  </g>
</svg>
```

![stroke](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3b7ebb0a702?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

 - stroke-width：宽度。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g stroke="black">
    <path stroke-width="2" d="M0 20 l200 0" />
    <path stroke-width="6" d="M0 40 l200 0" />
    <path stroke-width="12" d="M0 60 l200 0" />
  </g>
</svg>
```

![stroke-width](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3c5e7d53c76?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

 - stroke-linecap：线端点样式。取值`butt`、`round`、`square`，默认`butt`。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g stroke="black" stroke-width="6">
    <path stroke-linecap="butt" d="M10 20 l210 0" />
    <path stroke-linecap="round" d="M10 40 l210 0" />
    <path stroke-linecap="square" d="M10 60 l210 0" />
  </g>
</svg>
``` 

![stroke-linecap](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3c5e7f204a2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

 - stroke-opacity：透明度。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g stroke="black" stroke-width="6">
    <path stroke-opacity="0.2" d="M10 20 l210 0" />
    <path stroke-opacity="0.6" d="M10 40 l210 0" />
    <path stroke-opacity="1" d="M10 60 l210 0" />
  </g>
</svg>
```

![stroke-opacity](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3b580fec49c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



 - stroke-linejoin：转角处样式。取值`arcs`、`bevel`、`miter`、`round`，默认`miter`。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="400" height="300"
   viewBox="0 0 400 300">
  <g>
    <polyline stroke-linejoin="miter"
              points="20,100 60,30 100,100"
              stroke="black" stroke-width="30"
              fill="none" />

    <polyline stroke-linejoin="round"
              points="20,180 60,110 100,180"
              stroke="black" stroke-width="30"
              fill="none" />

    <polyline stroke-linejoin="bevel"
              points="20,260 60,190 100,260"
              stroke="black" stroke-width="30"
              fill="none" />

  </g>
</svg>
```

![stroke-linejoin](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3b729cd59e3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



### stroke-dasharray

 - stroke-dasharray：定义虚线样式。取值是一个逗号或者空格分隔的数列。数列的第一个值表示dash大小、第二值表示两个dash之间空隙大小。如`stroke-dasharray:10,2`表示dash大小10、dash间隙2。如果提供数列是奇数个，则会重复一次形成偶数个。如`stroke-dasharray:10`等效于`stroke-dasharray:10, 10`或`stroke-dasharray:10, 2, 5`等效于`stroke-dasharray:10, 2, 5, 10, 2, 5`。

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g stroke="black" stroke-width="6">
    <path stroke-dasharray="5,5" d="M10 20 l210 0" />
    <path stroke-dasharray="10,10" d="M10 40 l210 0" />
    <path stroke-dasharray="20,10,5,5,5,10" d="M10 60 l210 0" />
  </g>
</svg>
```

![stroke-dasharray](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3c5e7ecb9d1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 
> 
> singsong：也就是说 `stroke-dasharray` 取值数列以两个数值为一个单元划分，每个单元第一个值表示dash大小，第二值表示两个dash之间空隙大小。[演示实例](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E6%8F%8F%E8%BE%B9%E5%8A%A8%E7%94%BB/demo/stroke-dasharray.html)
> 

![dasharray](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3c5e821d52c?imageslim)

### stroke-dashoffset 让描边动起来

这个属性用于指定 stroke-dasharray 开始的偏移量。也是本文重点介绍对象，理解该属性如何工作，就能很好地掌握 svg 描边动画。stroke-dashoffset 取值可以大于 0，也可以小于 0。[演示实例](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E6%8F%8F%E8%BE%B9%E5%8A%A8%E7%94%BB/demo/stroke-dashoffset.html)。 （值也可以是百分数，百分数是相对于 SVG 的 viewport。）

*   取值大于 0

    ![dashoffset1](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3b79c6e091a?imageslim)
*   取值小于 0。等效于`offset = s - |-offset| % s`。其中`offset`表示正取值，`s`表示`dasharray`的总和（如：`dasharray: '100 50'`，则`s: 150`）。

    ![dashoffset2](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3e860e3e787?imageslim)

### 动画原理
这里原理以我自己理解，最易懂的方式给大家讲解：

让描边动起来主要用到了stroke-dasharray和stroke-dashoffset。

 - **先上代码和呈现的效果：**

```css
// path 为我们的svg
.path {
   // 这个数值为svg的长度，如何取得，后面会说。其实可以**最近大一点**的整数524也是可以的
  stroke-dasharray: 523.1047973632812; 
  stroke-dashoffset: 0;
  animation: dash 2s linear 3s alternate infinite;
}

// 动画 stroke-dashoffset从svg的长度逐渐变为0
@keyframes dash {
    from {
        stroke-dashoffset: 523.1047973632812;
    }
    to {
        stroke-dashoffset: 0;
    }
}
```
我们通常会将 stroke-dasharray 设置为路径总长度。如总长度为s，stroke-dasharray: s或stroke-dasharray: s s。再将 stroke-dashoffset 取值从 s 变化到 0，就可实现从无到有的描边动画。

效果图：[演示实例](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E6%8F%8F%E8%BE%B9%E5%8A%A8%E7%94%BB/demo/animation_js.html)


![dasharray](https://user-gold-cdn.xitu.io/2019/8/4/16c5c3c65b33c829?imageslim)
