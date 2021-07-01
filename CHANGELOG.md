# CHANGELOG

## [Unreleased]

## [v1.2.14] - 2019-02-29

### 修复

* mock output error

## [v1.2.13] - 2019-02-28

### 修复

* webpack rebuild output error

## [v1.2.12] - 2019-01-25

### 功能

* 支持`define`配置

## [v1.2.11] - 2018-10-24

### 修复

* 修复`external`bug

## [v1.2.10] - 2018-10-17

### 更新

* 修改本地服务启动输出信息

## [v1.2.9] - 2018-09-27

### 修复

* 关闭默认build模式下sourcemap状态

## [v1.2.8] - 2018-09-26

### 功能

* 支持分别自定义dev和build模式下webpack配置
* 支持build模式下开启preload

## [v1.2.7] - 2018-09-18

### 修复

* 修改build命令下清空dist目录问题
* `HtmlWebpackIncludeAssetsPlugin`在多入口模式下`files`的匹配问题

## [v1.2.6] - 2018-09-13

### 支持多入口配置外部样式和脚本引入

在`custom.config.js`中通过设置`multiEntry`，开启多入口配置。目前开启多入口配置之后，路由的自动生成会关闭。

```javascript
{
    multiEntry: [
        {
            name: '', // 入口名称
            entry: '', // 入口文件路径
            filename: '', // build输出html文件路径
            template: '', // 模板文件
            favicon: '', // favicon
            title: '', // title
            externals: [
                {
                    var: 'module', // 模块名
                    url: 'url', // 资源地址，可以是cdn也可以本地地址
                    package: '' // 包名，支持string|array|object
                }
            ], // 引入外部脚本
            css: [] // 引入外部样式
        },
        ...
    ]
}
```

## [v1.2.5] - 2018-09-12

### 支持多入口配置

在`custom.config.js`中通过设置`multiEntry`，开启多入口配置。目前开启多入口配置之后，路由的自动生成会关闭。

```javascript
{
    multiEntry: [
        {
            name: '', // 入口名称
            entry: '', // 入口文件路径
            filename: '', // build输出html文件路径
            template: '', // 模板文件
            favicon: '', // favicon
            title: '', // title
        },
        ...
    ]
}
```

### 支持Mock数组配置

在`mock.config.js`中，`proxy`属性支持数组配置。

```javascript
{
    proxy: [
        {

            enable: true,
            path: '', // path
            options: {}
        },
        ...
    ]
}
```

## [v1.0.0] - 2018-03-06
### 项目初始化
