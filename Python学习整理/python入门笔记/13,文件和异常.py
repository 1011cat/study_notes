# 通过python打开文件
with open('pi.txt') as pi:
    txt = pi.read()
    print(txt)

# 当你需要使用任何文件时，首先必须先得打开该文件。open函数支持打开文件，
# 其中的第一个参数就是**当前文件夹**的文件名。并返回当前的文件对象，这里用as将其存储在pi变量上。
# 方法read() 可以读取这个文件的全部内容，我们将其赋值给变量txt
# 注意：此时txt与源文件还是不一样的，它会多一个空行。因为read() 到达文件末尾时返回一个空字符串，而将这个空字符串显示出来时就是一个空行。
# 这里就可以使用之前提到的rstrip()去除末尾空白。txt.rstrip()


# 上面我们使用了with关键字打开文件，而且它可以在我们不需要文件时，将其关闭
# 虽然open和close函数也可以，如下。但是如果出现错误，没有执行关闭close，就可能对文件本身进行修改
# Pi = open('pi.txt')
# print(Pi.read())
# Pi.close()


# 前面说过open函数支持打开的是当前所文件所在的文件夹。
# open支持两种打开方式，一种就是相对路径，另一种就是绝对路径。
# 为了方便测试，请查看file文件夹下的'文件和异常.py'


# 逐行读取 有时我们想逐行读取文件
# 为了方便灵活，建议将路径设置为变量
path = 'pi.txt'
with open(path) as pi:
    for line in pi:
        print(line.rstrip())

# 因为使用with语句 返回的文件对象 只能在with语句内使用，即上例中的pi
# 如果要在with外使用，则需要用到readlines函数，将其赋值给另外一个变量
with open(path) as pi:
    lines = pi.readlines()

for line in lines:
    print(line.rstrip())

# 如果想要将所有行数据合在一起，可以按如下连接，这时就需要strip去掉首尾的空字符
content = ''
for line in lines:
    content += line.strip()
print(content)

# 文件的写入：open(path, mode）
# 写入依然会用到open函数，它的第一个参数是文件地址，第二个参数mode则是控制读取与写入，下面主要说明下各种常见参数
# open(path, 'r') 以只读方式打开文件。文件的指针将会放在文件的开头。这是默认模式，即不输入第二个参数。
# open(path, 'r+') 打开一个文件用于读写。文件指针将会放在文件的开头。
# open(path, 'w') 打开一个文件只用于写入。如果该文件已存在则打开文件，并从开头开始编辑，**即原有内容会被删除！**如果该文件不存在，创建新文件。
# open(path, 'w+') 打开一个文件用于读写。如果该文件已存在则打开文件，并从开头开始编辑，**即原有内容会被删除！**如果该文件不存在，创建新文件。
# open(path, 'a') 打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。
# open(path, 'a+') 打开一个文件用于读写。如果该文件已存在，文件指针将会放在文件的结尾。文件打开时会是追加模式。如果该文件不存在，创建新文件用于读写。
# 总结一下：
# 1，有+号的都是可以读写
# 2，r的指针是在开头
# 3，w的指针也是在开头，没有则创建新文件，但是如果不是新文件，会删掉所有原有内容！！！切记注意！
# 3，a的指针也是在结尾，没有则创建新文件，它只是追加，不会删除原文件内容！
# 4，合理选择mode，选择w相关的需考虑删除原有内容的情况！

# 下面我们用w新建一个文件，并通过write输入新内容，如果不加上\n进行换行，则会连在一起。
with open('hello.txt', 'w') as hello:
    hello.write('hello! my name is shotcat!\nI like python!')

with open('hello.txt', 'a') as hello:
    hello.write('I like coding!')


# 异常：我们知道python在遇到异常报错后，会终止执行，并会显示错误信息，这种体验既不友好，报错信息也会给不安好心的人留下，可乘之机
# 这时我们就可以使用try-except 将可能出错的代码进行包裹，获取到报错信息，并进行处理，这时python就可以继续执行下去，
# 并且给出自定义的报错信息

# 以找不到对应的文件报错为例
path = 'error.txt'
try:
    with open(path) as error:
        txt = error.read()
except FileNotFoundError:
    msg = "Sorry, the file " + path + " does not exist."
    print(msg)
else:
    print('the file exist')

# 如果希望python不发生任何报错或警告则可以通过pass语句
path = 'error.txt'
try:
    with open(path) as error:
        txt = error.read()
except FileNotFoundError:
    pass
else:
    print('the file exist')


# 使用json.dump()和json.load() 进行数据的存储和读取
# json.dump()接受两个参数，一个是要存储的数据，另一个是要存储在哪个文件里
# 首先引入json

import json

user_name = input('what\'s your name?')
filename = 'user_name'
with open(filename, 'w') as name_file:
    json.dump(user_name, name_file)
    print('we remembered you!')
# 现在已经记住信息了，并存储在user_name.json文件里

with open(filename) as name_file:
    name = json.load(name_file)
    print('welcome ' + name + '!')
# 通过json.load读取文件里的信息



