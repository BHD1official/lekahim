"""
בונה מחדש את js/logos-data.js מתוך התמונות בתיקייה assets/images.
להריץ אחרי החלפת תמונת לוגו (Word משתמש בנתונים האלה):

    python3 tools/build_logos.py          # רק בונה מחדש את logos-data.js
    python3 tools/build_logos.py --trim   # קודם גוזם שוליים ריקים מהתמונות (מומלץ אם הלוגו נראה קטן)

מה עושה --trim לכל תמונה (הקובץ נשמר במקומו, עותק מקורי נשמר ב-assets/images/_originals):
  1. תמונה בלי שקיפות שהרקע שלה שחור או לבן -> הרקע החיצוני הופך לשקוף
  2. גוזם את השוליים הריקים סביב הלוגו
  3. משלים לריבוע שקוף כדי שהצורה לא תתעוות, ומקטין תמונות גדולות מ-400 פיקסלים

דורש: pip install pillow numpy
"""
import base64, json, re, sys, shutil, pathlib
from collections import deque

root = pathlib.Path(__file__).resolve().parent.parent
img_dir = root / "assets" / "images"
config = (root / "js" / "config.js").read_text(encoding="utf-8")

block = re.search(r"const LOGO_FILES = \{(.*?)\};", config, re.S).group(1)
pairs = re.findall(r"'([^']+)'\s*:\s*'([^']+)'", block)


MAX_SIDE = 400  # גודל מקסימלי של תמונת לוגו בפיקסלים


def trim(path):
    from PIL import Image
    import numpy as np

    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    h, w = a.shape[:2]
    alpha = a[..., 3]

    # 1. תמונה אטומה עם רקע אחיד (שחור/לבן) בפינות -> הופכים את הרקע החיצוני לשקוף
    if (alpha > 250).mean() > 0.98:
        corners = [a[0, 0, :3], a[0, w - 1, :3], a[h - 1, 0, :3], a[h - 1, w - 1, :3]]
        c = corners[0].astype(int)
        same = all(abs(x.astype(int) - c).max() < 12 for x in corners)
        if same and (c.max() < 40 or c.min() > 215):
            close = (np.abs(a[..., :3].astype(int) - c).max(axis=2) < 40)
            bg = np.zeros((h, w), bool)
            q = deque()
            for x in range(w):
                for y in (0, h - 1):
                    if close[y, x] and not bg[y, x]:
                        bg[y, x] = True; q.append((y, x))
            for y in range(h):
                for x in (0, w - 1):
                    if close[y, x] and not bg[y, x]:
                        bg[y, x] = True; q.append((y, x))
            while q:  # מילוי מהשוליים פנימה - צבע דומה בתוך הלוגו לא נפגע
                y, x = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and close[ny, nx] and not bg[ny, nx]:
                        bg[ny, nx] = True; q.append((ny, nx))
            a[bg, 3] = 0
            alpha = a[..., 3]

    # 2. גוזמים שוליים שקופים
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0:
        return "ללא שינוי (תמונה ריקה)"
    im = Image.fromarray(a).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    # 3. ריבוע שקוף
    side = max(im.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
    if side > MAX_SIDE:  # תמונה ענקית -> מקטינים (מספיק לדף ול-Word, וקובץ קטן יותר)
        sq = sq.resize((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    sq.save(path)
    return f"{w}x{h} -> {side}x{side}"


if "--trim" in sys.argv:
    backup = img_dir / "_originals"
    backup.mkdir(exist_ok=True)
    for _, filename in pairs:
        src = img_dir / filename
        if not (backup / filename).exists():
            shutil.copy(src, backup / filename)
        print(filename, trim(src))

data = {}
for name, filename in pairs:
    data[name] = base64.b64encode((img_dir / filename).read_bytes()).decode()

header = '/* נתוני הלוגואים בפורמט base64 - משמש רק ליצירת קובץ ה-Word. נוצר אוטומטית ע"י tools/build_logos.py, לא לערוך ידנית */\n\n'
(root / "js" / "logos-data.js").write_text(
    header + "const LOGOS = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
print("נוצר js/logos-data.js עם", len(data), "לוגואים")
