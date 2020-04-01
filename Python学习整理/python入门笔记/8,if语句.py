# 在python中使用==来判断两者是否相等
foo = 'shotcat'
bar = 'shotcat'
if foo == bar:
    print('true')

# 如果在比较时，想忽略大小写
foo = 'Shotcat'
bar = 'shotcat'
if foo.lower() == bar:
    print('true')
# lower()并不会改变foo的值
print(foo)

# 判断是否不相等 使用!=
print(foo != bar)

# py支持各种数学比较，如小于、小于等于、大于、大于等于:
age = 18
print(age > 19)
print(age >= 18)
print(age < 19)
print(age <= 20)

# py中检查多个条件，使用and 和 or 就像&& 和 ||。and 表示多个条件必须都为true，or 则是只需要满足其中一个条件
print(111, age > 17 and age < 19)
print(222, age > 18 or age < 19)
# 这样写都可以
print(333, 17 < age < 19)

# 要判断特定的值是否已包含在列表中，可使用关键字in
girlfriends = ['taylor swift', '新垣结衣', '石原里美', '迪丽热巴']
print('新垣结衣' in girlfriends)

# 要判断特定的值是否不包含在列表中，可使用关键字not in
if 'shotcat' not in girlfriends:
    print('不在')

# if-else 与if-elif-else 其中else是非必须的，可以不写
age = 18
if age > 19:
    print('超过19')
else:
    print('没超过19')

if age > 19:
    print('超过19')
elif age == 18:
    print('刚好18')
else:
    print('没超过18')

# 在python中空列表 会判断为False
list1 = []
if list1:
    print('True')
else:
    print('False')






