"""Build the inline SVG world map used on talks.html.

Run once after adding a talk in a new city:
    python tools/make_talks_map.py
It rewrites the block between <!--MAP:START--> and <!--MAP:END--> in talks.html.
Needs geopandas and the Natural Earth 110m land shapefile (path below).
"""
import json, re, sys
from pathlib import Path
import geopandas as gpd
from pyproj import Transformer
from shapely.geometry import box

LAND = "/usr/share/magics/110m/ne_110m_land.shp"
ROOT = Path(__file__).resolve().parents[1]

# City, lon, lat, label shown on hover, number of talks there (presenting or co-authored)
CITIES = [
    ("Anchorage, AK", -149.90, 61.22, "ASCE-EWRI Congress 2025", 2),
    ("San Francisco, CA", -122.42, 37.77, "AGU Fall Meeting 2023", 1),
    ("Honolulu, HI", -157.86, 21.31, "AGU Chapman Conference 2024", 2),
    ("Houston, TX", -95.37, 29.76, "AMS Annual Meeting 2026", 1),
    ("New Orleans, LA", -90.07, 29.95, "AGU Fall Meeting 2025", 6),
    ("Mobile, AL", -88.04, 30.69, "ASCE-EWRI Congress 2026", 1),
    ("Vicksburg, MS", -90.88, 32.35, "ERDC RD26 Workshop 2026", 1),
    ("Milwaukee, WI", -87.91, 43.04, "ASCE-EWRI Congress 2024", 2),
    ("Washington, DC", -77.04, 38.91, "AGU Fall Meeting 2024", 6),
    ("Baltimore, MD", -76.61, 39.29, "AMS Annual Meeting 2024", 1),
    ("Amsterdam, Netherlands", 4.90, 52.37, "Natural Hazards and Risks Conference 2024", 1),
    ("Vienna, Austria", 16.37, 48.21, "EGU General Assembly 2024", 1),
    ("Marrakech, Morocco", -7.99, 31.63, "XIX World Water Congress 2025", 1),
    ("Kathmandu, Nepal", 85.32, 27.72, "GeoMandu International Conference 2024", 1),
]

CRS = "EPSG:8857"  # Equal Earth
land = gpd.read_file(LAND).clip(box(-180, -58, 180, 84)).to_crs(CRS)
land["geometry"] = land.geometry.simplify(9000)
minx, miny, maxx, maxy = land.total_bounds
W = 1000.0
s = W / (maxx - minx)
H = (maxy - miny) * s
tf = Transformer.from_crs("EPSG:4326", CRS, always_xy=True)

def xy(x, y):
    return (x - minx) * s, (maxy - y) * s

def ring(coords):
    pts = [xy(x, y) for x, y in coords]
    return "M" + "L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + "Z"

parts = []
for g in land.geometry:
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    for p in polys:
        parts.append(ring(p.exterior.coords))
d = "".join(parts)

dots = []
# larger dots first so the small ones drawn on top stay reachable in the Gulf Coast cluster
for name, lon, lat, label, n in sorted(CITIES, key=lambda c: -c[4]):
    px, py = xy(*tf.transform(lon, lat))
    r = 3.2 + 1.1 * (n - 1) ** 0.5 * 2
    dots.append(
        f'<g class="map-city" tabindex="0" data-city="{name}" data-label="{label}" data-n="{n}">'
        f'<circle class="map-halo" cx="{px:.1f}" cy="{py:.1f}" r="{r + 6:.1f}"/>'
        f'<circle class="map-dot" cx="{px:.1f}" cy="{py:.1f}" r="{r:.1f}"/>'
        f"<title>{name}: {label}</title></g>"
    )

svg = (
    f'<svg class="talk-map" viewBox="0 0 {W:.0f} {H:.0f}" role="img" '
    f'aria-label="World map of the {len(CITIES)} cities where this work has been presented">'
    f'<path class="map-land" d="{d}"/>' + "".join(dots) + "</svg>"
)

page = ROOT / "talks.html"
html = page.read_text()
new = re.sub(r"<!--MAP:START-->.*?<!--MAP:END-->", "<!--MAP:START-->" + svg + "<!--MAP:END-->", html, flags=re.S)
if new == html and "<!--MAP:START-->" not in html:
    sys.exit("talks.html has no <!--MAP:START--> marker")
page.write_text(new)
print(f"map written: {len(d) // 1024} KB path, {len(CITIES)} cities, viewBox {W:.0f}x{H:.0f}")
