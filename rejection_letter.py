#!/usr/bin/env python3
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math

# Register fonts
pdfmetrics.registerFont(TTFont('FreeSerif', '/usr/share/fonts/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerifBold', '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf'))

def ar(text):
    """Reshape and apply bidi to Arabic text."""
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

def draw_stamp(c, cx, cy, radius=55):
    """Draw a circular official stamp."""
    # Outer circle
    c.setStrokeColor(colors.HexColor('#1a3a6b'))
    c.setLineWidth(3)
    c.circle(cx, cy, radius, stroke=1, fill=0)

    # Inner circle
    c.setLineWidth(1.5)
    c.circle(cx, cy, radius - 8, stroke=1, fill=0)

    # Fill center lightly
    c.setFillColor(colors.HexColor('#eef2fa'))
    c.circle(cx, cy, radius - 9, stroke=0, fill=1)

    # Draw text along the top arc
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.setFont('FreeSerifBold', 7)

    top_text = ar('مديرية شؤون شيم')
    angle_start = 160
    angle_end = 20
    arc_r = radius - 4

    # Place curved top text manually (approximate)
    chars = list(top_text)
    n = len(chars)
    angles = [math.radians(angle_start - i * (angle_start - angle_end) / max(n - 1, 1)) for i in range(n)]

    for i, ch in enumerate(chars):
        angle = angles[i]
        x = cx + arc_r * math.cos(angle)
        y = cy + arc_r * math.sin(angle)
        c.saveState()
        c.translate(x, y)
        c.rotate(math.degrees(angle) - 90)
        c.drawCentredString(0, 0, ch)
        c.restoreState()

    # Bottom arc text
    bottom_text = ar('الجمهورية الجزائرية')
    chars2 = list(bottom_text)
    n2 = len(chars2)
    angle_start2 = -160
    angle_end2 = -20

    angles2 = [math.radians(angle_start2 - i * (angle_start2 - angle_end2) / max(n2 - 1, 1)) for i in range(n2)]

    for i, ch in enumerate(chars2):
        angle = angles2[i]
        x = cx + arc_r * math.cos(angle)
        y = cy + arc_r * math.sin(angle)
        c.saveState()
        c.translate(x, y)
        c.rotate(math.degrees(angle) + 90)
        c.drawCentredString(0, 0, ch)
        c.restoreState()

    # Center emblem text
    c.setFont('FreeSerifBold', 6.5)
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.drawCentredString(cx, cy + 7, ar('ختم رسمي'))
    c.setFont('FreeSerif', 6)
    c.drawCentredString(cx, cy - 5, ar('2026'))

    # Star decorations on sides
    c.setFont('FreeSerif', 10)
    c.drawCentredString(cx - radius + 14, cy - 3, '★')
    c.drawCentredString(cx + radius - 14, cy - 3, '★')


def draw_letterhead(c, width, height):
    """Draw professional letterhead."""
    # Top navy bar
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.rect(0, height - 2.5*cm, width, 2.5*cm, stroke=0, fill=1)

    # Gold accent line
    c.setFillColor(colors.HexColor('#c9a84c'))
    c.rect(0, height - 2.5*cm - 0.4*cm, width, 0.4*cm, stroke=0, fill=1)

    # Ministry name in header
    c.setFillColor(colors.white)
    c.setFont('FreeSerifBold', 17)
    c.drawCentredString(width / 2, height - 1.3*cm, ar('مديرية شؤون شيم'))

    c.setFont('FreeSerif', 10)
    c.drawCentredString(width / 2, height - 2.1*cm, ar('الجمهورية الجزائرية الديمقراطية الشعبية'))

    # Bottom thin navy bar
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.rect(0, 0, width, 1*cm, stroke=0, fill=1)

    # Footer text
    c.setFillColor(colors.white)
    c.setFont('FreeSerif', 7.5)
    c.drawCentredString(width / 2, 0.35*cm, ar('شارع الاستقلال، الجزائر العاصمة  |  هاتف: 021-000-000  |  البريد الإلكتروني: info@shim.dz'))


