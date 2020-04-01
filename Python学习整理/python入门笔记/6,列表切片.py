# 在py中将列表的部分元素称为切片，切片只需要指定第一个元素和最后一个元素的索引,注意它也是只到最后一个索引为止
girlfriends = ['taylor swift', '新垣结衣', '石原里美', '迪丽热巴']
print(girlfriends[0:3])

# 如果你没有指定第一个索引，Python将自动从列表开头开始:
print(girlfriends[:2])

# 如果你没有指定第二个索引，Python将自动提取到列表的末尾
print(girlfriends[1:])

# 负数索引返回离列表末尾相应距离的元素
print(girlfriends[-2:])
print(girlfriends[:-1])

for girl in girlfriends[1:3]:
    print(girl)

# 通过切片复制列表得到一个新的列表
copy = girlfriends[:]
copy.append('关晓彤')
print(girlfriends)
print(copy)





