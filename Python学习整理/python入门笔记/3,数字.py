# 数字分为整数int 和浮点数float
# 整数可以进行加(+ )减(- )乘(* )除(/ )，两个乘号(**)表示乘方运算
print(2+3, 2*3, 2**3)

# Python将带小数点的数字都称为浮点数，但有时会出现小数位数可能是不确定的
print(0.2+0.3, 0.1+0.2, .2+.3)

# py和js不同，js有隐式转换，将数字转换为字符串，但py不行，你得使用str(),主动进行转换
age = 18
# 下面这种写法会报错
# msg = "Happy " + age + "th Birthday!"
# print(msg)

msg = "Happy " + str(age) + "th Birthday!"
print(msg)

import this