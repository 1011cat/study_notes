## dart语言详述
**重要：** 

下面如果对我的解释还有疑惑的可以查看官中的解释：[传送门](https://www.dartcn.com/guides/language/language-tour)

下面如果想了解更多的属性和方法可以查看官中的说明·：[传送门](https://www.dartcn.com/guides/libraries/library-tour)
### 重要概念

在学习Dart之前，首先得有这些意识:
 - **所有的东西都是对象，无论是变量、数字、函数等都是对象。 所有的对象都是类的实例。** 所有的对象都继承自内置的 Object类。这点类似于 Java语言“一切皆为对象”。 
 - dart可以指定数据类型（并不是强制性的），方便进行语法检查，使得程序可以合理分配内存空间。
 - 这条可能是在前期最容易出错的，就是**Dart会自动对变量进行类型推断，所以不能像JS里那样自由的改变或添加其他数据类型！**详见：[传送门](https://www.dartcn.com/guides/language/sound-dart#type-inference)
 - Dart代码在运行前解析。 指定数据类型和编译时的常量， 可以提高运行速度。
 - **Dart程序有统一的程序人口: main()。** 这一点与 Java、 C++语言相像。
 - Dart 没有 public、 protected 和 private 的概念 。 **私有特性通过变量或函数加上下划线`_`来表示 。**
 - Dart 的工具可以检查出警告信息( warning)和错误信息( errors)。 **警告信息只是表明代码可能不工作，但是不会妨碍程序运行 。** 错误信息可以是编译时的错误，也可能是运行时的错误 。 编译 时的错误将阻止程序运行，运行时的错误将会以异常 (exception)的方式呈现 。
 - Dart 支持 anync/await 异步处理 。
 - **Dart必须用分号来结束语句, 不加分则会报错。**(对于js基本不写分号的我，真的很容易忘)
 - dart关键字如下: abstract，do, import, super, as, dynamic, in , switch, assert, else, interface, sync*, enum, implements, is, this, async*, export, library, throw, await, external, mixin, true, break ，extends, new, try, case，factory, null, typedef, catch, false, operator, var, class, final, part, void, const, finally, rethrow , while , continue , for , return , with , covariant , get , set , yield*,  default, if , static, deferred。

**dart使用评率最高的三个库：**

 - `dart:core`: 核心库，包括 strings、 numbers、 collections、 errors、 dates、 URis 等 。
 - `dart:html`: 网页开发里 DOM 相关的一些库 。
 - `dart:io`:  I/O命令行使用的I/O库。

更详细的可以查看这里：[传送门](http://dart.goodev.org/guides/libraries/useful-libraries)

**PS：**

 - dart:core库是 Dart语言初始已经包含的库，其他的任何库在使用前都需要加上 import 语句。例如，使用dart:html可以使用如下的命令:  `import 'dart:html' `;
 - 使用官方提供的 pub工具可以安装丰富的第三方库。 第三方库的地址为 :pub.dartlang.org(很慢，建议搭梯子)

### 变量与基本数据类型

#### 变量
**在 Dart语言里一切皆为对象**，**如果没有将变量赋值，那么它的默认值为 null。**

以下代码是Dart中定义变量的方法：

```dart
void main() {
  var a = 110;
  dynamic b = 1.8;
  object c = 666;
  final d = '只能被赋值一次';
  const e = '只能是常量';
  int f = 120;
  String g = "shotCat";
}
```

 - 1, var

**var：**

dart中的var和JavaScript中的var看起来一样，但是它们的差别还是很大的。首先dart中的**var声明的变量一旦赋值，则其数据类型也会一并确定**（dart比较智能，可以通过第一次的赋值来确定变量的数据类型）
```dart
var name = 'shotCat';
name = 8848; // 此时会报错，因为name已经被赋值为字符串类型
```
- 2, dynamic,和Object(注意O大写) 
**dynamic：**

dynamic从它的字面意思就可以知道它是动态的，所以dynamic赋值的变量，后面可以赋值为其他数据类型。并且dynamic声明的对象编译器会提供所有可能的组合。什么意思？解释一下，前面说过var声明的变量，dart可以智能地推断出它的类型。dynamic声明的变量，dart也会去推断其数据类型，只不过是dart不会限定变量的数据类型。而是**动态地进行推断，并提供对应数据类型的属性和方法。**
```dart
dynamic name;
name = "shotCat";
name = 8848;//可以进行修改申明类型,不会报错
print(name);//输出为:8848
```

**Object:**

`Object` 是Dart所有对象的根基类，也就是说**所有类型都是`Object`的子类**(包括Function和Null)，所以任何类型的数据都可以赋值给`Object`声明的对象.

Object和dynamic一样，它们声明的变量后面可以赋值为其他数据类型。但与dynamic不同的是：Object声明的变量默认只能使用Object类型的属性和方法。为什么？因为使用Object声明的变量，**编译器是不会推断其具体数据类型（Object的某个子类），因此默认该变量只能调用Object的属性和方法，**需要后面手动转换为具体类型来进行操作。

```dart
Object name = "shotCat";
print(name.length);//这里是object类型就不能调用length方法，编译就报错
```

- 3, final和const

**final：**

如果你想声明一个变量后，不再被改变。那么就可以使用final。**final声明的变量只能被赋值一次！不能再去修改，否则就会报错！**
```dart
final name = "shotCat";
name = "吴彦祖比我帅";//这里很显然是会报错的
```
**const：**

和JS中的const类似，**在dart中const声明的变量为一个编译时常量，并且在声明时，就必须进行赋值为一个编译时常量！同样的const声明变量以后，如果再去修改，编译器直接就报错**

使用关键字 const 修饰变量表示该变量为 编译时常量。如果使用 const 修饰类中的变量，则必须加上 static 关键字，即 static const（注意：顺序不能颠倒（译者注））。在声明 const 变量时可以直接为其赋值，也可以使用其它的 const 变量为其赋值

注意：**const不仅可以声明变量，而且还能修饰变量，修饰之后的变量也会变为固定值。**
```dart
const name = "shotCat";
name = "彭于晏比我帅";//同样地编译器也会报错
var list =  const [1, 2, 3]；//const还可以修饰变量对应的值，强制让这个值也变成固定的
```

你可以明确指定某个变量的类型，如int bool String，也可以用var或 dynamic来声明一个变量，Dart会自动推断其数据类型。

**final 与 const的不同点：**

 - const是**编译时常量**，const修饰的值在编译(非运行)的时候就需要进行确定，即如果你在编写的时候，const后面接的是一个变量，则会报错。
 - final是**运行时常量**，它是惰性初始化，即在第一次运行时才会进行初始化。即如果final 后面接的是一个变量，运行时也不会报错。

举个栗子;
```dart
void main() {
var a = 123456;
// const b =  a; 使用const时则会报错
final b = a; // final则不会
print(b);
```
 - 4，明确需要变量的类型
如果事先已经明确某个变量的类型，则可以直接用int，bool，String等进行声明，当然声明的变量在后面也是不能改变其数据类型的。

#### 基本数据类型
Dart有如下几种内建的数据类型：numbers，strings，boolean，lists(或者是arrays)，maps，runes（UTF-32字符集的字符），symbols

这里只介绍常用的Number、 String、 Boolean、 List、 Map。

 - Number类型：
	 - int整形。取值范围： -2^53到2^53
	 - double浮点型。即双精度浮点型 ，64 位长度的浮点型数据

int和 double类型都是 Number 类型的子类。 **int类型不能包含小数点**。 num类型包括的操作有:`+，-，*，/以及位移操作>> `。 num 类型包括的常用方法有: abs、 ceil 和 floor。
```dart
void main() {
  // numbers
  var a = 0;
  int b = 1;
  double c = 0.1;
}
```

 - String类型：
字符串类型和JS里的差不多。也可以通过+进行拼接。**不同的是dart里可以使用三个单引号或三个双引号来表示多行文本。**

dart中还支持一种类似于模板字符串的写法。${expression},如果表达式是一个标识符，可以省略 {}。 如果表达式的结果为一个对象，则 Dart 会调用对象的 toString() 函数来获取一个字符串。

```dart
void main() {
  // strings
  var name = 'shotCat';
  String name = "shotCat";
  
  var foo ='''
	一个用三个单引号包裹起来的字符串 ， 
	可以用来表示多行数据。
	''';
	var bar = """同样一个用三个双引号包裹起来的字符串 ， 
	也可以用来表示多行数据。
	""";
	
	// 也可以用${expression}的写法
	String nickName = "武汉彭于晏";
	print("没错，我就是 $nickName");
	
	// 也可以调用对应string的方法
	String nickName1 = "wuhan pengyuyan";
	print("没错，我就是 ${nickName1.toUpperCase()}");
}
```
- Boolean类型：
dart是强bool类型检查，**只有bool类型的值才会被判断为true或false。**这点是和JS有很大不同的，不会把undefined，0等这样的值判断为false。 

```dart
void main() {
  // booleans
  var real = true;
  bool unReal = false;
  
  var name = '吴彦祖';
  // 下面这段是不能正常编译的，因为name是字符串，而不是boolean，不能这样进行判断
  if (name) {
  	print('我的名字是' + name);
  }
}
```

- List类型：
dart中将具有一系列相同类型的数据称为 List 对象。 非常类似JS语言的数组 Array对象。

```dart
void main() {
  // list
  var list1 = [1, 2, 3, 4, 5]; //这种写法会被dart判断为int型，后面add添加非int类型数据时，就会报错
  list1.add('shotCat');//这时编译就会报错
  
  // 你也可以通过下面这种形式，直接指明你想要的类型
  List<String> list2 = ['shotCat', '吴彦祖', "彭于晏"];
  List<dynamic> list3 = [10086, true, '傻逼'];//这种也是可以添加其他类型
  
  //如果你想list可以添加不同类型的值，可以使用下面的形式
  List list4 = new List();
  list4.add("shotCat");
  list4.add(1);
  list4.add(true);
  print(list4); //打印出 [aa, 1, true] ，这时因为new List()dart会默认list可以添加的类型为Object这个基类，所以后面的不同类型都可以添加进去
  
  var list5 = ['shotCat', 10086];
  list5.add(true);
  print(list5);// [shotCat, 10086, true] 这样也是可以的
}
```

- Map类型：
Map其实和JS里的挺像的，用来关联 keys 和 values 的对象。 **keys 和 values 可以是任何类型的对象。并且在一个 Map 对象中一个 key 只能出现一次。 但是 value 可以出现多次。**

```dart
void main() {
  // 可以直接使用字面量的形式，就像写JS对象一样
  // 需要注意的是当map的key或value为同一种类型时，dart就会类型推断为Map<String, String>
  var shotCat = {
  'name': 'shotCat',
  'age': '18',
  'sec': 'man',
  'like': 'girl',
 };
 shotCat['luckyNumber'] = 666;
 // 这种情况就会报错，因为此时dart的类型推断为Map<String, String>，666很显然不是string类型
 
 // 也可以用Map生成，然后自己添加
 var girlFriends = new Map();// 这里的new关键字在dart2中可以省略
girlFriends['first'] = 'Taylor Swift';
girlFriends['second'] = '石原里美';
girlFriends['fifth'] = '新垣结衣';
girlFriends[4] = '迪丽热巴';
girlFriends['我列举的这些都是'] = true;
// 这种写法就不会对类型进行限制

// 当然这样写之后，dart也不会再进行类型限制
var foo = {
  'name': 'shotCat',
   18: true,
 };
}
```

### 函数
dart中函数也是对象，它的类型是Function。它可以被赋值给变量或者作为其他函数的参数。

dart函数的写法与es6中的写法很像

#### 函数写法

```dart
// 常规写法就是这样，不需要加function，String为声明函数返回值类型，其实也可以省略，函数照样正常运行
String getName() {
  return "shotCat";
}

// 如果函数体只有一个表达式可以进行简写
String getName1() => "shotCat"; // 切记！！不要与箭头函数混淆，给函数体加上{} dart不支持这种写法！

// 匿名函数写法
var getName2 = (name) {return 'Hello $name!';};

// 闭包写法其实也是类似的
  Function getPlus() {
    int num = 0;
    return () {
      num++;
      print(num);
    };
  }

  Function foo = getPlus();
  foo(); // 1
  foo(); // 2
```

#### 可选参数与默认参数值
dart支持两种可选参数的写法：一种叫命名可选参数，另一种叫位置可选参数。在一个函数中这两种可选方式不能同时使用。当然不属于这两种写法的就是必选参数。并且**没有赋值的参数，dart都会默认设为null。**

 - 命名可选参数使用大括号`{}`。默认值使用等号`=`（老版使用的是冒号`:`,现在不建议继续使用）。由名字和`{}`可知，命名可选参数的调用与顺序无关，需要指明参数名才可以调用。
 - 位置可选参数使用中括号`[]`。默认值使用等号`=`。由名字和`[]`可知，位置可选参数与顺序有关，调用的时候也是按照顺序调用。

**注意：** 虽然命名可选参数是可选参数，即我们可以选择不传。但dart还是提供了`@required`标记。`foo({int age, @required String name}){...}`此时参数name就是必选参数了。这种写法在flutter中很常见，其实其他语言里也很常见。

```dart 
// 这里使用命名可选参数写法，其中a很显然就是必选参数
foo (a, {b, int c=1, bool d=true}){
  print('$a $b $c $d');
}

// 这里使用位置可选参数写法，其中a很显然也是必选参数
bar (a, [b, int c=2, bool d=false]){
  print('$a $b $c $d');
}

void main()
{
  // 命名可选参数的调用需要`:`来进行声明
  foo('shot', c:666, d:false); //结果为 shot null 666 false
  bar('cat', 8848, 6666, true); //结果为 cat 8848 6666 true
}
```

#### 函数返回值
**所有函数都会返回一个值。 如果没有明确指定返回值， 函数体会被隐式的添加 return null; 语句。**
```dart 
foo() {}
assert(foo() == null);

//这里顺带说一句关于void，如果只接触JS没接触其他语言的同学，可能会奇怪void的意思，其实void就是声明没有返回值，如果一个函数前面加上void则表明该函数没有返回值。如果你在一个有指定return的函数前加void则会报错

// 这样写就会报错
void getName (name) {return'Hello $name!';};
```

#### main()函数
任何应用都必须有一个顶级 main() 函数，作为应用服务的入口。 main() 函数返回值为空，参数为一个可选的 List<String> 。

```dart 
void main() {
  runApp(MyApp());
}
```

### 运算符

Dart中使用到的运算符如下表格

| Description | Operator |
| --- | --- |
| 一元后缀 | `expr++` `expr--` `()` `[]` `.` `?.` |
| 一元前缀 | `-expr` `!expr` `~expr` `++expr` `--expr` |
| 乘除操作 | `*` `/` `%` `~/` |
| 加减操作 | `+` `-` |
| 移位 | `<<` `>>` |
| 按位与 | `&` |
| 按位异或 | `^` |
| 按位或 | `|` |
| 比较关系和类型判断 | `>=` `>` `<=` `<` `as` `is` `is!` |
| 等判断 | `==` `!=` |
| 逻辑与 | `&&` |
| 逻辑或 | `||` |
| 是否null | `??` |
| 条件语句操作 | `expr1 ? expr2 : expr3` |
| 级联操作 | `..` |
| 分配赋值操作 | `=` `*=` `/=` `~/=` `%=` `+=` `-=` `<<=` `>>=` `&=` `^=` `|=` `??=` |

**操作符的优先级由上到下逐个减小！**

这里列举一些与JS不一样，需要注意的地方：

 - 1，首先是最重要的，dart判断两个对象是否相等，**使用的是`==`** ，**没有`===`** 。同理，**不等于也只有`!=`，没有`!==`**
 - 2, 类型判定运算符：`as`， `is`， 和 `is!` 运算符用于在运行时处理类型检查。
	 - as 运算符会将对象强制转换为特定类型。当然如果不能转换就会报错。
	 - is 运算符：当对象是相应类型时返回 true。
	 - is! 运算符：当对象不是相应类型时返回 true。（注意这里!在is后面）。
	 - 
	```dart
	if (user is User) {
		// 类型检测
		user.name =’Flutter’;
	}
	//如果能确定user是User的实例， 则你可以通过as直接简化代码: 
	(user as User) .name =’Flutter’;
	 ```	 
 - 3，`??=`运算符：正常来说，我们的运算符就是`=`，但是如果我们想在变量不存在为null时才进行赋值的话则可以使用`??=` 例子：`a ??= 666;`表示当a变量为null时，它才会被赋值为666
 - 4， **重要：** `??与?.运算符:` 为什么会有这两个运算符？在JS中我们经常会这样写`a || b 和 c && d`但是在dart中，这样写是有前提的，虽然dart也有`||` `&&`运算符，但是要求的是**两边必须为明确的boolean值(true和false)。** 即为undefined，null，0这些都不算。我在前面基本数据类型里也讲过这点，这里再强调下。
	 - `??运算符` 表示前面的值如果为null或空的话就取??后面的值。正好对应的就是`||` 例子：`myName = name ?? 'shotCat';`如果name变量不存在，则取值'shotCat'
	 - `?.运算符`表示前面的值如果不为null或空的话就取?.后面的值。正好对应的就是`&&` 例子：`myName = name ?. '彭于晏';`如果name变量存在，则取值'彭于晏'
 - 5，`.. 级联运算符：` 可以实现对同一个对像进行一系列的操作。 除了调用函数， 还可以访问同一对象上的字段属性。 **这通常可以节省创建临时变量的步骤，** 同时编写出更流畅的代码。
	 - 这里直接引用官网的例子，就不再举自己是彭于晏的例子了（狗头）
	```dart
	final addressBook = (AddressBookBuilder()
      ..name = '彭于晏'
      ..email = 'pengyuyan@shotCat.com'
      ..phone = (PhoneNumberBuilder()
            ..number = '415-555-0100'
            ..label = 'home')
          .build())
    .build();
	// AddressBookBuilder() 获取了一个对象，之后设置该对象name属性、email属性并且在设置phone属性时又**嵌套使用了级联运算符**，获取了PhoneNumberBuilder()对象。
	
	// 需要注意一点的是：在使用级联运算符时，要确保该对象存在，例如：如果后端返回的数据不存在，使用了就会报错
	```

### 控制流程语句
dart中的流程语句有以下几个：
 - if and else
 - for loops
 - while and do-while loops
 - break and continue
 - switch and case
 - assert

#### if和else
基本和JS里的if else一样。不过有一点需要注意：也是前面提到过的，**dart里条件判断必须是布尔值来判断！！！** 例如，`let a = 0;if(!a) console.log('a')`这种条件语句在dart里是错误的！~

#### for 循环
for循环也和JS里的很像，不过有一点不同。既然dart是比JS更好，那当然是会纠正JS里的陷阱。

举个栗子：
```dart
// 在JS中输入以下代码 得到的是两个2
var callbacks = [];
for (var i = 0; i < 2; i++) {
  callbacks.push(() => console.log(i));
}
callbacks.forEach((c) => c());

// 在dart中输入以下等价的代码，却可以得到我们所期望的0和1
var callbacks = [];
for (var i = 0; i < 2; i++) {
  callbacks.add(() => print(i));
}
callbacks.forEach((c) => c());
```
从上面的例子可以看出，它修复了JS的作用域的陷阱。即**for循环中的变量i的作用域就只在for循环体内部可以访问。** 当然你也可以把它当成是let

**注意：** dart还提供了forEach方法和for-in，**可以用于遍历具有迭代属性的对象，比如List和Set**
```dart
var lists = [1, 2, 3];//lists是一个可迭代的对象
  for(var item in lists){//可以用for in循环进行遍历
    print(item);//打印'1 2 3'
  }
```

#### while 和 do-while
while是先判断条件再决定是否执行循环体，而**do-while则是先执行一次循环体**，然后结合条件判断决定是否继续执行下一次循环体
```dart
//定义了一个整型变量i，其值为2
  int i = 2;
//while循环遍历，这里显然i小于3，所以while循环体会执行
  while (i < 3) {
    print(i++);
  }
//do-while循环，因为先执行一次while循环体，
//然后再判断i是否小于2，所以只会打印 2 之后就不会执行执行体了，因为不小于2了
  do {
    print(i++);
  } while (i < 2);
  ```

#### break 和 continue
和JS里的类似，break用于跳出当前循环体，而continue则是跳过循环体的当前执行，继续执行下一次循环。
```dart
var arr= [0, 1, 2, 3, 4, 5, 6]; 
for (var v in arr) {
	if(v == 2 ){
		//break; //切换为break后就只能打印0，1
		continue;
	}
	print(v);
}
```

#### switch和case
在 Dart 中 switch 语句使用 == 比较整数，字符串，或者编译时常量。 **比较的对象必须都是同一个类的实例（并且不可以是子类**）， 类必须没有对 == 重写。 枚举类型 可以用于 switch 语句。**每一个 非空的 case 子句最后都必须跟上 break 语句 。**
```dart
void main() {
  String name = "吴彦祖";
  switch (name) {
    case "吴彦祖":
      print("吴彦祖");
	  break;	//注意这里！！！，若没有使用break，dart编译器会报错!!!
    case "彭于晏":
      print("彭于晏");
      break;
    default:
      print("shotCat");
  }
}
```

#### assert
assert即断言，是很多语言都提供的一种检测机制，它是用来判断是否符合执行逻辑的语句，当 assert 判断的 条件为 false 时发生中断。

**assert 判断的条件是任何可以转化为 boolean类型的对象**，即使是函数也可以。 如果 assert的判断为 true，则继续执行下面的语句;反之则会抛出一个断言错误异常 AssertionError。
```dart
// 确认变量值不为空。
assert(text != null);
```

**注意：** 断言默认只在开发环境中生效，发布到生产环境中的断言是会被忽略的。因此，断言实际上起到了在开发环境调试程序、测试程序的目的。并且 Flutter 中的 assert 只在 debug 模式 中有效。

### 面向对象之类

dart是一个面向对象的语言，当然是支持继承的。但是它的机制和`Java，c++`相似，却不一样。它既不是Java那这种单继承，也不是c++那样的多继承。

Dart 里的继承是一种基于类和 mixin 继承机制。 每个对象都是一个类的实例，所有的类都继承于 Object. 。 并且支持基于 Mixin 继承方式（mixin的继承方式可以简单理解为 : 一个类可以继承自多个父类）。

先上栗子：
```dart
class Person {
  String name; //实例变量
  Person(String name) {    //构造方法
    this.name = name;//注意this关键字
  }
  // 上面的构造方法可以省略为
  // Person(this.name)
}

// 在定义类的时候，如果没有提供构造方法，同样会由系统提供一个默认的无参构造方法。
class Girl {
  String name; //实例变量
}

void main() {
  Person shotCat = new Person("彭于晏");//生成一个Person类实例
  print(shotCat.name);
  shotCat = Person("吴彦祖");//dart2 支持省略new关键字，这里新产生了一个Person类实例
  print(shotCat.name);
  shotCat.name = "胡歌";//我们也可以通过实例变量完成赋值
  print(shotCat.name);
  
  var myWife = new Girl();
  myWife.name = "新垣结衣";
  print(myWife.name);
}

```
dart定义类的关键字是class，而且**在定义类的时候，如果没有提供构造方法，同样会由系统提供一个默认的无参构造方法。** **当我们提供了有参构造方法的时候，无参构造方法将会自动失效，除非我们又显示定义了其无参构造方法。**

#### 类的组成
如果对前面的例子，不太熟悉。这里我们就先概括的来介绍dart中类的组成以及相关作用。这对后面类的理解会起到很好的帮助作用。

**类的组成：**

 - 构造函数：首先就是它的构造函数。类的作用是什么？最直观的就是实例对象，那类的构造函数就是起到这个作用。
	 - 主构造函数：就是声明一个与类名一样的函数。例如：一个类class Shotcat。在它里面主构造函数就是`Shotcat () {...}`。用它实例一个对象：`var cat1 = Shotcat("吴彦祖")`。从dart2开始，实例对象可以省略关键字 new 。并且主构造函数只能有一个！
	 - 命名构造函数： 就是声明一个“类名.标识符 形式”的函数。例如：一个类class Shotcat。在它的命名构造函数可以是`Shotcat.wife () {...}`。用它实例一个对象：`var cat2 = Shotcat.wife("新垣结衣")`。命名构造函数可以有多个。
 - 实例变量和实例方法：顾名思义就是给实例用的变量和方法，**包括其子类的实例也可以访问！**
	 - 实例变量：给实例使用的变量。一般仅在类中进行声明，然后在构造函数或者实例方法中进行赋值初始化。
	 - 实例方法：给实例使用的方法。对象的实例方法可以访问实例变量和 this。
 - 类变量和类方法：同理，既然有了实例的变量方法，当然也有类的变量方法。不过我们一般是称呼为静态变量和静态方法。形式就是使用关键字 static 声明类的变量和方法。记住它们是**不能被实例访问到的！** 
	 - 类变量(静态变量)：常用于声明类范围内所属的状态变量和常量。并且在其首次被使用的时候才被初始化。
	 - 类方法(静态方法)：不能被一个类的实例访问，同样地，静态方法内也不可以使用 this。

#### 构造函数
前面刚刚讲到了构造函数分为两种：主构造函数和命名构造函数。这里就详细展开：

 - 主构造函数：

```dart
// 养成好习惯，类的命名 首字母记得大写
class Shotcat {
  // 声明实例变量 并且对于多个相同类型的变量，可以像这样写在一行
  String name, wife;

  Shotcat(String name, String wife) {
  	// 此时的this指向的是当前实例对象  并不是类
    this.name = name;
    this.wife = wife;
  }
   // 对于上面这样的构造函数，Dart 提供了一种特殊的语法糖来简化该步骤
  Shotcat(this.name, this.wife);
  
}
```
 - 命名构造函数：可以为一个类声明多个命名式构造函数来表达更明确的意图

```dart
class Shotcat {
  String name; //实例变量
  Shotcat(String name) {//主构造方法
    this.name = name;
  }
//这个就是命名构造方法
  Shotcat.name(String name){
    this.name = name;
  }
}
```

 - 默认构造函数：如果你没有声明构造函数，那么 Dart 会自动生成一个无参数的构造函数(即构造函数名后面没有加`.参数`,例如：Shotcat后面没有加`.name`)并且该构造函数会调用其父类的无参数构造方法。

注意：主构造函数和默认构造函数虽然都是无参数构造方法，但两者不一样。只有当你没有声明构造函数时，默认构造函数才会起效。

 - 子类调用父类的非命名构造函数：注意：这里是调用不是继承！！！子类必须声明一个自己的构造函数。

```dart
class Father {
  Father() {
    print("I am your father");
  }
}
//子类Son，的实例 会先调用Father的构造函数，然后再调用Son的构造函数
class Son extends Father {
  Son(){
    print("hello Father");
  }
}

void main() {
  Student you = new Son(); // 狡黠一笑
  // 打印结果是
  // I am your father
  // hello Father
}
```
**注意：** 如果父类没有匿名无参数构造函数，那么子类必须**调用**父类的其中一个构造函数，为子类的构造函数指定一个父类的构造函数只需在构造函数体前使用（:）指定，并使用super关键字。
```dart
class Father {
  Father.name() {
    print("I am shotcat");
  }
}

class Son extends Father {
  Son():super.name(){ //通过super完成了对父类命名构造方法的调用
  // 这里先执行父类的命名构造函数，再执行这里子类的构造函数
    print("hello Father");
  }
}

void main() {
  Student you = new Son(); // 狡黠一笑
  // 打印结果是
  // I am your father
  // hello Father
}
```

 - 初始化列表：上面讲到子类会先调用父类的非命名构造函数，再调用自己的。但是，如果子类构造函数还有一个初始化列表。则顺序变为：
1.  初始化列表

2.  父类的无参数构造函数

3.  当前类的构造函数

PS: 如果实例变量在声明的时候就将其初始化，那么它的顺序将比上面三个都早！

初始化列表可以在调用父类构造函数之前初始化实例变量。
```dart
class Shotcat {
  String name; 
  int age;
  Shotcat()
      :name = "彭于晏",//这就是初始化列表
        age = 18 {
    print("I am your father");
  }
}
```

 - 常量构造函数：如果类生成的对象都是不会变的，那么可以在生成这些对象时就将其变为编译时常量。你可以在类的构造函数前加上 const 关键字并确保**所有实例变量均为 final 来实现该功能。**
 
 **两个使用相同构造函数相同参数值构造的实例是同一个对象！**

```dart
class Shotcat {
  final String name; //name必须声明为final的
  const Shotcat(this.name); //定义了一个常量构造方法，**注意不允许有body**
}

void main() {
  Shotcat s1 = const Shotcat("彭于晏"); 
  Shotcat s2 = const Shotcat("彭于晏");
  print(identical(s1, s2));//打印true
}
```
**如果 Const 变量是类级别的，需要标记为 static const。** 

#### 实例变量和实例方法

 - 实例变量：就是类的实例对象使用的变量

```dart
class Point {
  num x; // 声明实例变量 x 并初始化为 null。
  num y; // 声明实例变量 y 并初始化为 null。
  num z = 0; // 声明实例变量 z 并初始化为 0。
}
```
所有未初始化的实例变量其值均为 null。

如果你在声明一个实例变量的时候就将其初始化（而不是在构造函数或其它方法中），那么该实例变量的值就会在对象实例创建的时候被设置，该过程会在构造函数以及它的初始化器列表执行前。

 - 实例方法 ：类的实例对象使用的方法

对象的实例方法可以访问实例变量和 this。
```dart
import 'dart:math';

class Point {
  num x, y;

  Point(this.x, this.y);

  num distanceTo(Point other) {
    var dx = x - other.x;
    var dy = y - other.y;
    return sqrt(dx * dx + dy * dy);
  }
}
```

#### 静态变量和静态方法

 - 静态变量：类使用的变量，用static关键字进行声明

```dart
class Shotcat {
  static const age = 18;
  static const girlfriend = "新垣结衣";
}
```
静态变量在其首次被使用的时候才被初始化。

 - 静态方法：类使用的方法，并且方法内不可以使用this。同样用static关键字进行声明。

这里以官方的例子进行说明：
```dart
import 'dart:math';

class Point {
  num x, y;
  Point(this.x, this.y);

  static num distanceBetween(Point a, Point b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
  }
}

void main() {
  var a = Point(2, 2);
  var b = Point(4, 4);
  var distance = Point.distanceBetween(a, b);
  assert(2.8 < distance && distance < 2.9);
  print(distance);
}
```

#### 类的在拓展
其实上面的例子都用到过，就是我们可以使用extends关键字来创建一个继承父类的子类。并可以在子类里面使用super关键字来引用其父类。

这里我继续以前面的例子为例：
```dart
class Father {
  Father.name() {
    print("I am shotcat");
  }
}

// 子类Son 通过extends创建一个继承父类Father的子类
class Son extends Father {
  Son():super.name(){ //通过super完成了对父类命名构造方法的调用
  // 这里先执行父类的命名构造函数，再执行这里子类的构造函数
    print("hello Father");
  }
}

void main() {
  Student you = new Son(); // 狡黠一笑
  // 打印结果是
  // I am your father
  // hello Father
}
```

 - 在dart中你可以使用@override 表示重写某个方法或某个类
```dart
class Son extends Father {
	@override
	String getName() {...}
  //...
}
```

#### 枚举类型
枚举类型是一种特殊的类，也称为 enumerations 或 enums。通常用来表示相同类型的一组常量值。 每个枚举类型都用于一个 index 的 getter，用来标记元素的元素位置 。 第一个枚举元素的索引是 0。

使用enum关键字来定义枚举类型：
```dart
enum website { github, google, juejin }

//使用values 方法获取一个包含所有枚举值的列表：
List<website> websites = website.values;

void main() {
  print(websites); // [website.github, website.google, website.juejin]
}
```
注意：
*   枚举不能成为子类，也不可以 mix in，你也不可以实现一个枚举。

*   不能显式地实例化一个枚举类。

#### Mixins混入
Mixins (混入功能)相当于多继承，也就是说可以继承多个类 。 使用 with关键字并在其后跟上 Mixin 类的名字来使用 Mixin 模式：
```dart
class C {
	c() {print("c语言");}
}

class Java {
	java() {print("java语言");}
}

class JavaScript {
	javascript() {print("javascript语言");}
}

// 当你需要mixin多个类时，后面只需加上逗号连接
class Dart extends Java with C, JavaScript {
	Dart() {
		print("Dart借鉴了：");
	}
}
void main() {
  Dart dart = new Dart();
  // dart 通过mixin继承了C，JavaScript类 可以使用其中的方法
  dart.c(); 
  dart.java();  
  dart.javascript();
  // 打印结果为：
  //Dart借鉴了：
  //c语言
  //java语言
  //javascript语言
}
```

### 泛型
在dart中，泛型可以简单理解为 将数据进行限定。例如：限定数组中的每一项只能为string；限定参数只能为int等等。就是将数据进行广泛的限定。譬如：男厕所只要你是带把的就都可以进，不管你是真男人还是蔡徐坤。

dart中的泛型 使用`< ... >`表示，尖括号就是你要限定为的数据类型。它可以是String字符串类型 (`List<String>`)，或者是你已声明的Shotcat类  (`<Shotcat>`)，这种明确的。也可以是不明确的，有时候你只知道需要对数据进行限定，但限定为具体那种类型则需要根据具体情况在后面进行设置。这种情况你就可以在`<>`里设置一个大写字母，进行占位，表示你要限定为的数据类型，只是你现在不知道是什么类型。例如：`<E>` 

为了更好的可读性，一般会默认为：
 - E代表Element,元素.
 - T代表Type,类型.
 - K代表Key,键.
 - V代表Value,值.

```dart
// 我们以官网的例子为例，我们做一个存取数据作为缓存的抽象类
// 我们不确定限定存取那种数据类型 就暂时使用<T> 进行占位
abstract class Cache<T> {
  T getByKey(String key);
  void setByKey(String key, T value);
  // ...
}

// 由于<T> 进行占位，所以我们可以根据需求进行限定
Cache<Object> objectCache; // 限定为对象
Cache<String> stringCache; // 限定为字符串
```

#### 泛型的好处
在上面解释泛型时，其实已经明确了。

 - 1，因为它的限定性，所以它可以更规范地代码生成。
 - 2，前面讲到了泛型的不确定型，可以方便我们后面对不同的类型进行数据限定。从而减少了代码重复。

#### 用于集合关键字声明
一般用得最多的就是在List，Set 以及 Map关键字 后加上`<...>` 对声明的数据进行限定。
```dart
var myGirlfriends = List<String>();
myGirlfriends.addAll(['新垣结衣', '石原里美', '暂时没想到']);
myGirlfriends.add(66); // 报错
```

#### 用于集合字面量
当我们以字面量形式声明 (即不用关键字进行声明) List，Set 以及 Map时，可以直接在字面量表达式前面加上`<...>`进行限定。

```dart
var myGirlfriends = <String>['新垣结衣', '石原里美', '暂时没想到'];
var myNames = <String>{'吴彦祖', '彭于晏', '不会打篮球的CXK'};
var pages = <String, String>{
  'github': '1011cat',
  'juejin': 'shotCat',
  'blog': 'shotcat.com'
};
```

#### 函数中使用泛型
泛型也可以在函数中进行使用：
```dart
T first<T>(List<T> ts) {
  // 处理一些初始化工作或错误检测……
  T tmp = ts[0];
  // 处理一些额外的检查……
  return tmp;
}
```
方法 `first<T>` 的泛型 `T` 可以在如下地方使用：
*   函数的返回值类型 (`T`)。
*   参数的类型 (`List<T>`)。
*   局部变量的类型 (`T tmp`)。

### 库的使用
每个 Dart 程序都是一个库，代码库不仅只是提供 API 而且还起到了封装的作用：**以下划线（_）开头的成员仅在代码库中可见。**

#### 引用库
和es6一样，使用import关键字进行引用。

不过不同的是，dart的import具有参数，对不同的库进行区分：

 - 对于dart内置的库：使用dart:xxxx的形式。
 - 对于第三方的库：使用package: xxxx的形式。

```dart
import 'dart:io';
import 'package:mylib/mylib.dart'; 
import 'package:utils/utils.dart';
```

#### 指定库的前缀
如果你导入的两个代码库有冲突的标识符，你可以为其中一个指定前缀，有点像命名空间。

```dart
import 'package:lib1/lib1.dart';
import 'package:lib2/lib2.dart' as lib2;

// 使用 lib1 的 Element 类。
Element element1 = Element();

// 使用 lib2 的 Element 类。
lib2.Element element2 = lib2.Element();
```

#### 引用库的一部分

如果你只想使用代码库中的一部分，你可以有选择地导入代码库。

 - show关键字：只引入这一个，其余的都不引入
 - hide关键字：除了这一个，其余的都引入

```dart
// 只导入 lib1 中的 foo。
import 'package:lib1/lib1.dart' show foo;

// 导入 lib2 中除了 foo 外的所有。
import 'package:lib2/lib2.dart' hide foo;
```

**PS：**目前flutter 1.9版本是不支持延迟引入库，目前仅dart2支持。这里就不展开了。

### 异步支持
dart是一个支持异步操作的语言，其中的future和stream对象都是异步的。dart中使用async和await关键字用于异步编程。

PS：future和stream都是异步的，两者主要区别是：future只能返回一次异步获得的数据。而stream则可以返回多次异步获得的数据。

#### 处理 Future

可以通过下面两种方式，获得 Future 执行完成的结果：
*   使用 `async` 和 `await`。
*   使用 Future API，具体描述，参考[库概览](https://dart.cn/guides/libraries/library-tour#future)。

其中`async` 和 `await`和es6类似。其中**await必须是带有async关键字的函数中使用！**

那`async` 和 `await`和future有什么具体关系吗？答：因为await表达式返回的就是一个future对象。然后等待 await 表达式执行完毕后才继续执行。

```dart
getDate () async {
	var data = await askData()
	//..
}
```
#### 处理 stream
如果想从 Stream 中获取值，可以有两种选择：
*   使用 `async` 关键字和一个 _异步循环_（使用 `await for` 关键字标识），正如我前面说的stream是返回多次异步数据，因此需要异步循环。
*   使用 Stream API。详情参考[库概览](https://dart.cn/guides/libraries/library-tour#stream)。

```dart
Future main() async {
  // ...
  await for (var request in requestServer) {
    handleRequest(request);
  }
  // ...
}
```

### 元数据
使用元数据可以为代码增加一些额外的信息。元数据注解以 @ 开头，其后紧跟**一个编译时常量或者调用一个常量构造函数。**

目前dart提供三个@修饰符：

 - @deprecated 表示被弃用的
 - @override 表示重写
 - @proxy 表示代理

```dart
class Television {
  /// _弃用: 使用 [turnOn] 替代_
  @deprecated
  void activate() {
    turnOn();
  }

  /// 打开 TV 的电源。
  void turnOn() {...}
}

// @override 可能是用得最多的

class myName extends Father {
	// 这里我们重写name
	@override
	void name () {
		print('shotCat')
	}
}
```