#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ADHD助手后端API测试脚本
测试所有API端点的功能，包括正常调用、异常调用、数据验证等
"""

import requests
import json
import time
import uuid
from datetime import datetime, timedelta

class ADHDAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_user_id = None
        self.test_task_id = None
        self.test_mood_id = None
        self.test_sleep_id = None
        
    def print_test_result(self, test_name, success, message=""):
        """打印测试结果"""
        status = "✅ 通过" if success else "❌ 失败"
        print(f"{status} {test_name}")
        if message:
            print(f"   消息: {message}")
        print()
    
    def test_server_connection(self):
        """测试服务器连接"""
        try:
            response = requests.get(f"{self.base_url}/api/ai/status", timeout=5)
            self.print_test_result("服务器连接测试", response.status_code == 200)
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            self.print_test_result("服务器连接测试", False, f"连接失败: {e}")
            return False
    
    def test_user_creation(self):
        """测试用户创建"""
        print("=== 用户管理测试 ===")
        
        # 正常创建用户
        user_data = {
            "name": "测试用户",
            "email": "test@example.com",
            "preferences": {"theme": "light", "notifications": True}
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/users", json=user_data)
            if response.status_code == 200:
                user = response.json()
                self.test_user_id = user["id"]
                self.print_test_result("用户创建", True, f"用户ID: {self.test_user_id}")
            else:
                self.print_test_result("用户创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("用户创建", False, f"异常: {e}")
        
        # 测试缺少必要字段
        try:
            response = requests.post(f"{self.base_url}/api/users", json={"name": "测试"})
            self.print_test_result("用户创建-缺少邮箱", response.status_code == 400)
        except Exception as e:
            self.print_test_result("用户创建-缺少邮箱", False, f"异常: {e}")
        
        # 测试获取用户
        if self.test_user_id:
            try:
                response = requests.get(f"{self.base_url}/api/users/{self.test_user_id}")
                self.print_test_result("用户获取", response.status_code == 200)
            except Exception as e:
                self.print_test_result("用户获取", False, f"异常: {e}")
            
            # 测试获取不存在的用户
            try:
                response = requests.get(f"{self.base_url}/api/users/nonexistent")
                self.print_test_result("用户获取-不存在", response.status_code == 404)
            except Exception as e:
                self.print_test_result("用户获取-不存在", False, f"异常: {e}")
    
    def test_task_management(self):
        """测试任务管理"""
        print("=== 任务管理测试 ===")
        
        if not self.test_user_id:
            print("❌ 跳过任务测试 - 没有测试用户ID")
            return
        
        # 创建任务
        task_data = {
            "user_id": self.test_user_id,
            "title": "测试任务",
            "description": "这是一个测试任务",
            "priority": 2,
            "due_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "category": "学习"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/tasks", json=task_data)
            if response.status_code == 200:
                task = response.json()
                self.test_task_id = task["id"]
                self.print_test_result("任务创建", True, f"任务ID: {self.test_task_id}")
            else:
                self.print_test_result("任务创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("任务创建", False, f"异常: {e}")
        
        # 测试缺少必要字段
        try:
            response = requests.post(f"{self.base_url}/api/tasks", json={"title": "测试"})
            self.print_test_result("任务创建-缺少用户ID", response.status_code == 400)
        except Exception as e:
            self.print_test_result("任务创建-缺少用户ID", False, f"异常: {e}")
        
        # 获取用户任务
        try:
            response = requests.get(f"{self.base_url}/api/tasks/{self.test_user_id}")
            if response.status_code == 200:
                tasks = response.json()
                self.print_test_result("任务获取", True, f"获取到 {len(tasks)} 个任务")
            else:
                self.print_test_result("任务获取", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("任务获取", False, f"异常: {e}")
        
        # 更新任务
        if self.test_task_id:
            update_data = {
                "completed": True,
                "title": "已完成的测试任务",
                "description": "任务已完成",
                "priority": 1
            }
            
            try:
                response = requests.put(f"{self.base_url}/api/tasks/{self.test_task_id}", json=update_data)
                self.print_test_result("任务更新", response.status_code == 200)
            except Exception as e:
                self.print_test_result("任务更新", False, f"异常: {e}")
            
            # 测试更新不存在的任务
            try:
                response = requests.put(f"{self.base_url}/api/tasks/nonexistent", json=update_data)
                self.print_test_result("任务更新-不存在", response.status_code == 404)
            except Exception as e:
                self.print_test_result("任务更新-不存在", False, f"异常: {e}")
    
    def test_mood_recording(self):
        """测试情绪记录"""
        print("=== 情绪记录测试 ===")
        
        if not self.test_user_id:
            print("❌ 跳过情绪测试 - 没有测试用户ID")
            return
        
        # 创建情绪记录
        mood_data = {
            "user_id": self.test_user_id,
            "mood_score": 4,
            "notes": "今天心情不错，完成了几个任务",
            "date": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/mood", json=mood_data)
            if response.status_code == 200:
                mood = response.json()
                self.test_mood_id = mood["id"]
                self.print_test_result("情绪记录创建", True, f"记录ID: {self.test_mood_id}")
            else:
                self.print_test_result("情绪记录创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("情绪记录创建", False, f"异常: {e}")
        
        # 测试无效的情绪评分
        try:
            invalid_mood_data = {
                "user_id": self.test_user_id,
                "mood_score": 10,  # 超出范围
                "date": datetime.now().isoformat()
            }
            response = requests.post(f"{self.base_url}/api/mood", json=invalid_mood_data)
            self.print_test_result("情绪记录-无效评分", response.status_code == 400)
        except Exception as e:
            self.print_test_result("情绪记录-无效评分", False, f"异常: {e}")
        
        # 获取用户情绪记录
        try:
            response = requests.get(f"{self.base_url}/api/mood/{self.test_user_id}")
            if response.status_code == 200:
                moods = response.json()
                self.print_test_result("情绪记录获取", True, f"获取到 {len(moods)} 条记录")
            else:
                self.print_test_result("情绪记录获取", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("情绪记录获取", False, f"异常: {e}")
    
    def test_sleep_recording(self):
        """测试睡眠记录"""
        print("=== 睡眠记录测试 ===")
        
        if not self.test_user_id:
            print("❌ 跳过睡眠测试 - 没有测试用户ID")
            return
        
        # 创建睡眠记录
        sleep_data = {
            "user_id": self.test_user_id,
            "bedtime": "23:00",
            "wake_time": "07:00",
            "quality_score": 4,
            "notes": "睡眠质量不错，感觉精力充沛",
            "date": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/sleep", json=sleep_data)
            if response.status_code == 200:
                sleep = response.json()
                self.test_sleep_id = sleep["id"]
                self.print_test_result("睡眠记录创建", True, f"记录ID: {self.test_sleep_id}")
            else:
                self.print_test_result("睡眠记录创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("睡眠记录创建", False, f"异常: {e}")
        
        # 测试无效的睡眠质量评分
        try:
            invalid_sleep_data = {
                "user_id": self.test_user_id,
                "bedtime": "23:00",
                "wake_time": "07:00",
                "quality_score": 8,  # 超出范围
                "date": datetime.now().isoformat()
            }
            response = requests.post(f"{self.base_url}/api/sleep", json=invalid_sleep_data)
            self.print_test_result("睡眠记录-无效评分", response.status_code == 400)
        except Exception as e:
            self.print_test_result("睡眠记录-无效评分", False, f"异常: {e}")
        
        # 获取用户睡眠记录
        try:
            response = requests.get(f"{self.base_url}/api/sleep/{self.test_user_id}")
            if response.status_code == 200:
                sleeps = response.json()
                self.print_test_result("睡眠记录获取", True, f"获取到 {len(sleeps)} 条记录")
            else:
                self.print_test_result("睡眠记录获取", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("睡眠记录获取", False, f"异常: {e}")
    
    def test_reading_content(self):
        """测试阅读内容"""
        print("=== 阅读内容测试 ===")
        
        # 创建阅读内容
        content_data = {
            "title": "测试文章",
            "content": "这是一篇测试文章的内容，用于验证阅读功能。",
            "difficulty_level": 2,
            "category": "教育"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/reading", json=content_data)
            if response.status_code == 200:
                content = response.json()
                self.print_test_result("阅读内容创建", True, f"内容ID: {content['id']}")
            else:
                self.print_test_result("阅读内容创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("阅读内容创建", False, f"异常: {e}")
        
        # 获取所有阅读内容
        try:
            response = requests.get(f"{self.base_url}/api/reading")
            if response.status_code == 200:
                contents = response.json()
                self.print_test_result("阅读内容获取", True, f"获取到 {len(contents)} 篇文章")
            else:
                self.print_test_result("阅读内容获取", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("阅读内容获取", False, f"异常: {e}")
        
        # 按难度筛选
        try:
            response = requests.get(f"{self.base_url}/api/reading?difficulty=2")
            if response.status_code == 200:
                contents = response.json()
                self.print_test_result("阅读内容-难度筛选", True, f"获取到 {len(contents)} 篇难度2的文章")
            else:
                self.print_test_result("阅读内容-难度筛选", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("阅读内容-难度筛选", False, f"异常: {e}")
    
    def test_ai_features(self):
        """测试AI功能"""
        print("=== AI功能测试 ===")
        
        # 测试AI配置状态
        try:
            response = requests.get(f"{self.base_url}/api/ai/config")
            if response.status_code == 200:
                config = response.json()
                self.print_test_result("AI配置状态", True, f"已配置: {config.get('configured', False)}")
            else:
                self.print_test_result("AI配置状态", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("AI配置状态", False, f"异常: {e}")
        
        # 测试AI状态
        try:
            response = requests.get(f"{self.base_url}/api/ai/status")
            if response.status_code == 200:
                status = response.json()
                self.print_test_result("AI状态", True, f"AI启用: {status.get('ai_enabled', False)}")
            else:
                self.print_test_result("AI状态", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("AI状态", False, f"异常: {e}")
        
        # 测试AI配置更新（无效API密钥）
        try:
            config_data = {
                "apiKey": "invalid_key",
                "model": "glm-4",
                "baseUrl": "https://open.bigmodel.cn/api/paas/v4"
            }
            response = requests.post(f"{self.base_url}/api/ai/config", json=config_data)
            self.print_test_result("AI配置更新", response.status_code == 200)
        except Exception as e:
            self.print_test_result("AI配置更新", False, f"异常: {e}")
        
        # 测试AI连接测试
        try:
            response = requests.post(f"{self.base_url}/api/ai/test")
            if response.status_code == 200:
                result = response.json()
                self.print_test_result("AI连接测试", True, f"成功: {result.get('success', False)}")
            else:
                self.print_test_result("AI连接测试", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("AI连接测试", False, f"异常: {e}")
    
    def test_data_persistence(self):
        """测试数据持久化"""
        print("=== 数据持久化测试 ===")
        
        if not self.test_user_id:
            print("❌ 跳过数据持久化测试 - 没有测试用户ID")
            return
        
        # 创建测试数据
        test_data = {
            "user_id": self.test_user_id,
            "title": "持久化测试任务",
            "description": "测试数据是否正确保存",
            "priority": 1,
            "due_date": datetime.now().isoformat()
        }
        
        try:
            # 创建任务
            response = requests.post(f"{self.base_url}/api/tasks", json=test_data)
            if response.status_code == 200:
                task = response.json()
                task_id = task["id"]
                self.print_test_result("数据创建", True, f"任务ID: {task_id}")
                
                # 验证数据是否正确保存
                response = requests.get(f"{self.base_url}/api/tasks/{self.test_user_id}")
                if response.status_code == 200:
                    tasks = response.json()
                    saved_task = next((t for t in tasks if t["id"] == task_id), None)
                    if saved_task and saved_task["title"] == test_data["title"]:
                        self.print_test_result("数据持久化验证", True, "数据正确保存")
                    else:
                        self.print_test_result("数据持久化验证", False, "数据保存不正确")
                else:
                    self.print_test_result("数据持久化验证", False, "无法获取保存的数据")
            else:
                self.print_test_result("数据创建", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.print_test_result("数据持久化测试", False, f"异常: {e}")
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始ADHD助手API测试")
        print("=" * 50)
        
        # 检查服务器连接
        if not self.test_server_connection():
            print("❌ 服务器连接失败，停止测试")
            return
        
        # 运行各个模块的测试
        self.test_user_creation()
        self.test_task_management()
        self.test_mood_recording()
        self.test_sleep_recording()
        self.test_reading_content()
        self.test_ai_features()
        self.test_data_persistence()
        
        print("=" * 50)
        print("🎉 测试完成！")
        print(f"测试用户ID: {self.test_user_id}")
        print(f"测试任务ID: {self.test_task_id}")
        print(f"测试情绪记录ID: {self.test_mood_id}")
        print(f"测试睡眠记录ID: {self.test_sleep_id}")

if __name__ == "__main__":
    # 创建测试器实例
    tester = ADHDAPITester()
    
    # 运行所有测试
    tester.run_all_tests() 