# 遍历列表 通过for循环实现 for item in items  冒号不要忘记，还有切记第二行有缩进，否则会报错。Python根据缩进来判断代码行与前一个代码行的关系。
girlfriends = ['taylor swift', '新垣结衣', '石原里美', '迪丽热巴']
for girl in girlfriends:
    print(girl)
print(girl)
# 此时变量girl保存的为最后一个值 即迪丽热巴

# range() 函数可创建一系列整数，一般用在 for 循环中。
# 语法：range(start, stop[, step])
# start: 计数从 start 开始。默认是从 0 开始。例如range（5）等价于range（0， 5）;
# stop: 计数到 stop 结束，但不包括 stop。例如：range（0， 5） 是[0, 1, 2, 3, 4]没有5
# step：步长，默认为1。例如：range（0， 5） 等价于 range(0, 5, 1)

range(10)  # 从 0 开始到 10
# [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

range(1, 11)  # 从 1 开始到 11
# [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

range(0, 30, 5)  # 步长为 5
# [0, 5, 10, 15, 20, 25]

range(0, 10, 3)  # 步长为 3
# [0, 3, 6, 9]

range(0, -10, -1)  # 负数
# [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]

range(0)
# []

range(1, 0)
# []

name = 'shotcat'
# for i in len(name): 这样写是错误的，因为循环的对象必须是iterable，而len(name)得到的是int类型
for i in range(len(name)):
    print(name[i])

# range可以帮助我们获取一定规律的整数，但返回的并不是列表，而是一个对象而已，
# 所以还是需要使用函数list() 将range() 的结果直接转换为列表。
numbers = list(range(1, 6))
print(numbers)

# min，max，sum可以分别取得数字列表的最大值、最小值和总和
digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
print(min(digits))
print(max(digits))
print(sum(digits))

# 列表解析 将for 循环和创建新元素的代码合并成一行，并自动 附加新元素。 写成一个list形式，第一个参数为value值的操作（还可以是一个函数） 中间空格间隔，第二个为for的表达式，它最终返回的值是一个列表
squares = [value ** 2 for value in range(1, 10)]
print(squares)

# 列表解析第三个参数，为if判断，第二个参数 可以是多个循环。
print([i * 2 for i in range(11) if i > 5])

l1 = [1, 2, 3, 4]
l2 = [1, 2, 3, 4]
l3 = [x + y for x in l1 for y in l2]
print(l3)
