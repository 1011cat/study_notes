<!-- TOC -->

- [svg概述](#svg%e6%a6%82%e8%bf%b0)
- [svg优点](#svg%e4%bc%98%e7%82%b9)
- [svg标签属性](#svg%e6%a0%87%e7%ad%be%e5%b1%9e%e6%80%a7)
  - [viewPort](#viewport)
  - [viewBox](#viewbox)
  - [preserveAspectRatio](#preserveaspectratio)
- [svg的基本形状](#svg%e7%9a%84%e5%9f%ba%e6%9c%ac%e5%bd%a2%e7%8a%b6)
  - [矩形 rect](#%e7%9f%a9%e5%bd%a2-rect)
  - [圆 circle](#%e5%9c%86-circle)
  - [线 line](#%e7%ba%bf-line)
- [SVG组合和路径](#svg%e7%bb%84%e5%90%88%e5%92%8c%e8%b7%af%e5%be%84)
  - [组合 g](#%e7%bb%84%e5%90%88-g)
  - [路径 path](#%e8%b7%af%e5%be%84-path)
- [SVG使用方法](#svg%e4%bd%bf%e7%94%a8%e6%96%b9%e6%b3%95)
  - [在标签里应用SVG图片](#%e5%9c%a8%e6%a0%87%e7%ad%be%e9%87%8c%e5%ba%94%e7%94%a8svg%e5%9b%be%e7%89%87)
  - [使用SVG作为背景图片](#%e4%bd%bf%e7%94%a8svg%e4%bd%9c%e4%b8%ba%e8%83%8c%e6%99%af%e5%9b%be%e7%89%87)
  - [内联（inline）应用SVG](#%e5%86%85%e8%81%94inline%e5%ba%94%e7%94%a8svg)

<!-- /TOC -->

## svg概述

SVG 是一种开放标准的**矢量图形语言**，即表示可缩放矢量图形（Scalable Vector Graphics）格式，是由万维网联盟（W3C）开发并进行维护的。

## svg优点

 - **可以无限缩小放大**：因为SVG 图像是矢量图像，故可以无限放大缩小。这样SVG 就可以在任何分辨率的设备上高清显示，不需要再像以前一样输出各种 @2x 倍图来适配不同分辨率的屏幕。
 - **方便使用CSS 和 JavaScript 进行交互：** 因为 SVG 还是一种 XML 格式的图形，所以我们可以使用 CSS 和 JavaScript 与它们进行交互。
 - 兼容性好：不过ie需要11以上，但在移动端是没有任何问题的。
 
 ![](https://user-gold-cdn.xitu.io/2019/2/28/1693400d3c51d375?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## svg标签属性
svg采用类似canvas的坐标系统，以左上角为0，0原点，从左往右计算x值，从上到下计算y值。
```xml
<svg x="0px" y="0px" width="300px" height="100px" viewBox="0 0 30 10" version="1.1"
xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="5" fill="white" stroke="black" width="90" height="90"></rect>
</svg>
```
version 属性可定义所使用的 SVG 版本，xmlns 属性可定义 SVG 命名空间。

svg上的width和height属性也可以放在css上写，不写成行内式。并且不写width和height，svg也会默认继承父级的宽高。

### viewPort
viewPort指的就是svg显示的区域。上例中：` x="0" y="0" width="300" height="100"`指的就是viewPort区域。它的单位是user unit，在默认情况下一个user unit等于一个屏幕单位（一个像素）。上例中就是300px * 100px。

### viewBox
viewBox也是一个区域。不过它是从viewPort里开始截取，然后将截取的区域铺满viewPort。

viewBox属性的值是一个包含4个参数的列表 x:左上角横坐标，y:左上角纵坐标，width:宽度，height:高度。 以空格或者逗号分隔开。它截取的区域就是从坐标(x, y)开始，截取宽为width，高为height的矩形。然后用它铺满viewPort。

网上有这个比喻帮助理解：SVG就像是我们的显示器屏幕，viewBox就是截屏工具选中的那个框框，最终的呈现就是把框框中的截屏内容再次在显示器中**全屏显示**！

结合这个图更好理解

![](https://user-gold-cdn.xitu.io/2019/2/28/16932fff571cf24d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### preserveAspectRatio
上例中viewPort和viewBox的宽高比例都是3:1。所以viewBox可以完美铺满viewPort（放大10倍铺满，并且不会失真）。但很多时候这两者的比例并不是那么匹配（就像你的另一半一样），这时拉伸铺满就会导致画图比例失调（强扭的瓜不甜）。这个时候就需要preserveAspectRatio属性，**来设置viewBox**怎么铺满viewPort。

语法：preserveAspectRatio = `<align> <meet | slice>`。

PS：这里说的语法并不完全适用于 `<image>` 元素

**第一个参数`<align>`：**  

属性值表示是否强制统一缩放，当SVG的viewbox属性与视图属性宽高比不一致时使用.  `<align>` 属性的值一定是下列的值之一:

*   **none**
    不会进行强制统一缩放，如果需要，会缩放指定元素的图形内容，使元素的边界完全匹配视图矩形。
    (注意：如果 `<align>` 的值是 `none` ，则 `<meetOrSlice>` 属性的值将会被忽略。)
*   **xMinYMin** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值与视图的X的最小值对齐。
    将SVG元素的viewbox属性的Y的最小值与视图的Y的最小值对齐。
*   **xMidYMin** - 强制统一缩放。
    将SVG元素的viewbox属性的X的中点值与视图的X的中点值对齐。
    将SVG元素的viewbox属性的Y的最小值与视图的Y的最小值对齐。
*   **xMaxYMin** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值+元素的宽度与视图的X的最大值对齐。
    将SVG元素的viewbox属性的Y的最小值与视图的Y的最小值对齐。
*   **xMinYMid** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值与视图的X的最小值对齐。
    将SVG元素的viewbox属性的Y的中点值与视图的Y的中点值对齐。
*   **xMidYMid** (默认值) - 强制统一缩放。
    将SVG元素的viewbox属性的X的中点值与视图的X的中点值对齐。
    将SVG元素的viewbox属性的Y的中点值与视图的Y的中点值对齐。
*   **xMaxYMid** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值+元素的宽度与视图的X的最大值对齐。
    将SVG元素的viewbox属性的Y的中点值与视图的Y的中点值对齐。
*   **xMinYMax** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值与视图的X的最小值对齐。
    将SVG元素的viewbox属性的Y的最小值+元素的高度与视图的Y的最大值对齐。
*   **xMidYMax** - 强制统一缩放。
    将SVG元素的viewbox属性的X的中点值与视图的X的中点值对齐。
    将SVG元素的viewbox属性的Y的最小值+元素的高度与视图的Y的最大值对齐。
*   **xMaxYMax** - 强制统一缩放。
    将SVG元素的viewbox属性的X的最小值+元素的宽度与视图的X的最大值对齐。
    将SVG元素的viewbox属性的Y的最小值+元素的高度与视图的Y的最大值对齐。


**第二个参数`<meet | slice>`：** 

如果提供的话， 与 `<align>` 间隔一个或多个的空格 ，参数所选值必须是以下值之一:

*   **meet** (默认值) - 图形将缩放到:
    *   宽高比将会被保留
    *   整个SVG的viewbox在视图范围内是可见的
    *   尽可能的放大SVG的viewbox，同时仍然满足其他的条件。在这种情况下，如果图形的宽高比和视图窗口不匹配，则某些视图将会超出viewbox范围（即SVG的viewbox视图将会比可视窗口小）。
*   **slice** - 图形将缩放到:
    *   宽高比将会被保留
    *   整个视图窗口将覆盖viewbox
    *   SVG的viewbox属性将会被尽可能的缩小，但是仍然符合其他标准。
	在这种情况下，如果SVG的viewbox宽高比与可视区域不匹配，则viewbox的某些区域将会延伸到视图窗口外部（即SVG的viewbox将会比可视窗口大）。

**PS:** 如果还不能理解的话，可以参考这篇文章：[理解SVG坐标系和变换：视窗,viewBox和preserveAspectRatio](https://www.w3cplus.com/html5/svg-coordinate-systems.html)

## svg的基本形状
这里主要介绍有三种：
 - 矩形（rect）
 - 圆（circle）
 - 线（line）

例子：
```xml
<svg x="0px" y="0px" width="300px" height="100px" viewBox="0 0 300 100">
  <rect x="10" y="5" fill="white" stroke="black" width="90" height="90"></rect>
  <circle cx="170" cy="50" r="45" fill="white" stroke="black"></circle>
  <line fill="none" stroke="black" x1="230" y1="6" x2="260" y2="95"></line>
</svg>
```
得到的结果如下：

![](https://user-gold-cdn.xitu.io/2019/3/4/16946735b02144b6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 矩形 rect
rect 标签是用来定义矩形（包括正方形），其中 x和y属性，**相对于 svg 元素进行定位**，在这个例子中是相对 svg 左上角进行定位的。
 - fill 表示填充形状的颜色
 - stroke 表示边框的颜色
 
如果没有指定值，则它们的默认值是 fill:black， 和 stroke:none 即表示没有描边。

### 圆 circle

 - cx 和 cy 定义的是圆心坐标
 - r 为圆的半径

当然，也可以使用 **ellipse** 元素来绘制椭圆形，只不过是多了两个参数：rx（短轴长）和 ry（横轴长）。 比如下面代码就表示一个短轴长为 100，横轴长为50的椭圆。

```xml
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="50" rx="100" ry="50" />
</svg>
```
### 线 line
**line** 表示一条直线，也非常的简单：

```xml
<line fill="none" stroke="black" x1="230" y1="6" x2="260" y2="95"></line>

```
 - x1和y1为直线的起点
 - x2和y2表示线的终点

## SVG组合和路径
先看例子：
```xml
<svg viewBox="0 0 580 400" xmlns="http://www.w3.org/2000/svg">
 <g>
  <path id="svg_5" d="m148.60774,139.10039c28.24222,-69.1061 138.89615,0 0,88.8507c-138.89615,-88.8507 -28.24222,-157.9568 0,-88.8507z" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/>
  <path id="svg_6" d="m265.00089,146.09396l19.88082,-21.09307l21.11909,22.40665l21.11909,-22.40665l19.88101,21.09307l-21.11909,22.40684l21.11909,22.40684l-19.88101,21.09326l-21.11909,-22.40684l-21.11909,22.40684l-19.88082,-21.09326l21.11891,-22.40684l-21.11891,-22.40684z" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/>
 </g>
</svg>
```
得到的结果如下：

![](https://user-gold-cdn.xitu.io/2019/3/4/1694674797d67a67?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 组合 g
 g 标签即 group 组，它可以用来集合多个 SVG 元素，比如上面的两个 path 元素。而且 g 所设置的 fill 和 stroke 可以直接应用到没有设置相关属性的子元素。
 

### 路径 path
path来定义路径。元素的语法，路径起始于 d 属性，即 data，也就是一条路径的绘图数据。d 一般是以一个 M 或者是 m（moveTo）为第一个值，即确定一个起点。

下面来看看 path 语法中的各种命令的含义。

![](./images/1571733471560.png)

**PS：**

 - 是不是灰常复杂？由于绘制路径的复杂性，**因此强烈建议使用 SVG 编辑器来创建复杂的图形**
 - 其实除了g标签，并且常见的`<defs>、<symbol>和<use>`我觉得还是有必要提一下。看来这本小册是真的立足于入门，毕竟9.9。

## SVG使用方法
使用svg主要有以下三种方式：
 - 在标签里应用SVG图片
 - 使用SVG作为背景图片
 - 内联（inline）应用SVG

### 在标签里应用SVG图片

直接在 img 标签里，导入你的 SVG 文件：

```xml
<img src="emoj.svg" alt="emoj">

```

![](https://user-gold-cdn.xitu.io/2019/2/28/169333925cc1d858?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 使用SVG作为背景图片

定义 SVG 图片为背景图片也很简单，直接在 CSS 里定义背景图片就可以了。

```
<a href="/" class="emoji">
	emoji
</a>

```

CSS：

```
 .emoji {
   display: block;
   text-indent: -9999px;
   width: 100px;
   height: 82px;
   background: url(emoji.svg);
   background-size: 100px 82px;
 }

```

这里的 CSS 我们用了一个很常见的 CSS 技巧，以图换字，用图片来代替文字。注意：`background-size`设置成我们想要的尺寸，否则只能看到很大的原始SVG图片的左上角。这个尺寸设置成了跟原始尺寸保持宽高比，如果在不知道原始尺寸的情况下想要保持宽高比，可以把`background-size`设置成`contain`。

### 内联（inline）应用SVG

所谓内联，就是直接把 SVG 代码插入到html文件中，使用你喜欢的编辑器打开 SVG 文件，就可以得到 SVG 图片的代码如下所示，然后把它插入到html文件中就可以了。

```html
<!DOCTYPE html>
<html>
<body>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="190">
  <polygon points="100,10 40,180 190,60 10,60 160,180"
  style="fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;" />
</svg>

</body>
</html>

```
