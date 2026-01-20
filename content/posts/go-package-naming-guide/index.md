---
title: "Go 包命名的最佳实践：从 go-pkg-sdk 到 kit 的重构之旅"
date: 2025-10-27T00:00:00+08:00
draft: false
tags:
  - Go
  - 编程规范
  - 架构设计
categories:
  - 技术分享
cover: cover.svg
---

## 引言

最近我重构了一个Go工具包，从 `go-pkg-sdk` 重命名为 `kit`。这个过程让我深刻认识到**包命名**的重要性。好的命名能提升代码的可读性、可维护性，更重要的是，能让AI Agent更好地理解和导航代码。

## 为什么命名如此重要？

### 1. 可读性
好的包名应该让代码自解释：
```go
// ❌ 糟糕
import "yourproject/xlog"
import "yourproject/xhttp"

// ✅ 清晰
import "yourproject/log"
import "yourproject/http"
```

### 2. 可维护性
遵循社区约定能让团队成员快速上手，也能让AI更好地理解代码结构。

### 3. AI Agent友好
清晰的命名让AI更容易定位代码、理解模块关系、生成符合项目风格的代码。

## Go 包命名的核心原则

### 原则1：简短、清晰、单数

**好例子：**
```go
package log      // ✅
package http     // ✅
package db       // ✅
package cache    // ✅
```

**坏例子：**
```go
package logs          // ❌ 不要复数
package httputils     // ❌ 太长
package my_logger     // ❌ 不要下划线
package pkg           // ❌ 太泛用
```

### 原则2：避免无意义的前缀/后缀

**坏例子：**
```go
package xlog       // x是什么意思？
package util      // 太泛用
package helper     // 没有实际含义
package golog      // go是多余的
```

**好例子：**
```go
package log
package logger
package zap        // 如果需要区分实现
```

### 原则3：使用完整路径区分，不用前缀区分

**坏例子：**
```go
import "project/xlog"
import "project/xhttp"
import "project/xdb"
```

**好例子：**
```go
import "project/log"
import "project/http"
import "project/db"
```

### 原则4：不要用项目/公司名重复

**坏例子：**
```go
module github.com/company/company-sdk
module github.com/user/go-pkg-sdk    // go和sdk都是多余的
```

**好例子：**
```go
module github.com/company/sdk
module github.com/user/kit
```

## 我的重构经验：从 go-pkg-sdk 到 kit

### 问题分析

原来的命名 `go-pkg-sdk` 有以下问题：

1. **三层冗余词叠加**
   - `go` - 语言前缀（不推荐）
   - `pkg` - package的缩写
   - `sdk` - Software Development Kit

2. **太长（11个字符）**
   - 不好输入
   - 不好记忆

3. **违反Go社区习惯**
   - Go官方明确说"Don't use the 'go' prefix in package names"

### 解决方案

我选择了 `kit`（工具包），原因：

1. **简洁（3个字母）**
2. **语义清晰** - kit就是工具包的意思
3. **符合Go习惯** - 参考了go-kit等项目
4. **品牌感** - 简短有力

### 对比知名项目

| 我的命名 | 社区项目 | 评价 |
|---------|---------|------|
| `kit` | `go-kit/kit` | ⭐⭐⭐⭐⭐ 符合习惯 |
| `kit` | `gin` | ⭐⭐⭐⭐ 简洁有力 |
| `kit` | `zap` | ⭐⭐⭐⭐ 简短好记 |

## 接口设计的最佳实践

### 原则："Accept interfaces, return structs"

这是Go社区最重要的设计原则。

#### 1. 函数参数使用接口

```go
// ❌ 错误：参数要求具体类型
func ProcessOrder(logger *zap.Logger, order Order) error

// ✅ 正确：参数接受接口
func ProcessOrder(logger Logger, order Order) error
```

**为什么？**
- 更灵活：可以传任何实现了Logger的类型
- 更易测试：可以传mock logger
- 更好的解耦

#### 2. 函数返回值使用具体类型

```go
// ❌ 错误：返回接口，不明确
func NewService(db DB) Service { ... }

// ✅ 正确：返回具体类型，明确
func NewUserService(db *gorm.DB) *UserService { ... }
```

**为什么？**
- 更明确：调用者知道拿到什么
- 功能完整：可以访问所有public方法
- IDE友好：自动补全完美支持

#### 3. 真实例子

```go
// 定义简单清晰的接口
type Logger interface {
    Info(msg string, fields ...interface{})
    Error(msg string, fields ...interface{})
}

// 构造函数：接受接口，返回具体类型
func NewUserService(db *gorm.DB, logger Logger) *UserService {
    return &UserService{
        db: db,
        logger: logger,
    }
}
```

## 何时应该做接口抽象？

### ❌ 不应该做接口的情况

**案例：GORM的封装**

