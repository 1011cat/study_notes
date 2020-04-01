# 函数input() 能让程序暂停运行，等待用户输入一些文本。获取用户输入后，Python将其存储在一个变量中
# 函数input() 接受一个参数:即要向用户显示的提示 或说明，让用户知道该如何做。
# 用户看到终端输出后，输入信息，并在用户按回车键后继续运行。输入存储在变量msg中，接下来的print(msg)将输入打印出来
msg = input('世界上最好的语言是什么？')
print(msg)

# input返回的结果都是字符串形式的,下面的问题我们输入18，康康打印出什么结果
age = input('你的年龄是？')
print(age, type(age))
# 如果想要将结果转换为数值，则可以使用int()方法
age = int(age)
print(age, type(age))

# 求模运算符% 可以返回除法里的余数，如果能整除则返回0，因此可以通过除以2来判断奇偶，偶数则返回0
print(8 % 2)

# while循环与for循环不同的是，只有在满足条件的情况下才会循环，
# 下例：只有当用户输入的msg不等于q，就会不停地循环，重复打印 想结束就输入q
msg = ''
while msg != 'q':
    msg = input('想结束就输入q')
    print(msg)

# 在python中，任何地方都可以使用break来退出循环
# 因为为True 没有break会无限循环下去
while True:
    quit1 = input('想结束就输入q')
    if quit1 == 'q':
        print('已经退出循环')
        break
    else:
        print('好吧，那就继续循环')

# 如果在循环中，想不再继续执行，而是重新开始下一个循环，则可以使用continue
# 如果num为偶数则continue，继续执行下一个循环，num再加1，如果不是偶数，则打印出来
num = 0
while num < 10:
    num += 1
    if num % 2 == 0:
        continue
    else:
        print(num)












