# 在python中使用{a:b} 形式表示字典，就是大括号包裹的键值对,其中键 必须为字符串
name = 'shotcat'
author = {
    'name': name,
    'man': True,
    'address': 'wuhan',
    'age': 18
}
print(author)

# 获取字典中某个键的值，使用['key']
print(author['name'])

# 给字典添加新的键值对
author['girlfriends'] = ['新垣结衣']
print(author)
print(author['girlfriends'][0])

# 修改字典中的值
author['girlfriends'][0] = '石原里美'
print(author['girlfriends'])

# 删除字典中的值 使用del
del author['address']
print(author)

# 遍历字典 py提供了遍历字典的键值对，键或值的方法。注意：需要使用字典的items方法，它会返回一个**键—值对列表**，其中键—值对的返回顺序也与存储顺序不同。
# 遍历字典中的键-值
for key, value in author.items():
    print(key, value)

# 遍历字典中的键时，可以只需要使用方法keys()
for key in author.keys():
    print(key)

# 遍历字典时，会默认遍历所有的键,即使不使用keys方法也是可以的
for key in author:
    print(key)

# 因为keys返回的是一个包含键的列表，所以可以这样使用进行判断
if 'name' in author.keys():
    print('name存在')

# 遍历字典中的值，可以使用values方法
for value in author.values():
    print(value)

# values方法是返回所有的值，所以可能存在重复项，这时可以使用set方法进行去重，set得到的是一种集合类似于列表，但里面的每一项都是独一无二的。
# for value in set(author.values()):
#     print(value)
# 注意上面的方法报错了，TypeError: unhashable type: 'list'。注意：set方法接收的元素里不能有非哈希元素
# 可哈希的元素有：int、float、str、tuple
# 不可哈希的元素有：list、set、dict
# 知道原因后，发现是我们后面新增了girlfriends属性，它是list，不能哈希。果然红颜祸水，现在去掉后再看看
del author['girlfriends']
for value in set(author.values()):
    print(value)
# 现在正常了

















