# 测试函数
# Python标准库中的模块unittest 提供了代码测试工具。单元测试 用于核实函数的某个方面没有问题;
# 测试用例 是一组单元测试，这些单元测试一起核实函数在各种情形下的 行为都符合要求。
# 良好的测试用例考虑到了函数可能收到的各种输入，包含针对所有这些情形的测试。
# 全覆盖式测试 用例包含一整套单元测试，涵盖了各种可能的函数使用方式。
# 对于大型项目，要实现全覆盖可能很难。通常，最初只要针对代码的重要行为编写测试即可，等项目被广泛使用时再考虑全覆盖。

# 先导入模块unittest 以及要测试的函数，再创建一个继承unittest.TestCase 的类，
# 并编写一系列方法对函数行为的不同方面进行测试。

import unittest

from test_func import get_plus_func


class PlusTestCase(unittest.TestCase):
    """测试get_plus_func"""

    # 所有以test 打头的方法都将自动运行。
    def test_get_plus_func(self):
        plus_num = get_plus_func(1, 2)
        self.assertEqual(plus_num, 3)


unittest.main()
# 其中assertEqual为断言方法，用来核实得到的结果是否与期望的结果一致。
# unittest.main() 让Python运行这个文件中的测试

# unittest Module中常用的6个断言方法
#           方法                     用途
#     assertEqual(a, b)          核实a == b
#     assertNotEqual(a, b)       核实a != b
#     assertTrue(x)              核实x 为True
#     assertFalse(x)             核实x 为False
#     assertIn(item , list)      核实 item 在 list 中
#     assertNotIn(item , list)   核实 item 不在 list 中
