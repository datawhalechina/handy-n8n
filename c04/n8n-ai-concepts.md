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