```go
// ❌ 过度抽象
type DB interface {
    Create(...) DB
    Find(...) DB
    Where(...) DB
    // ... 23个方法，几乎和GORM一模一样
}

// 问题：
// 1. 不会真的从GORM切换到XORM
// 2. 维护两套代码（GORM的API + 你的接口）
// 3. 失去了GORM的优势（类型安全、插件等）
```

**为什么不应该？**
- 没有真正的切换需求
- 接口和实现太相似（没价值）
- 维护成本高

**正确的做法：**
```go
// ✅ 直接使用GORM
func NewDB(config Config) (*gorm.DB, error) {
    db, err := gorm.Open(mysql.Open(config.DSN), &gorm.Config{
        Logger: NewGormLogger(config.Logger), // 只封装日志适配器
    })
    return db, err
}
```

### ✅ 应该做接口的情况

**案例：Logger接口**

```go
// ✅ 合理的接口
type Logger interface {
    Info(msg string, fields ...interface{})
    Error(msg string, fields ...interface{})
}

// 可以有多种实现
type ZapLogger struct { ... }
type LogrusLogger struct { ... }
type TestLogger struct { ... }  // 测试用
```

**为什么合理？**
- 真实的切换需求（zap vs logrus）
- 接口简洁稳定（Debug/Info/Error几十年不变）
- 增加了价值（统一格式、集成trace）

## 包结构设计指南

### 推荐的目录结构

```
kit/
├── config/              # 模块根目录
│   ├── config.go        # 核心API
│   ├── option.go        # Options模式
│   ├── watcher.go       # 具体功能
│   ├── provider/        # 子模块
│   │   └── provider.go
│   └── examples/         # 使用示例
├── log/                  # 另一个模块
│   ├── logger.go        # 接口定义
│   └── zap/             # 实现层
│       └── logger.go
└── docs/                 # 文档
    └── architecture.md
```

### 命名约定

| 类型 | 命名规则 | 例子 |
|------|---------|------|
| 文件名 | `snake_case` | `logger.go`, `config.go` |
| 类型名 | `PascalCase` | `Logger`, `Config` |
| 接口文件 | 模块根目录 | `logger.go`, `config.go` |
| 实现目录 | 子目录 | `zap/`, `gorm/` |

### AI Agent友好的设计

为了让AI更好地理解代码，我遵循了这些原则：

1. **清晰的模块边界**
   - 每个模块有独立的README
   - 接口和实现分离

2. **自文档化的命名**
   - 文件名清晰表达功能
   - 目录结构反映层次关系

3. **统一的API风格**
   - 所有模块用Options模式
   - 统一的错误处理

## 包命名的场景建议

### 通用工具包

**命名选择：**
1. `kit` - 推荐⭐⭐⭐⭐⭐
2. `base` - 基础库
3. `core` - 核心库
4. `common` - 通用库

### 可观测性工具包

如果你的库主要做log/trace/metric集成：

1. `observe` - 推荐⭐⭐⭐⭐⭐（最契合）
2. `otel` - 如果基于OpenTelemetry
3. `insight` - 有品牌感
4. `beacon` - 视觉化

### 企业/团队内部库

```
github.com/yourcompany/sdk/   # ✅
github.com/yourcompany/kit/   # ✅
github.com/yourcompany/base/  # ✅
```

## 命名决策表

| 场景 | 推荐命名 | 原因 |
|------|---------|------|
| 通用工具包 | `kit` | 简洁、社区认可 |
| 配置管理 | `config` | 清晰、直接 |
| 日志模块 | `log` 或 `logger` | 简短、标准 |
| 数据库 | `db` | 简洁、清晰 |
| HTTP客户端 | `http` 或 `client` | 标准库风格 |
| Web框架 | `web` 或 `server` | 语义清晰 |
| 缓存 | `cache` | 直接明了 |
| 消息队列 | `queue` | 标准术语 |

## 重构检查清单

如果你也要重构包名，按照这个清单：

- [ ] 检查命名是否符合Go社区习惯
- [ ] 避免冗余的前缀（go、pkg、sdk等）
- [ ] 保持简短（3-8个字符最佳）
- [ ] 更新go.mod的module名称
- [ ] 批量更新所有import路径
- [ ] 更新README.md
- [ ] 更新文档中的引用
- [ ] 验证所有示例代码
- [ ] 通知团队成员

## 总结

好的包命名应该：

1. ✅ **简洁有力** - 3-8个字符，好记好输入
2. ✅ **语义清晰** - 看名字就知道用途
3. ✅ **符合社区习惯** - 参考优秀项目
4. ✅ **避免冗余** - 不用go/xxx/pkg等前缀
5. ✅ **有扩展性** - 容易添加新模块

记住：**好的命名让代码自我解释，让AI更好理解，让团队更易维护。**

## 参考资源

- [Effective Go - Package Names](https://go.dev/doc/effective_go#package-names)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments#package-names)
- [Rob Pike: Don't use the 'go' prefix](https://go.dev/blog/package-names)

