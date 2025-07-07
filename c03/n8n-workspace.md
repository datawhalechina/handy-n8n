# n8n 平台介绍

对于本地，云主机，或者 Huggingface space 部署的 n8n 平台，我们需要创建账户。一般地址是类似
如下的格式：

- 本地 - http://127.0.0.1:5678/
- 云主机 - https://n8n.example.com/
- Huggingface space - https://profile-n8n.hf.space/

## 注册账户

- 打开对应的地址，弹出注册页面，按表单填写自己的用户名、邮箱、密码等，点击**Next**

  ![n8n setup](images/n8n_setup.png)

- 填写自己的邮箱，接受免费 license

  ![n8n free license](images/n8n_free_license.png)

- 检查邮箱，复制 license 信息

  ![n8n license email](images/n8n_license_email.png)

## 界面介绍

登录到系统后，我们可以看到如下的页面

![n8n web console](images/n8n_web.png)

其中主页面上方部分展示系统中工作流的运行统计情况，下部分为工作流、凭据、工作流执行列表等信息。

我们以下列工作流为示例，导入到 n8n 系统中，展示 n8n 系统的界面和功能。

<n8n-workflow src="../workflows/c03/test.json" />

在 n8n 系统中，点击 **Start from scratch**，介绍两种导入方式：

1. 点击示例工作流下面**the workflow's code**以展示工作流代码，点击 Copy 复制代码。

   ![n8n workflow test](images/n8n_workflow_test.png)

使用复制快捷键`Ctrl+V`（windows 系统）或者`Command (⌘) + V`（mac 系统）

2. 拷贝工作流下方的链接，点击 n8n 系统右上方菜单点击**Import from URL**，粘贴链接。

   ![n8n workflow import from URL](images/n8n_workflow_import_from_url.png)

我们可以看到对应的测试工作流已经展示到 n8n 系统中。需要注意的是 n8n 的工作流不会自动保存，需要
手动点击**Save**按钮或者使用保存快捷键以保存工作流。

点击**Execute workflow**，我们可以看到工作流开始执行，并在界面下方日志区域看到执行过程的输入
输出。

![n8n workflow test execution](images/n8n_workflow_execution.png)
