# Prompt 示例：让 Cursor Agent 使用技能包检查文章

把下面这段直接粘贴到 Cursor Chat（建议用 Agent 模式），并按需替换文件路径：

---

请按以下流程工作：

1) 先阅读并遵循 `skills/hugo-post-sanity/SKILL.md`（把它当作唯一操作手册）。
2) 再检查这篇文章：`content/posts/agent-skills/index.md`。
3) 输出：
   - Must fix / Should fix / Nice to have 三组问题清单
   - 如果存在 Must fix，请直接给出最小修改 diff（只改必要内容）

约束：

- 不要重写全文，不要改变文章主旨与写作风格
- 不要修改 `public/` 下任何文件

---

