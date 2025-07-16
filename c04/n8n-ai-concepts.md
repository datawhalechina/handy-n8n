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
