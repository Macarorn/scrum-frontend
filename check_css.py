from pathlib import Path
text = Path("src/styles/Epicas.css").read_text(encoding="utf-8")
open_braces = 0
for i, ch in enumerate(text, 1):
    if ch == '{':
        open_braces += 1
    elif ch == '}':
        open_braces -= 1
    if open_braces < 0:
        print('Unbalanced close brace at', i)
        break
print('brace balance', open_braces)
for idx, line in enumerate(text.splitlines(), 1):
    if '@keyframes editableUnlock' in line:
        print('Found keyframes at line', idx)
