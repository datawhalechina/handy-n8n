# n8n AI 相关概念

n8n 一大优势就是其内置了 AI 相关的节点和处理方式，可以方便用户构建 AI 相关的应用，包括
AI 聊天机器人、文本总结、AI Agent 等。

## Cluster nodes 集群节点

n8n 中，集群节点 (Cluster nodes) 是一组一起工作的节点组，它们由一个根节点 (root node) 和
一个或多个扩展节点功能的子节点 (sub-nodes) 组成。AI 相关的功能由集群节点实现。

![clustor nodes root sub nodes](images/n8n-root-sub-nodes.png)

Cluster nodes 的根节点一般分 Chian 及 Agent 类型。
Chain 是一种简单的 LLM 集成方式，用来串联工作流中的其他节点，且不支持记忆功能。

以下是 n8n 中内置的 Chain 节点：

- [Basic LLM Chain](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainllm/)
- [Retrieval Q&A Chain](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/)
- [Summarization Chain](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainsummarization/)
- [Sentiment Analysis](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.sentimentanalysis/)
- [Text Classifier](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.text-classifier/)

Agent 节点则可以访问更多的工具，以及可以根据用户输入和上下文信息执行任务，并通过工具返回的信息做
执行的决策。可以认为 Agent 是一种知道如何做出决策的 Chain 节点。

以下是 n8n 中内置的 root node 列表：

<n8n-workflow src='../workflows/c04/n8n_root_nodes.json' />

## Memory 记忆

在构建 AI 聊天机器人时，记忆 (Memory) 是一个重要的概念，它允许 AI 模型记住之前对话的内容，以便
在后续的对话中使用这些信息。记忆可以帮助 AI 模型更好地理解用户的意图，并生成更准确和相关的回答。

如果没有记忆，AI 将无法记住上下文，如下是一个没有记忆的 AI 聊天示例：

![chat without memory](images/n8n-chat-without-memory.png)

在 Agent 节点上，我们可以添加记忆节点，以便 AI 模型记住之前对话的内容。如下是几种 n8n 支持的
常见记忆体

- Simple Memory
- MongoDB Chat Memory
- Redis Chat Memory
- Postgres Chat Memory

在测试的简单场景，我们选择 Simple Memory 即可。如下是添加了记忆之后的 AI 对话

![chat with memory](images/n8n-chat-with-memory.png)

从截图中我们可以看到，一次对话交互，Agent 节点与 Memory 交互了两次，分别是`loadMemoryVariables`
及`saveContext`，其中`loadMemoryVariables`用于加载记忆，`saveContext`用于保存记忆。

> Simple Memory 使用 worker 的内存存储记忆，在 n8n Queue 部署模式中队列分发无法确保每次到
> 相同的节点，所以对于复杂的模式请使用外部的记忆体，如 Redis Chat Memory。

一个简单的带记忆的工作流如下：

<n8n-workflow src='../workflows/c04/n8n_chat_with_memory.json' />

## RAG

RAG (Retrieval-Augmented Generation) 是一种结合了检索和生成两种方法的 AI 模型，它能够从大量
的文本数据中检索相关信息，并将这些信息与生成模型结合，以生成更准确和相关的回答。

RAG 模型通常由两部分组成：检索模块和生成模块。检索模块负责从大量文本数据中检索相关信息，生成
模块则负责根据检索到的信息生成回答。

n8n 中的 RAG 系统通常依赖 vector store 来进行外部数据的存储与检索。vector store 向量存储，
或称 vector database 向量数据库，是一种用于存储 embedding 向量的数据库，它能够根据向量之间的
相似度进行检索。

在 n8n 中，RAG 一般包括两个部分，一是内容的上传，二是内容的查询。下面我们通过例子来演示一个
简单的 RAG 系统。

### 内容上传

我们使用 **On form submission** 作为触发节点来上传文件，通过编辑节点中的表单配置，添加文件
类型字段，如下所示：

![rag form settings](images/n8n-rag-form-settings.png)

通过添加 **Simple Vector Store** 节点，选择 **Insert Documents** 操作，将表单中的文件
上传到 vector store 中，如下所示：

![vector insert documents](images/n8n-vector-insert-documents.png)

**Simple Vector Store** 也是一种集群节点，需要关联一个 **Embedding Model** 节点，
以及一个文档加载节点。**Embedding Model**节点用于将文档转化为向量，
这里我们使用 Gemini 的 `text-embedding-004` 模型，文档加载节点我们使用
**Default Data Loader**节点。**Default Data Loader** 节点中的
**Input Data Field Name** 配置需要与 **On form submission**
节点中的表单字段名一致。

![default data loader](images/n8n-default-data-loader.png)

这样我们就构建了一个文件上传工作流，将用户上传的文件转化为向量并存储到 vector store 中。
点击执行，n8n 将弹出一个表达，并展示之前配置的文件选择输入框，如下所示：

![form trigger popup](images/n8n-form-trigger-popup.png)

选择文件后，点击提交，n8n 将执行工作流，将文件上传到 vector store 中。在本例中，我们使用
[chat 嬛嬛.txt](/c04/data/chat嬛嬛.txt ":ignore")作为文档示例。

### 内容检索

接下来，我们构建一个内容检索工作流，通过用户输入的问题，以及 AI Agent 的大模型，
从 vector store 中检索相关内容并完成回答。

我们使用 **On chat message** 作为触发节点，并关联 AI Agent 节点，在 AI Agent 节点中的
`Tool`关联**Simple Vector Store**作为工具，配置 **Retrieve Documents (As Tool for AI Agent)**
作为操作，同时需要关联与之前内容上传工作流相同的 **Embedding Model** 节点。

我们可以断开 AI Agent 节点与 **Simple Vector Store** 节点的连接，来测试没有 RAG 情况下的
对话效果。如下分别是有 RAG 和没有 RAG 的对话效果：

![rag chat](images/n8n-chat-with-rag.png)

![no rag chat](images/n8n-chat-without-rag.png)

可以看到在有 RAG 的情况下，AI Agent 能够根据用户的问题，从 vector store 中检索相关内容，并
生成更准确和相关的回答。

### 参考

如下是上述示例的完整的工作流

<n8n-workflow src='../workflows/c04/n8n_rag.json' />

官方文档参考<https://docs.n8n.io/advanced-ai/rag-in-n8n/>

## Tools 工具

在上述示例中，我们使用 Simple Vector Store 作为 AI Agent 节点的工具。在 AI 场景中，
工具有着特殊的意义，它能够帮助 AI Agent 补充额外的 LLM 不支持的能力，如搜索引擎搜索、
数据库查询、天气信息查询等。

一个 AI Agent 可以关联多个工具，如下所示我们添加了两个工具，**Date & Time Tool** 和
**Calculator**，分别用于查询日期和时间，以及计算器。

![ai agent tools](images/n8n-ai-agent-tools.png)

完整的工作流如下：

<n8n-workflow src='../workflows/c04/n8n_tools.json' />
