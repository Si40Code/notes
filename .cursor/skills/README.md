# Skills (for Cursor testing)

这个目录用来放“技能包”示例，方便你在 **Cursor Chat / Agent** 里测试“按需读取一份 SOP，然后严格按 SOP 执行”的效果。

说明：

- 目前 Cursor 并不原生实现 Anthropic 的“Agent Skills 标准加载机制”（比如自动的渐进式披露/元数据注册）。
- 但你可以用同样的结构（`skills/<skill-name>/SKILL.md` + `examples/`）来模拟：在对话里要求 Agent 先读 `SKILL.md`，再执行任务。

目录约定：

- `skills/<skill-name>/SKILL.md`：技能主文档（SOP / checklist / 边界条件）
- `skills/<skill-name>/examples/`：示例、模板、参考资料（可选）

