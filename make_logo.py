import base64
import urllib.parse

svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="40" r="18" fill="#b31b1b" />
  <path d="M70,80 C80,60 120,60 130,80 L165,45 M130,80 L140,130 L170,180 M100,100 L75,150 M70,80 L35,45 M75,150 L40,120" stroke="#b31b1b" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>"""

encoded = urllib.parse.quote(svg)
data_uri = f"data:image/svg+xml;charset=utf-8,{encoded}"
print(data_uri)
