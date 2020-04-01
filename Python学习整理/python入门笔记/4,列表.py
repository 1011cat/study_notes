girlfriends = ['taylor swift', '新垣结衣', '石原里美', '迪丽热巴']
print(girlfriends)

print(girlfriends[0])
print(girlfriends[0].title())

# 访问最后一个索引
print(girlfriends[-1])

# 修改元素
girlfriends[0] = '泰勒斯威夫特'
print(girlfriends[0])

# 在列表末尾添加新元素
girlfriends.append('刘雯')
print(girlfriends)

# 在列表的指定置添加新元素
girlfriends.insert(1,'高圆圆')
print(girlfriends)

# 使用del 语句删除元素
del girlfriends[1]
print(girlfriends)

# pop() 删除列表末尾元素
ex = girlfriends.pop()
print(girlfriends)
print(ex)

# pop()可以删除指定的元素
girlfriends.pop(0)
print(girlfriends)

# remove()根据值删除元素
girlfriends.remove('新垣结衣')
print(girlfriends)
# 注意  方法remove() 只删除第一个指定的值。如果要删除的值可能在列表中出现多次，就需要使用循环来判断是否删除了所有这样的值。

# 使用sort()对列表进行排序 它会将列表按字母顺序排序，并且是永久不可恢复的
girlfriends.sort()
print(girlfriends)
# 如果想字母反序可以加入reverse=True
girlfriends.sort(reverse=True)
print(girlfriends)

# 使用函数sorted() 对列表进行临时排序，同时不影响它们在列表中的原始排列顺序。
print(sorted(girlfriends))
print(girlfriends)

# 使用reverse() 对列表顺序颠倒，同样它也会修改原数据
girlfriends.reverse()
print(girlfriends)

# len()获取列表的长度
print(len(girlfriends))
