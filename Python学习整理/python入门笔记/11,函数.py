# python使用def定义函数
def call_name(desc, name):
    """这个是文档字符串，使用三个双引号。对该函数进行描述。
    Python使用它们来生成有关程序中函数的文档。"""
    print(str(desc) + str(name))


call_name('大家好我的名字是：', 'shotcat')

# 关键字实参：上面的参数desc和name属于位置实参，即参数与传入的参数位置相对应
# 但有时为了进行参数明确，就有了关键字实参，和位置无关。
call_name(desc='大家好我的名字是：', name='shotcat')


# 注意：在使用时，不能将关键字实参放在位置实参前面： call_name(desc='大家好我的名字是：', 'shotcat') 这样写会报错,
# 建议位置实参和关键字实参不要混用！如果要混用位置实参一定要在关键字实参前面

# 参数默认值：当没有提供对应的实参时，则使用默认值。注意：非默认参数必须写在默认参数前面！
def call_name(name, desc='大家好我的名字是：'):
    """这个是文档字符串，使用三个双引号。对该函数进行描述。
    Python使用它们来生成有关程序中函数的文档。"""
    print(str(desc) + str(name))


call_name(name='shotcat')
call_name('shotcat')


# 任意数量的实参：当函数调用时，传了不确定数量的实参过来时，如何使用呢？通过*args（自己设定的参数名），
# python会将传入的所有实参转换为一个元祖的形式，传给变量args
def call_girlfriend(*args):
    if args:
        for girl in args:
            print(girl)


call_girlfriend('taylor swift', '新垣结衣', '石原里美', '迪丽热巴')


def call_girlfriend(first, *args, last):
    print(first)
    print(last)
    for girl in args:
        print(girl)


# 注意 关键字实参只能在位置实参后面
call_girlfriend('taylor swift', '石原里美', '迪丽热巴', last='新垣结衣')

# 在python中模块就是一个py文件,通过import关键字进行引用，
# 其中my_girlfriends作为一个模块名，它里面的hello_girlfriends作为它的一个方法
import my_girlfriends

print(my_girlfriends.hello_girlfriends())

# 引入模块中的某个特定函数 通过from关键字引入模块，再通过import引入模块里的函数
from my_girlfriends import my_name
# from my_girlfriends import my_name, hello_girlfriends 如果引入多个，用逗号分隔

print(my_name())

# 使用as给函数指定别名
from  my_girlfriends import my_name as name

print(name())

# 使用as给模块指定别名
import my_girlfriends as gf
print(gf.hello_girlfriends())

# 使用星号(* )运算符可让Python导入模块中的所有函数

from my_girlfriends import *

print(my_girlfriends.hello_girlfriends())
print(my_girlfriends.my_name())


# 注意：在python中没有明确的可选参数！如果你在调用某个函数或者类时，
# 某个参数你想设为可选参数，就必须给它设置一个默认值，这样你在调用时就可以不用传参，类似做到可选参数




