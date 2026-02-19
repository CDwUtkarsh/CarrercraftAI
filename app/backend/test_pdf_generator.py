from reportlab.pdfgen import canvas
from pathlib import Path

p = Path(__file__).parent / 'test_resume.pdf'

c = canvas.Canvas(str(p))
text = c.beginText(40, 800)
text.textLine('John Doe')
text.textLine('Software Engineer')
text.textLine('')
text.textLine('Experience:')
text.textLine('- Developed web applications using Python and React')
text.textLine('- Led a team of 5 developers')
text.textLine('- Improved application performance by 40%')
c.drawText(text)
c.save()
print('Wrote', p)
