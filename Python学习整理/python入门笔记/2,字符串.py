msg = 'i,love,python'
print(msg.title())

# title() 以首字母大写的方式显示每个单词，即将每个单词的首字母都改为大写。

msg = 'shotcat love python'
print(msg.upper())
print(msg.lower())
# upper() 全部大写 lower() 全部小写

# py中使用+号来连接字符串
first_name = 'shot'
last_name = 'cat'
full_name = first_name + last_name
print(full_name)

# 制表符 \t 换行符 \n
msg = 'shotcat'
print(msg)
print('\t' + msg)
print('\n' + msg)

# 删除字符的空白 lstrip()删除开头的空白 rstrip()删除结尾的空白 strip()删除开头和结尾的空白
msg = ' shot cat1 '
print(1, msg.lstrip())
print(2, msg.rstrip())
print(3, msg.strip())
print(4, msg)  # 但是msg的值仍为' shot cat1 ' 仍然包含有空格，并没有改变变量值
msg = msg.strip()  # 这样重新赋值 msg才会去掉首尾空格'shot cat1'
print(5, msg)
