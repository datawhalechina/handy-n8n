# Chapter06 案例分享

## 案例一 GitHub Trending每日推送

通过定时任务，每天定时获取GitHub Trending数据，并通过邮件发送给指定用户。
该案例可以推广至其他信息源，如RSS等，以及其他通知渠道。

<n8n-workflow src='workflows/c06/github-trending.json' />

## 案例二 GitHub Issue通知

通过监听GitHub Issue事件，当有新Issue创建时，通过飞书机器人发送通知。

<n8n-workflow src='workflows/c06/github-issue-notify.json' />
