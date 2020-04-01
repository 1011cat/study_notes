# python用class关键字声明类,首字母大写
class Girlfriend():
    """"这是描述girlfriend的类"""

    # 其中__init__为初始化方法,每次调用类时，都会自动执行
    # 其中self参数为必填，且必须为第一个。其中self指向类的实例本身，并且也是py自动传入的
    def __init__(self, name, age):
        # 设置实例的属性
        print('调用了__init__方法', self, name, age)
        self.name = name
        self.age = age
        # 设置属性的默认值
        self.sex = 'girl'

    def tell_name(self):
        print('我的名字是：' + self.name)

    def tell_age(self):
        print('我的年龄是：' + self.age)


# 调用类，其中girl就是Girlfriend的实例
girl = Girlfriend('泰勒', age='18')

# 访问属性与调用方法
print(girl.name)
print(girl.age)
print(girl.sex)
girl.tell_age()
girl.tell_name()

# 修改实例的属性
girl.name = '新垣结衣'
print(girl.name)


# 继承：一个类继承 另一个类时，它将自动获得另一个类的所有属性和方法;原有的 类称为父类 ，而新类称为子类 。
# 子类继承了其父类的所有属性和方法，同时还可以定义自己的属性和方法。

# 首先定义一个父类，注意父类必须要在子类前面定义
class Darth_Vader():
    def __init__(self, job):
        self.job = job

    def say_sommething(self):
        print('I am your father!')


# 子类继承父类时，括号内必须是父类名
class Luke(Darth_Vader):
    def __init__(self, name, job):
        # 子类通过super继承父类，super() 是一个特殊函数，帮助Python将父类和子类关联起来。
        # 为了继承父类的属性，我们后面还得继续调用__init__
        super().__init__(job)
        self.name = name

    def say_anything(self):
        print('May the force be with you！')


luke_skywalker = Luke('Luke Skywalker', 'Jedi')
print(luke_skywalker.name)
print(luke_skywalker.job)
luke_skywalker.say_sommething()
luke_skywalker.say_anything()


# 如果我想对父类的方法或属性进行修改，直接重新用相同的属性名或方法名进行覆盖
class Luke(Darth_Vader):
    def __init__(self, name, job, desc):
        super().__init__(job)
        self.name = name
        self.job = desc

    def say_sommething(self):
        print('I killed my father!')

    def say_anything(self):
        print('May the force be with you！')


skywalker = Luke('Luke Skywalker', 'Jedi', 'the last Jedi')
print(skywalker.name)
print(skywalker.job)
skywalker.say_sommething()
skywalker.say_anything()


# 如果类太复杂时，我们还可以将某一个类的实例作为另一个类的属性
class Jedi():
    def __init__(self):
        self.power = 'use the force'
        self.target = 'protect the galaxy'


class Luke(Darth_Vader):
    def __init__(self, name, job, desc):
        super().__init__(job)
        self.name = name
        self.job = desc
        self.work = Jedi()

    def say_sommething(self):
        print('I killed my father!')

    def say_anything(self):
        print('May the force be with you！')


skywalker = Luke('Luke Skywalker', 'Jedi', 'the last Jedi')
print(skywalker.work.power)
print(skywalker.work.target)

# 类的导入和前面讲到的函数导入，基本一样
import Jedi

work = Jedi.Work()

from Jedi import Work, Power

work = Work()
power = Power()

import Jedi as jd

work = jd.Work()

# 类的命名规范建议
# 类名应采用驼峰命名法 ，即将类名中的每个单词的首字母都大写，而不使用下划线。实例名和模块名都采用小写格式，并在单词之间加上下划线。
# 类最好都有文档字符串对类进行说明。
# 在类中，可使用一个空行来分隔方法;而在模块中，可使用两个空行来分隔类。
# import写在文件开头，需要同时导入标准库中的模块和你编写的模块时，先编写导入标准库模块的import 语句，再添加一个空行，然后编写导入你自己编写的模块的import 语句。

