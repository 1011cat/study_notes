
！！！！！！！！！！！注意：还没写完，有的部分内容只是摘抄，仅供参考！！！！！！！！！！！！！！！！

<!-- TOC -->

- [Flutter基础知识](#flutter基础知识)
  - [入口程序](#入口程序)
  - [material design 设计风格](#material-design-设计风格)
  - [包管理文件：pubspec.yaml](#包管理文件pubspecyaml)
    - [dart包配置项](#dart包配置项)
    - [flutter相关配置项](#flutter相关配置项)
  - [使用 Themes 统一颜色和字体风格](#使用-themes-统一颜色和字体风格)
    - [设置全局Theme](#设置全局theme)
    - [设置局部Theme](#设置局部theme)
    - [使用主题](#使用主题)
  - [有状态和无状态的 widgets](#有状态和无状态的-widgets)
    - [StatelessWidget和StatefulWidget的使用](#statelesswidget和statefulwidget的使用)
    - [深度理解StatelessWidget和StatefulWidget](#深度理解statelesswidget和statefulwidget)
    - [StatelessWidget和StatefulWidget的使用建议](#statelesswidget和statefulwidget的使用建议)
  - [声明式UI](#声明式ui)
  - [使用包资源（packages）](#使用包资源packages)
    - [包的使用](#包的使用)
  - [数据请求](#数据请求)
    - [,添加http包](#添加http包)
    - [,进行网络请求](#进行网络请求)

<!-- /TOC -->

## Flutter基础知识
这部分知识属于flutter的基础，但部分知识比较零散，即使在官方文档里，也是比较分散的，有的说得也比较简单。这里就把遇到的，都整理出来。

### 入口程序
 flutter的入口文件在/lib里的main.dart文件里，有这样一段代码：
 ```dart
 void main() => runApp(new MyApp());
 ```
 其中main函数是dart的入口函数。在里面又执行了runApp。runApp则是Flutter的入口函数，它可以让其中的根组件充满整个屏幕。
 
### material design 设计风格
material design是我最喜欢的设计风格，也是我选择flutter的重要原因。[官方网站可以看这里](https://www.material.io/) 前端三大框架也有对应的material design风格的ui框架。

在flutter中，官方提供了material design风格的包。当我们要在.dart文件中使用时，需要导入`import 'package:flutter/material.dart';`包。它包含了文本框，icon，布局等等组件。再强调一句，flutter中一切皆组件。

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

### 使用 Themes 统一颜色和字体风格
主题这个东西，做程序时，一般都会单独提出一个css文件，作为全局的样式风格，既能实现css复用，也方便后期主题样式修改。

在flutter里，可以直接设置Theme（不需要自己提出来），从而让整个 app 的设计看起来更一致。

Theme分为：
 - 全局 Theme ：会在整个 app 范围内生效，因为全局 Theme 定义在了 app 的 root 上
 - 局部Theme：只作用于特定元素

#### 设置全局Theme
全局 Theme 会影响整个 app 的颜色和字体样式。MaterialApp 已经事先为你预设了一个全局的 Theme Widget，只需要向 MaterialApp 构造器传入 ThemeData（全局配置项） 即可。

```dart
MaterialApp(
  title: title,
  theme: ThemeData(
    // Define the default brightness and colors.
    brightness: Brightness.dark,
    primaryColor: Colors.lightBlue[800],
    accentColor: Colors.cyan[600],
    
    // Define the default font family.
    fontFamily: 'Montserrat',
    
    // Define the default TextTheme. Use this to specify the default
    // text styling for headlines, titles, bodies of text, and more.
    textTheme: TextTheme(
      headline: TextStyle(fontSize: 72.0, fontWeight: FontWeight.bold),
      title: TextStyle(fontSize: 36.0, fontStyle: FontStyle.italic),
      body1: TextStyle(fontSize: 14.0, fontFamily: 'Hind'),
    ),
  )
);
```

**ThemeData属性及解释**

| 属性 | 解释 |
| --- | --- |
| brightness | Brightness类型，应用程序的整体主题亮度。用于按钮等小部件，以确定在不使用主色（primaryColor）或强调色（accentColor）时选择什么颜色。当亮度较暗时，画布、卡片和原色都较暗。当亮度为光时，画布和卡片的颜色是明亮的，原色的暗度根据原色亮度变化。当亮度较暗时，原色（primaryColor）与卡片和画布颜色的对比度较差;当亮度较暗时，用白色或亮蓝色来对比。 |
| primaryColor | Color类型，App主要部分的背景色（ToolBar,Tabbar等） |
| primaryColorBrightness | Brightness类型，primaryColor的亮度，用于确定设置在primaryColor上部的文本和图标颜色(如:工具栏文本(toolbar text))。 |
| primaryColorLight | Color类型，primaryColor的较浅版本 |
| primaryColorDark | Color类型，primaryColor的较深版本 |
| accentColor | Color类型，前景色(按钮、文本、覆盖边缘效果等) |
| accentColorBrightness | Brightness类型，accentColor的亮度。用于确定位于accentColor上部的文本和图标颜色(例如，浮动操作按钮(FloatingButton)上的图标) |
| canvasColor | Color类型，MaterialType.canvas Material的默认颜色。 |
| scaffoldBackgroundColor | Color类型，作为Scaffold下的Material默认颜色，用于materia应用程序或app内页面的背景色。 |
| bottomAppBarColor | Color类型，bottomAppBarColor的默认颜色。这可以通过指定BottomAppBar.color来覆盖。 |
| cardColor | Color类型，用在卡片(Card)上的Material的颜色。 |
| dividerColor | Color类型，分隔符(Dividers)和弹窗分隔符(PopupMenuDividers)的颜色，也用于ListTiles和DataTables的行之间。要创建使用这种颜色的合适的边界，请考虑Divider.createBorderSide。 |
| highlightColor | Color类型，用于墨水喷溅动画或指示菜单被选中时的高亮颜色 |
| splashColor | Color类型，墨水溅出的颜色 |
| splashFactory | InteractiveInkFeatureFactory类型，定义InkWall和InkResponse产成的墨水喷溅时的外观。 |
| selectedRowColor | Color类型，用于高亮选定行的颜色。 |
| unselectedWidgetColor | Color类型，小部件处于非活动(但启用)状态时使用的颜色。例如，未选中的复选框。通常与accentColor形成对比。 |
| disabledColor | Color类型，无效的部件(widget)的颜色，不管它们的状态如何。例如，一个禁用的复选框(可以选中或不选中)。 |
| buttonColor | Color类型，Material中RaisedButtons使用的默认填充色。 |
| buttonTheme | ButtonThemeData类型，定义按钮小部件的默认配置，如RaisedButton和FlatButton。 |
| secondaryHeaderColor | Color类型，有选定行时PaginatedDataTable标题的颜色 |
| textSelectionColor | Color类型，文本字段(如TextField)中文本被选中的颜色。 |
| cursorColor | Color类型，在 Material-style 文本字段(如TextField)中光标的颜色。 |
| textSelectionHandleColor | Color类型，用于调整当前选定文本部分的句柄的颜色。 |
| backgroundColor | Color类型，与primaryColor对比的颜色(例如 用作进度条的剩余部分)。 |
| dialogBackgroundColor | Color类型，Color类型，Dialog元素的背景色 |
| indicatorColor | Color类型，TabBar中选项选中的指示器颜色。 |
| hintColor | Color类型，用于提示文本或占位符文本的颜色，例如在TextField中。 |
| errorColor | Color类型，用于输入验证错误的颜色，例如在TextField中。 |
| toggleableActiveColor | Color类型，用于突出显示切换Widget（如Switch，Radio和Checkbox）的活动状态的颜色。 |
| fontFamily | String类型，字体类型 |
| textTheme | TextTheme类型，与卡片和画布对比的文本颜色 |
| primaryTextTheme | TextTheme类型，与primary color形成对比的文本主题。 |
| accentTextTheme | TextTheme类型，与accent color形成对比的文本主题。 |
| inputDecorationTheme | InputDecorationTheme类型，InputDecorator、TextField和TextFormField的默认InputDecoration值基于此主题。 |
| iconTheme | IconThemeData类型，与卡片和画布颜色形成对比的图标主题。 |
| primaryIconTheme | IconThemeData类型，与原色(primary color)形成对比的图标主题。 |
| accentIconTheme | IconThemeData类型,与前景色(accent color)形成对比的图标主题。 |
| sliderTheme | SliderThemeData类型，SliderThemeData类型，用于渲染Slider的颜色和形状。 |
| tabBarTheme | TabBarTheme类型, 一个主题，用于自定义选项卡栏指示器的尺寸、形状和颜色。 |
| chipTheme | ChipThemeData类型,用于Chip的颜色和样式 |
| platform | TargetPlatform类型,widget应该适应目标的平台。 |
| materialTapTargetSize | MaterialTapTargetSize类型,配置特定材料部件的hit测试大小。 |
| pageTransitionsTheme | PageTransitionsTheme类型,每个目标平台的默认MaterialPageRoute转换。 |
| colorScheme | ColorScheme类型,一组13种颜色，可用于配置大多数组件的颜色属性。 |
| typography | Typography类型,用于配置TextTheme、primaryTextTheme和accentTextTheme的颜色和几何文本主题值。 |

PS：上表转载自 [这里](https://www.jianshu.com/p/8d8ded72e673)，对作者翻译表示感谢。官方原版英文：[传送门](https://api.flutter-io.cn/flutter/material/ThemeData-class.html)

#### 设置局部Theme
如果我们想在部分widget里不使用全局样式，我们只需要覆盖它就行。

有两种实现方式：定义一个独立的ThemeData和从父级Theme拓展。

 - 定义一个独立的 ThemeData

创建一个 ThemeData() 实例，然后把它传给 Theme widget：
```dart
Theme(
  // 创建一个ThemeData主题数据
  data: ThemeData(
    accentColor: Colors.yellow,
  ),
  child: FloatingActionButton(
    onPressed: () {},
    child: Icon(Icons.add),
  ),
);
```

 - 从父级Theme拓展

从父级 Theme 扩展可能更常规一些，使用 copyWith 方法即可。
```dart
Theme(
  // 这里保持父级原有的主题配置，并将accentColor修改为 Colors.yellow
  data: Theme.of(context).copyWith(accentColor: Colors.yellow),
  child: FloatingActionButton(
    onPressed: null,
    child: Icon(Icons.add),
  ),
);
```

#### 使用主题
在定义好Theme主题后，我们可以通过widget 的 build 方法中调用 Theme.of(context) 函数，让这些主题样式生效。

Theme.of(context) 会查询 widget 树，并返回其中最近的 Theme。所以他会优先返回我们之前定义过的一个独立的 Theme，如果找不到，它会返回全局 theme。

完整例子：
```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  // 调用build方法
  Widget build(BuildContext context) {
    final appName = 'Custom Themes';

    return MaterialApp(
      title: appName,
      theme: ThemeData(
		//定义全局主题
        brightness: Brightness.dark,
        primaryColor: Colors.lightBlue[800],
        accentColor: Colors.cyan[600],

        fontFamily: 'Montserrat',

        textTheme: TextTheme(
          headline: TextStyle(fontSize: 72.0, fontWeight: FontWeight.bold),
          title: TextStyle(fontSize: 36.0, fontStyle: FontStyle.italic),
          body1: TextStyle(fontSize: 14.0, fontFamily: 'Hind'),
        ),
      ),
      home: MyHomePage(
        title: appName,
      ),
    );
  }
}

class MyHomePage extends StatelessWidget {
  final String title;

  MyHomePage({Key key, @required this.title}) : super(key: key);

  @override
  // 这里一样也需要使用build方法
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Container(
		// 通过Theme.of(context)获取主题的accentColor
          color: Theme.of(context).accentColor,
          child: Text(
            'Text with a background color',
            style: Theme.of(context).textTheme.title,
          ),
        ),
      ),
      floatingActionButton: Theme(
	  //通过Theme.of(context).copyWith从父级拓展
        data: Theme.of(context).copyWith(
          colorScheme:
              Theme.of(context).colorScheme.copyWith(secondary: Colors.yellow),
        ),
        child: FloatingActionButton(
          onPressed: null,
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}
```

### 有状态和无状态的 widgets
widget分为无状态与有状态

 - 无状态（StatelessWidget）：从字面意思也能猜出来，就是widget从定义后，状态就不会发生变化。如果要改变无状态的widget，那就只能build一个新widget进行替换。并且StatelessWidget 的生命周期就只有一个，即 build 函数。
 - 有状态（StatefulWidget）：如果用户与widget交互，widget 会发生“变化”，那么它就是有状态的。如果需要发生变化，可以通过调用setState方法，将自己标记为dirty状态，下一次系统就会对它检查，进行重绘。（这篇文章就不展开讲它的生命周期了，一是篇幅，二是我现在还没讲到生命周期，后面讲到了再合在一起）

**PS**：

 - 这里虽然官中在介绍时也说widget变化了，实际上是不准确的，widget是不会变化的，变化的是state。widget类其实只是一个数据配置映射。
 - 这里还要说一个，初学者可能会有这种担心。那就是有状态与无状态组件的嵌套。有状态组件作为父组件包裹无状态组件，这个比较好理解。但是如果一个无状态组件包裹了一个有状态组件，可以吗？很显然是可以的，当你新建一个Flutter工程，默认根布局就是一个StatelessWidget。**如果父组件不对有状态的子组件做出任何改变和反应，它就可以是无状态的。**

#### StatelessWidget和StatefulWidget的使用
 - StatelessWidget是一个没有状态的widget，没有需要管理的内部状态。基本使用如下：
```dart
class ShotCat extends StatelessWidget {
  // 这里只能用final
  final String name;
  
  const ShotCat({Key key, this.name}) : super(key: key);
  
  // 调用build方法
  @override
  Widget build(BuildContext context) {
    return new Text(name);
  }
}
```
 - StatefulWidget是一个有可变状态的widget。它会比无状态多一个设置state的步骤。下面以官方flutter初始示例为例（按钮点击+1demo）

**PS：**  这个示例和示意图都属于**widget管理自己的状态**
```dart
// 第一部分：继承StatefulWidget
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  // 注意widget里的变量必须用final！！
  final String title;
  
  // 这里必须设置createState方法，这样就能得到一个State类，记录StatefulWidget的状态
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

// 第二部分：继承State
class _MyHomePageState extends State<MyHomePage> {
  // 定义状态变量和默认值
  int _counter = 0;

  // 通过setState方法 设置变量如何变化
  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }
  
  // 最后调用build
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.display1,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter, // 这里设置点击事件，调用上面的_incrementCounter执行setState
        child: Icon(Icons.add),
      ),
    );
  }
}
```

为了方便理解，这里再画一个示意图：

![](https://i.loli.net/2019/11/04/eIU43DVjnWAlctk.png "statelesswidgetANDstatefulwidget")

#### 深度理解StatelessWidget和StatefulWidget

 - StatefulWidget与StatelessWidget中的数据都是不可变的（immutable）
应该说所有widget中定义的数据都是不可变的，都必须用final声明。

在官方初始示例，main.dart里也有这样的注释：
```
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".
  final String title;
```
并且在widget源码里也规定了，Widget中的数据一定是不可变的，所以需要使用final来修饰。

为什么这样设计呢？因为当初widget设计的就是描述UI的静态说明，而state则是保存UI需要显示的数据。当UI需要变化时，那么widget和state至少有一个也要跟着重建。由于重建widget的开销是最低的，所以为了性能考虑，就让widget整个重建，state则不会重建。


 - StatefulWidget与State的关系
上面讲到了widget都是不可变的，StatelessWidget本身就是用于不可变的，但是StatefulWidget是怎么改变的？这就要依靠State了。

StatefulWidget会有一个createState方法，它须继承自State类。它会记录StatefulWidget的状态，当状态变化（例如某个点击事件），则会调用设置好的setState方法改变状态，然后重新调用build方法，**重建一个新的widget进行替换**，最后引起UI更新。（不理解这段话的可以结合我上面的示意图）

可以简单理解为widget就是一张打印纸，state就是记录我们要打印的数据，当我们修改后，就会扔掉上一张打印纸，重新打印一张新的进行替换。

 
#### StatelessWidget和StatefulWidget的使用建议

 - 1，首先考虑这个widget是使用StatefulWidget还是StatelessWidget
如果存在交互或数据改变会导致widget改变，则是有状态（StatefulWidget）。反之如果一个widget是自始至终都是不变的，那么它就是无状态（StatelessWidget）。
 - 2，如果确定了为StatefulWidget，则需要状态state交给谁来管理
	 - widget管理自己的状态：如果改变的状态仅仅是影响外观显示的，和其他组件没有关联的，例如动画，显示隐藏。那么状态最好由 widget 本身来管理。 
	 - 父 widget 管理 widget 的 state：如果状态是用户数据，需要记录提交，或者有很多和它一样的组件，记录数据的，如复选框的选中状态、滑块的位置，则该状态最好由父 widget 管理。
		 - 前面例子是widget自己管理的。父组件管理state其实也很简单。显然此时子组件是StatelessWidget，父组件是StatefulWidget，当然state也在父组件中。但是触发状态改变的事件（例如onPress）还是在子组件中，我们只需把父组件中含有setState的方法传递给子组件，绑定到其事件上就行了。[官方示例传送门](https://flutter.cn/docs/development/ui/interactive#the-parent-widget-manages-the-widgets-state)
	 - 混搭管理：如果状态比较复杂，上面两种情况都有的话，那就混搭吧，按需求将state分别放在自身和父组件管理。

PS：如果不是很清楚时, 那就在父 widget 中管理状态。

**注意：**  最后想强调一句虽然StatefulWidget功能看起来像万金油，似乎所有情况都可以使用它，即使组件的数据时不变的。但不要滥用！！！滥用会造成性能问题，导致widget被重复创建多次！

StatefulWidget里的setState方法在被调用时，会导致它下面的所有子节点全部调用build，全部重新创建！所以建议有大量子组件的父组件最好谨慎使用StatefulWidget。或者将其拆分为更多更小的父组件。

### 声明式UI
与android和ios不一样，flutter并不是采用命令式的写法（类似于前端dom操作），而是一种描述风格的声明式写法。

简单点，我们知道flutter几乎万物皆widget。所谓声明式UI就是：从外到里，组件嵌套组件。每个组件都需要声明对应的属性描述，最终达到你想要的UI。

举个官方栗子：
```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Welcome to Flutter',
      home: Scaffold(
        appBar: AppBar(
          title: Text('Welcome to Flutter'),
        ),
        body: Center(
          child: Text('Hello World'),
        ),
      ),
    );
  }
}
```
从外到里依次经过了 MaterialApp => Scaffold => AppBar 和 Center  => Text 组件的声明。

优点：

 - 书写更简单，不需要像命令式，什么都是自己动手做。而只需要描述你想要什么样的效果。把会变化的状态写在state里就行了。
 - 不管 UI 有多少种状态，UI 代码只有一个

缺点：

 - 前面的章节说过，widget都是唯一的，改变即意味着重新构建。
	 - 虽然看起来会有性能问题，但是flutter的性能依然强大，比RN甚至部分原生还要好。这是因为它底层采用 GPU渲染技术，性能极高，可以达到60fps。
 -  由于flutter的描述是widget嵌套式的，所以当页面复杂一点点，就会发生嵌套地狱。（希望新版本可以出现类jsx的写法）

### 使用包资源（packages）
flutter也有第三方资源包平台，不过不是我们熟悉的npm。而是叫做Dart Packages 网址：https://pub.flutter-io.cn/  其中兼容flutter的网址为： https://pub.flutter-io.cn/flutter

在里面你能搜索到所有已经发布到该平台上的资源。如果你想使用自己写的包资源或者从github下到的资源，也可以查看该系列（二）。里面有说明。

#### 包的使用

 - 1，添加依赖：
	 - 打开 pubspec.yaml 文件 。根据情况自己选择是放在dependencies下，还是dev_dependencies
	```dart
	dependencies:
	  flutter:
		sdk: flutter
	  # 和package.json 里的写法类似
	  url_launcher: ^0.4.1

	dev_dependencies:
	  flutter_test:
		sdk: flutter
	```

 - 2，安装
	 -   在命令行中运行：`flutter pub get` 这样包就已经安装完毕，剩下就是引用包

 - 3，引入
	 - 打开需要引入的dart文件，通过import 进行引入
		 ```dart
		 import 'package:url_launcher/url_launcher.dart';
		 ```

### 数据请求
flutter的请求方式有很大。一般主要使用下面几种种：

 - 1，dart原生的网络请求：HttpClient
 - 2，使用第三方库里的http包 [包地址](https://pub.flutter-io.cn/packages/http#-readme-tab-)
 - 3，另一个第三方库 dio 

目前官方文档里推荐的是第二种 http包。这里我们也只介绍第二种方法：


#### ,添加http包
在上一节刚刚如何使用包。这里就简略点，直接上代码
```dart
#在 pubspec.yaml 的 dependencies 添加:
dependencies:
  http: ^0.12.0+2
```
然后执行`flutter packages get`

最后在需要的dart文件里进行引入`import 'package:http/http.dart' as http;`

#### ,进行网络请求
这里主要讲解常见的两种方法`get请求`和`post请求`

 - get请求
用法：`get(dynamic url, { Map<String, String> headers }) → Future<Response>`
	*   (必须)url:请求地址
	*   (可选)headers:请求头

	```dart
	// 为了不阻塞 UI，http 的请求使用 async/await 异步函数
	fetchPost() async {
	  //  http.get() 方法会返回一个包含 Response 的 Future。
	  final response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
	  if (response.statusCode == 200) {
		// 成功获取到数据的情况 其中response.body 是返回的数据
		return print(response.body);
	  } else {
		// 获取数据失败的情况
		throw Exception('Failed to load post');
	  }
	}
	
	```

- post请求
用法：`post(dynamic url, { Map<String, String> headers, dynamic body, Encoding encoding }) → Future<Response>`
	*（必须)url:请求地址
	*   (可选)headers:请求头
	*   (可选)body:参数
	*   (编码)Encoding:编码

	```dart
	fetchPost() async {
	  final response = await http.post('https://flutter-cn.firebaseio.com/products.json',
	  		headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
            body: json.encode(param),encoding: Utf8Codec())
	  if (response.statusCode == 200) {
		// 成功获取到数据的情况 其中response.body 是返回的数据
		return print(response.body);
	  } else {
		// 获取数据失败的情况
		throw Exception('Failed to load post');
	  }
	}
	
	```

