<!-- TOC -->

- [why flutter](#why-flutter)
    - [，强大的跨平台](#强大的跨平台)
    - [，优秀的组件支持](#优秀的组件支持)
    - [，晌应式框架](#晌应式框架)
    - [，支持插件](#支持插件)
    - [，超高性能](#超高性能)
- [flutter特点](#flutter特点)
  - [!important 一切皆为组件（widget）](#important-一切皆为组件widget)
  - [组件嵌套](#组件嵌套)
  - [组件状态](#组件状态)
    - [无状态组件与有状态组件](#无状态组件与有状态组件)
- [学习建议](#学习建议)
  - [务必保存的网址](#务必保存的网址)
  - [flutter镜像配置](#flutter镜像配置)
  - [学习的flutter项目](#学习的flutter项目)

<!-- /TOC -->
## why flutter
#### 1，强大的跨平台
现在flutter至少可以跨5种平台（ **MacOS, Windows、 Linux、 Android、 iOS**）， 甚至可以在，甚至支持嵌入式开发（niubility！）。甚至可以在谷歌最新的操作系统 Fuchsia上运行 。 到目前为止， **Flutter算是支持平台最多的框架了！**

#### 2，优秀的组件支持
flutter内置惊艳的 **Material Design** (that's my shit!) 和 Cupertino 风格(苹果风格，暂不是很全)组件、丰富的 motionAPI给你最靓的用户体验。

#### 3，晌应式框架
使用 Flutter的响应式框架和一系列基础组件，可以轻松构建你的各种界面。

#### 4，支持插件
通过 Flutter 的插件可以访问平台本地 API，如相机、蓝牙、 WiFi 等 。 借助现有的 Java、 Swift、 Objectiv C、 C++代码实现对原生系统的调用 。

#### 5，超高性能
**Flutter采用 GPU渲染技术，所以性能极高。** Flutter编写的应用是可以达到 60fps，这也就是说，它完全可以胜任游戏的制作 。 官方宣称用 Flutter开发的应用甚至会超过原生应用的性能。

PS：小声说，flutter在ios的流畅度和android比还是相差有点大的，具体原因嘛，emmmmm....

## flutter特点
这里提到的都是flutter的主要特点，**是我们编写flutter的基本意识！** 如果有不理解的，先记住结论，后面的文章会有详解的。
###  !important 一切皆为组件（widget）
**在flutter中一切皆为组件**，这句话非常重要，我们在开始写flutter之前，**一定要有这样的意识。这样我们就能更好地上手学习。** 在flutter里，几乎任何东西都是组件，不仅是常见的ui组件，甚至是布局方式，样式，动画等都是widget（组件）

Widget 可以定义为 :
 - 界面组件(如按钮或输入框) 。
 - 文本样式(如字体或颜色) 。
 - 布局(如填充或滚动) 。
 - 动画处理(如缓动) 。
 - 手势处理( GestureDetector)。

每个Widget都具有丰富的属性及方法 ，属性通常用来改变组件的状态(颜色、大小等)及事件回调方法的处理(单击事件回调、手势事件回调等)。 方法主要是提供一些组件的功能扩展。

### 组件嵌套
组件嵌套可以说是flutter的一个特色，也可以说是一个恶心之处，上面说过flutter里一切皆为组件，所以在复杂的界面里不可避免的会出现各种深层组件嵌套。有时候比回调地狱还恶心。

![enter description here](./images/1571070230596.png)

PS：左边的缺角就像被街霸的肯，发了个“好哟跟”

### 组件状态
和react一样，flutter也是组件化的思想，其中状态（state）就是一个组件的UI数据模型，是组件渲染时的数据依据。**Flutter程序的运行可以认为是一个巨大的状态机，** 用户的操作、请求 API 和系统事件的触发都是推动状态机运行的触发点，触发点**通过调用 setState 方法推动状态机进行响应 。**

#### 无状态组件与有状态组件
组件又分为两大类：

 - 无状态组件（继承自StatelessWidget）：初始化后无法修改其状态和UI，如 Text、Assetlmage等
 - 有状态组件(继承自StatefulWidget)：其状态可能在Widget生命周期中发生变化。如 Scrollable、Animatable等。注意：**在调用setState后，组件类会重新绘制，创建其新的widget**

PS：StatefulWidget | StatelessWidget 共性:都继承自Widget

所以我们在编写组件时，同样也要有状态意识，首先判断它是有状态的还是无状态的。

如果 Widget 需要根据用户交互或其他因素进行更改，则该 Widget 是有状态的 。 当你创建一个有状态组件，则它须继承自StatefulWidget。并且创建的组件的状态也会存储在state的子类中。后面当你需要改变组件的状态时，**必须调用setState方法来通知flutter来更新创建新的widget。**

## 学习建议
学习一种新框架，新语言。我觉得有三点是非常重要的。

 - 1，完善详细的文档和资料
	 - 学习flutter可以说是我见过的，官方对中文支持最友好的，没有之一。虽然flutter是由谷歌开发的，但中国却是使用最多的国家。自然官方也是相当重视的，它拥有几乎和英文同步的中文文档，几乎所有官方视频都有中文字幕，以及中文的codelabs。所以学习flutter真的是一件门槛很低的一件事。
 - 2，拥有可以方便快速，执行代码的环境
	 - 这个是必须条件，补充一下，官方特意为中国提供了线上的[dart运行环境](https://dartpad.cn/ )，
 - 3，拥有可以学习模仿的项目代码
	 - 这个是很重要的，当你学习一种新的语言和框架，难免会遇到各种各样的坑。这时如果有一份优秀的项目代码可以给你参考和模仿。会帮助你少走很多弯路，也会帮助你养成良好的编码规范。
 - 补充：4，第四点就是用新框架写一个新项目。一般情况下这个项目会是公司项目，但如果你能写一个自己的项目，根据自己的意愿去设计去研究并最后实现，往往会取得更好的效果。你的收获也将是最多的！

### 务必保存的网址
前面说过flutter对中国市场的重视，所以它们是有详细完善到发指的中国官网，速度快，且不需要翻墙。PS：**不要用百度查flutter，你搜到的第一个根本不是flutter官网！！！**  它是早期的一个热心网友翻译官网文档的网站。现在已经完全不能和官中网站比，大家不要进错了，有梯子的还是尽量用谷歌，不要用百度了。

 - **官方中文网站：** https://flutter.cn/ 这里拥有最新最详细的中文文档。详细的分类，甚至为web，ios，android，RN开发者分别提供了不同的开发指南。
 - **Flutter codelabs：** https://codelabs.flutter-io.cn  当你想要检验你的flutter，它会为你提供详尽的代码任务，每个任务都会有详尽的步骤，几乎手把手教你进行编程。在学习初期，进行知识的巩固非常有效果。
 - **awesome-flutter：** https://github.com/Solido/awesome-flutter  看见awesome，大家都懂，这里包含了许多和flutter相关，且质量优秀的项目。
 - **Dart官方中文网站：** https://dart.cn/ flutter使用的不是JS而是自家的dart，一种借鉴了java，c++，JavaScript的语言。所以它也是必须要掌握的。
 - **Dart线上环境：** https://dartpad.cn/ 学习一种语言，必须要有对应的环境。dart不像JS是可以直接在浏览器的console里运行。而这个官方线上环境则很好地进行了弥补。多说一句：遇到任何不懂的问题，就敲出来，跑起来进行验证！

PS：flutter和dart的官方中文文档。每段中文，点击后都会显示对应的原版英文文档，很贴心。这对那些想学习英语，尤其那些编程术语的，提高阅读英文文档，真的很有帮助！

### flutter镜像配置
关于不同平台安装flutter[官方](https://flutter.cn/docs/get-started/install) 已经很详细了，这里我就不bb了，凑字数了。这里只提下flutter镜像设置。

如果你看不懂网上和官方那些教你配置镜像的教程。这里告诉一个更直接的办法：

 - 直接在你安装flutter的地方，查找叫`.bash_profile`的隐藏文件。
 - 用文本编辑器打开，直接粘贴上这两行,最后保存就行了。
 ```
 export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
 ```
 这样你就保存了社区主镜像，它采用多种方式同步 Flutter 开发者资源，也是官方推荐的。
 

###  学习的flutter项目
当你在学习一个新框架时，模仿学习别人优秀的代码，往往是最好的老师。这里我简单列举三个项目以供参考：

 - flutter gallery：这个是官方的示例app，里面有flutter的各种使用场景，是我们学习模仿的模板。[传送门](https://github.com/flutter/flutter/tree/master/examples/flutter_gallery)
 - HistoryOfEverything：这也是官方在一个分享会里推荐的一个app。它有着令人惊讶的动画表现力和流畅度(小声说：至少android是这样的)。对，它呈现的就是那些，你们之前说的那些追着ui打的动效。[传送门](https://github.com/2d-inc/HistoryOfEverything)
 - Flutter-Story-App-UI：这个项目是我在油管上看到的，显示效果也是真的不错。作者：devefy 其他的flutter项目也具有很好的参考价值 [传送门](https://github.com/devefy/Flutter-Story-App-UI)

推荐的这几个项目，都是之前我们常说的不能让ui看见或者追着ui打的设计。但是在flutter的加持下，它们变得不再那么难以实现。

**最后再推荐一个flutter工具：fluttergo**

这个软件可以直接在应用市场下，它是由阿里一些工程师利用摸鱼时间做的一个app。

 - 里面包含了全网最新的flutter文章和新闻。
 - 里面包含了大部分flutter组件的效果展示和对应的属性方法说明
