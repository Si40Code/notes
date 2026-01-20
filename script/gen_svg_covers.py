#!/usr/bin/env python3
"""
批量为所有文章生成 SVG 封面图

Usage:
  python3 script/gen_svg_covers.py
  python3 script/gen_svg_covers.py --pattern new  # 使用新的图案
"""

import argparse
import os
import re
from pathlib import Path

# SVG 图案模板
SVG_PATTERNS = {
    "default": """<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='60' height='30' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(240,6.7%,17.6%,1)'/><path d='M1-6.5v13h28v-13H1zm15 15v13h28v-13H16zm-15 15v13h28v-13H1z'  stroke-width='1' stroke='none' fill='hsla(47,80.9%,61%,1)'/><path d='M31-6.5v13h28v-13H31zm-45 15v13h28v-13h-28zm60 0v13h28v-13H46zm-15 15v13h28v-13H31z'  stroke-width='1' stroke='none' fill='hsla(4.1,89.6%,58.4%,1)'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(#a)'/></svg>""",
    
    "new": """<svg xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" width="30" height="60" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M9.27 0 0 6.48v23.49l15 10V60h5.16L30 53.46V29.97L15 19.96V0Zm5.83 0L30 9.9V6.48L20.26 0ZM15 23.4l9.9 6.57-9.9 6.58-9.9-6.58ZM0 50.1v3.36l9.22 6.48.1.06h5.6l-.1-.06z"/><path fill="#f44034" d="M0 0v3.4L5 0zm24.48 0L30 3.4V0zM15 26.2l-5.68 3.77L15 33.73l5.68-3.76Zm15 30.2L24.48 60H30Zm-30 0V60h5z"/></pattern></defs><rect width="800%" height="800%" fill="url(#a)"/></svg>"""
}


def find_all_posts(content_dir: str) -> list[Path]:
    """查找所有文章目录"""
    posts_dir = Path(content_dir) / "posts"
    if not posts_dir.exists():
        return []
    
    posts = []
    for item in posts_dir.iterdir():
        if item.is_dir():
            index_file = item / "index.md"
            if index_file.exists():
                posts.append(item)
    return sorted(posts)


def update_front_matter(file_path: Path, cover_name: str) -> bool:
    """更新 front matter 中的 cover 字段"""
    try:
        content = file_path.read_text(encoding="utf-8")
        
        # 检查是否已经有 cover 字段
        cover_pattern = r"^cover:\s*.*$"
        if re.search(cover_pattern, content, re.MULTILINE):
            # 替换现有的 cover
            new_content = re.sub(
                cover_pattern,
                f"cover: {cover_name}",
                content,
                flags=re.MULTILINE
            )
        else:
            # 在 front matter 中添加 cover（在 draft 或 tags 之后）
            # 查找 front matter 结束位置
            front_matter_end = content.find("---\n", 4)  # 跳过第一个 ---
            if front_matter_end == -1:
                return False
            
            # 在 front matter 末尾添加 cover
            insert_pos = front_matter_end
            new_content = content[:insert_pos] + f"cover: {cover_name}\n" + content[insert_pos:]
        
        if new_content != content:
            file_path.write_text(new_content, encoding="utf-8")
            return True
    except Exception as e:
        print(f"  ❌ 更新 front matter 失败: {e}")
        return False
    return False


def generate_svg_cover(post_dir: Path, svg_content: str, cover_name: str = "cover.svg") -> bool:
    """生成 SVG 封面文件"""
    cover_path = post_dir / cover_name
    try:
        cover_path.write_text(svg_content, encoding="utf-8")
        return True
    except Exception as e:
        print(f"  ❌ 生成 SVG 失败: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="批量为所有文章生成 SVG 封面图")
    parser.add_argument(
        "--pattern",
        choices=list(SVG_PATTERNS.keys()),
        default="new",
        help="选择 SVG 图案样式"
    )
    parser.add_argument(
        "--content-dir",
        default="content",
        help="内容目录路径（默认: content）"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅显示将要执行的操作，不实际修改文件"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="即使已存在 cover.svg 也覆盖"
    )
    args = parser.parse_args()
    
    # 获取工作目录
    script_dir = Path(__file__).parent
    workspace_root = script_dir.parent
    content_dir = workspace_root / args.content_dir
    
    if not content_dir.exists():
        print(f"❌ 内容目录不存在: {content_dir}")
        return 1
    
    # 获取 SVG 内容
    svg_content = SVG_PATTERNS[args.pattern]
    cover_name = "cover.svg"
    
    # 查找所有文章
    posts = find_all_posts(str(content_dir))
    if not posts:
        print("❌ 未找到任何文章")
        return 1
    
    print(f"📝 找到 {len(posts)} 篇文章")
    print(f"🎨 使用图案样式: {args.pattern}")
    if args.dry_run:
        print("🔍 预览模式（不会实际修改文件）")
    print()
    
    updated = 0
    skipped = 0
    errors = 0
    
    for post_dir in posts:
        post_name = post_dir.name
        index_file = post_dir / "index.md"
        cover_path = post_dir / cover_name
        
        print(f"📄 {post_name}")
        
        # 检查是否已存在
        if cover_path.exists() and not args.force:
            print(f"  ⏭️  已存在 {cover_name}，跳过（使用 --force 强制覆盖）")
            skipped += 1
            continue
        
        if args.dry_run:
            print(f"  ✨ 将生成: {cover_name}")
            print(f"  ✨ 将更新: index.md")
            updated += 1
        else:
            # 生成 SVG
            if generate_svg_cover(post_dir, svg_content, cover_name):
                print(f"  ✅ 已生成: {cover_name}")
            else:
                print(f"  ❌ 生成失败")
                errors += 1
                continue
            
            # 更新 front matter
            if update_front_matter(index_file, cover_name):
                print(f"  ✅ 已更新: index.md")
                updated += 1
            else:
                print(f"  ⚠️  front matter 未更新（可能已存在相同值）")
    
    print()
    print("=" * 50)
    print(f"✅ 完成: {updated} 篇已更新, {skipped} 篇已跳过, {errors} 个错误")
    
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