def create_rejection_letter():
    output_path = '/home/user/-/rejection_letter.pdf'
    width, height = A4  # 595.27 x 841.89 points

    c = canvas.Canvas(output_path, pagesize=A4)
    c.setTitle('خطاب رفض توظيف')

    # Letterhead
    draw_letterhead(c, width, height)

    # Reference and date block (top right)
    margin_right = width - 2*cm
    top_y = height - 3.5*cm

    c.setFont('FreeSerif', 9.5)
    c.setFillColor(colors.HexColor('#555555'))

    ref_y = top_y - 0.5*cm
    c.setFont('FreeSerifBold', 9.5)
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.drawRightString(margin_right, ref_y, ar('الرقم المرجعي:  ش.م / 2026 / 0847'))

    date_y = ref_y - 0.6*cm
    c.setFont('FreeSerif', 9.5)
    c.setFillColor(colors.HexColor('#333333'))
    c.drawRightString(margin_right, date_y, ar('التاريخ:  17 يونيو 2026'))

    # Divider line
    c.setStrokeColor(colors.HexColor('#c9a84c'))
    c.setLineWidth(1.5)
    divider_y = date_y - 0.7*cm
    c.line(2*cm, divider_y, width - 2*cm, divider_y)

    # Subject / Title
    subject_y = divider_y - 1.2*cm
    c.setFont('FreeSerifBold', 14)
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.drawCentredString(width / 2, subject_y, ar('خطاب إخطار بنتيجة طلب التوظيف'))

    # Underline title
    c.setStrokeColor(colors.HexColor('#1a3a6b'))
    c.setLineWidth(1)
    title_width = 280
    c.line(width/2 - title_width/2, subject_y - 5, width/2 + title_width/2, subject_y - 5)

    # Addressee
    addr_y = subject_y - 1.3*cm
    c.setFont('FreeSerifBold', 11)
    c.setFillColor(colors.HexColor('#333333'))
    c.drawRightString(margin_right, addr_y, ar('السيد / كريم كراميل'))

    c.setFont('FreeSerif', 10)
    c.setFillColor(colors.HexColor('#555555'))
    c.drawRightString(margin_right, addr_y - 0.55*cm, ar('المتقدم لوظيفة: موظف إداري'))
    c.drawRightString(margin_right, addr_y - 1.1*cm, ar('تحت رقم الطلب:  2026-T-0412'))

    # Body text lines
    line_height = 0.72*cm
    body_y = addr_y - 2.1*cm
    right_margin = width - 2*cm
    left_margin = 2*cm
    font_size = 11

    def draw_ar_line(text, y, bold=False, center=False, size=None):
        fs = size if size else font_size
        fn = 'FreeSerifBold' if bold else 'FreeSerif'
        c.setFont(fn, fs)
        c.setFillColor(colors.HexColor('#222222'))
        rendered = ar(text)
        if center:
            c.drawCentredString(width / 2, y, rendered)
        else:
            c.drawRightString(right_margin, y, rendered)

    draw_ar_line('تحية طيبة وبعد،', body_y)
    body_y -= line_height * 1.3

    draw_ar_line('يسعدنا شكركم على اهتمامكم بالانضمام إلى أسرة مديرية شؤون شيم، وعلى الوقت', body_y)
    body_y -= line_height
    draw_ar_line('والجهد الذي بذلتموه في استيفاء إجراءات التقديم والمشاركة في مراحل الاختيار.', body_y)
    body_y -= line_height * 1.3

    draw_ar_line('يشرفنا إحاطتكم علمًا بأنه وبعد مراجعة دقيقة لجميع الطلبات المقدمة وإجراء', body_y)
    body_y -= line_height
    draw_ar_line('المقابلات اللازمة، فقد آلت نتيجة الاختيار إلى مرشحين آخرين تتوافق مؤهلاتهم', body_y)
    body_y -= line_height
    draw_ar_line('بشكل أوثق مع متطلبات الوظيفة في المرحلة الراهنة.', body_y)
    body_y -= line_height * 1.3

    draw_ar_line('وعليه، يؤسفنا إبلاغكم بعدم إمكانية قبول طلبكم هذه المرة.', body_y, bold=True)
    body_y -= line_height * 1.3

    draw_ar_line('إننا نُقدّر عاليًا مستواكم ومؤهلاتكم المهنية، ونتمنى لكم التوفيق والنجاح', body_y)
    body_y -= line_height
    draw_ar_line('في مسيرتكم المهنية. وسيبقى ملفكم محفوظًا لدينا لفترة ستة أشهر، وسنتواصل', body_y)
    body_y -= line_height
    draw_ar_line('معكم في حال توفّر فرص مناسبة مستقبلًا.', body_y)
    body_y -= line_height * 1.8

    draw_ar_line('وتفضلوا بقبول فائق الاحترام والتقدير،', body_y)
    body_y -= line_height * 1.5

    # Signature block
    sig_x = width - 5*cm
    sig_y = body_y

    c.setFont('FreeSerifBold', 10.5)
    c.setFillColor(colors.HexColor('#1a3a6b'))
    c.drawCentredString(sig_x, sig_y, ar('مدير شؤون الموارد البشرية'))
    c.setFont('FreeSerif', 10)
    c.setFillColor(colors.HexColor('#333333'))
    c.drawCentredString(sig_x, sig_y - 0.55*cm, ar('مديرية شؤون شيم'))

    # Signature line
    c.setStrokeColor(colors.HexColor('#1a3a6b'))
    c.setLineWidth(1)
    c.line(sig_x - 2.5*cm, sig_y - 1.4*cm, sig_x + 2.5*cm, sig_y - 1.4*cm)
    c.setFont('FreeSerif', 8.5)
    c.setFillColor(colors.HexColor('#666666'))
    c.drawCentredString(sig_x, sig_y - 1.8*cm, ar('التوقيع والختم الرسمي'))

    # Draw stamp near signature
    stamp_cx = sig_x - 1*cm
    stamp_cy = sig_y - 3.5*cm
    draw_stamp(c, stamp_cx, stamp_cy, radius=52)

    c.save()
    print(f'PDF created: {output_path}')


if __name__ == '__main__':
    create_rejection_letter()
