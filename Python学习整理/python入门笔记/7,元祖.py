# Python将不能修改的值称为不可变的 ，而不可变的列表被称为元组 。
# 元组看起来犹如列表，但使用圆括号而不是方括号来标识。定义元组后，就可以使用索引来访问其元素，就像访问列表元素一样。
# 如果需要存储的一组值在程序的整个生命周期内都不变，可使用元组。
girlfriends = ('taylor swift', '新垣结衣', '石原里美', '迪丽热巴')
print(girlfriends[0])
print(girlfriends[1])
# 此时会报错：TypeError: 'tuple' object does not support item assignment 很显然贾玲不可能是我女盆友，并且报错也会阻断后面代码的执行
# girlfriends[1] = '贾玲'

# 遍历元祖
for girl in girlfriends:
    print(girl)







