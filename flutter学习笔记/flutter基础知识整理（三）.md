

！！！！！！！！！！！注意：还没写完，有的部分内容只是摘抄，仅供参考！！！！！！！！！！！！！！！！
<!-- TOC -->

- [Flutter基础知识](#flutter%e5%9f%ba%e7%a1%80%e7%9f%a5%e8%af%86)
  - [入口程序](#%e5%85%a5%e5%8f%a3%e7%a8%8b%e5%ba%8f)
  - [包管理文件：pubspec.yaml](#%e5%8c%85%e7%ae%a1%e7%90%86%e6%96%87%e4%bb%b6pubspecyaml)
    - [dart包配置项](#dart%e5%8c%85%e9%85%8d%e7%bd%ae%e9%a1%b9)
    - [flutter相关配置项](#flutter%e7%9b%b8%e5%85%b3%e9%85%8d%e7%bd%ae%e9%a1%b9)
  - [material design 设计风格](#material-design-%e8%ae%be%e8%ae%a1%e9%a3%8e%e6%a0%bc)
  - [使用 Themes 统一颜色和字体风格](#%e4%bd%bf%e7%94%a8-themes-%e7%bb%9f%e4%b8%80%e9%a2%9c%e8%89%b2%e5%92%8c%e5%ad%97%e4%bd%93%e9%a3%8e%e6%a0%bc)

<!-- /TOC -->

## Flutter基础知识
这部分知识属于flutter的基础，但部分知识比较零散，即使在官方文档里，也是比较分散的，有的说得也比较简单。这里就把遇到的，都整理出来。

### 入口程序
 flutter的入口文件在/lib里的main.dart文件里，有这样一段代码：
 ```dart
 void main() => runApp(new MyApp());
 ```
 其中main函数是dart的入口函数。在里面又执行了runApp。runApp则是Flutter的入口函数，它可以让其中的根组件充满整个屏幕。
 

### 包管理文件：pubspec.yaml
由于flutter使用的是dart，所以它使用的包也是dart包。dart包目录中都是至少含有一个pubspec文件。pubspec 文件记录一些关于包的元数据。此外，包还包含其他依赖项（在 pubspec 中列出）， Dart 库，应用，资源，测试，图片，以及示例。

下面分两部分讲：一是作为dart包的配置，另一个是为flutter静态资源的配置

#### dart包配置项
**注意：** yaml里以缩进表示层级
```yaml
name: shotcat  # 包名
# 包的描述 ，如果你对包是要发布在pub.dev则该项是必须的
description: Here  are two person, one is smart, the other one is stupid. I am sure the smart one. so who is the stupid one?
version: 0.0.1 # 包的版本,同样地如果发布到pub.dev上，则是必须的
author: shotcat # 包的作者
homepage: https://github.com/1011cat/shotCat_doc  # 包的主页

environment: # 指定环境 从dart2开始这项是必须项，其他我没提的都是可选项
  sdk: ">=2.0.0-dev.68.0 <3.0.0"

dependencies: # 指定包的依赖
  flutter:
    sdk: flutter
  intl: ^0.15.8 #如果是Pub站点上托管的包 直接声明名称和版本就行
  nima:  #当然你也可以引入自己本地的依赖包，名称和path路径
    path: ../dependencies/Nima-Flutter

dev_dependencies: #用于开发环境的依赖项 如果没有可以不写
  flutter_test: #用于flutter测试
    sdk: flutter
  #启用国际化
  flutter_localizations:
    sdk: flutter

```
常见一个项目会遇到的配置主要是这些了，更详细的可以参考[官方](https://dart.cn/tools/pub/pubspec)

#### flutter相关配置项
这部分是主要和flutter相关的静态资源。主要分为fonts字体和asserts(包括JSON 文件，配置文件，图标和图片（官方目前好像只支持部分svg，不过有第三方插件。通过下载ttf文件的形式也是可以使用阿里的iconfont）

更详细的说明可以参考官方文档：[fonts](https://flutter.cn/docs/cookbook/design/fonts)，[assets](https://flutter.cn/docs/development/ui/assets-and-images)
```yaml
flutter:
  #它允许使用预定义的Material icons集合。一般都会加上这句
  uses-material-design: true
  #定义字体
  fonts:
    - family: Raleway #family 属性决定了字体的名称，你将会在 TextStyle 的 fontFamily 属性中用到
      fonts:
        - asset: packages/awesome_package/fonts/Raleway-Regular.ttf #asset 是字体文件对于 pubspec.yaml 文件的相对路径。
        - asset: packages/awesome_package/fonts/Raleway-Italic.ttf
          weight: 700  #weight 属性为字体加粗，数值为 100 的整数倍，并且范围在 100 和 900 之间。
          style: italic  #style 属性指定文件中字体的轮廓为 italic 或 normal
 #定义assets资源
  assets:  #assets资源的路径，注意路径是与pubspec.yaml同级的
    - assets/  #如果要将一个文件夹下的所有资源(子文件夹除外)声明为assets，需要在文件夹名的结尾加上 /
    - assets/my_icon.png
    - assets/background.png
```

 - **使用不同分辨率的图片：**

移动端的图片一般都需要 1.0x 2.0x 3.0x 或是其他的任何倍数。那在flutter里是怎么使用的呢

首先我们将三张1.0x 2.0x 3.0x图片放在images文件夹里。

注意：其中2.0x和3.0x子文件夹分别存放两倍和三倍的图片

```
// 首先在images文件里这样进行存放不同尺寸的图片
images/shotcat.png       // images默认存放的就是 1.0x image
images/2.0x/shotcat.png  // 2.0x image
images/3.0x/shotcat.png  // 3.0x image
```
然后在pubspec.yaml里的assets下进行声明
```
// 只需要声明images默认存放的图片位置即可
assets:
 - images/shotcat.png
```

之后我们引用时，只需要使用默认的图片地址即可，flutter会自动根据设备分辨率选择合适的图片。
`image: AssetImage('images/shotcat.png')`

### material design 设计风格
material design是我最喜欢的设计风格，也是我选择flutter的重要原因。[官方网站可以看这里](https://www.material.io/) 前端三大框架也有对应的material design风格的ui框架。

在flutter中，官方提供了material design风格的包。当我们要在.dart文件中使用时，需要导入`import 'package:flutter/material.dart';`包。它包含了文本框，icon，布局等等组件。再强调一句，flutter中一切皆组件。

### 使用 Themes 统一颜色和字体风格
通过定义 Theme，我们可以更好地复用颜色和字体样式，从而让整个 app 的设计看起来更一致。全局 Theme 会在整个 app 范围内生效，而局部 Theme 只作用于特定元素。其实所谓的全局 Theme 和局部 Theme 的区别只在于，全局 Theme 定义在了 app 的 root 处而已。而 MaterialApp 已经事先为你预设了一个全局的 Theme Widget。