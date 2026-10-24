"""Rakentaa pelin omat erikoisesineet ja vie ne tiedostoon public/models/custom_props.glb.

Aja projektin juuresta:  npm run model   (ajaa myös build_room.py:n)

Esineet, joita valmiista mallikirjastoista ei löydy: puhelinvastaaja, kassakaappi,
mapit, paperisilppuri ja roskakori. Paperit ja tekstit (kuitit, laput, mappien
selkämykset) tehdään three.js-puolella tiedostossa src/paper.js.
Mitat ja koordinaatit kuten build_room.py:ssä (three.js, metrit, Y ylös).
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_room import MATERIALS, METALS, ROOT, Part, export  # noqa: E402

OUT = os.path.join(ROOT, "public", "models", "custom_props.glb")

MATERIALS.update({
    "plastic_black": (0.02, 0.02, 0.02),
    "plastic_grey": (0.25, 0.25, 0.25),
    "led_red": (0.8, 0.05, 0.03),
    "steel_dark": (0.12, 0.12, 0.13),
    "chrome": (0.8, 0.8, 0.8),
    "binder_blue": (0.08, 0.15, 0.35),
    "binder_red": (0.45, 0.06, 0.05),
    "paper": (0.9, 0.9, 0.86),
})
METALS.update({"steel_dark": 0.45, "chrome": 0.15})

SIDEBOARD_TOP = 0.85
SHELF_BASE = 0.1
SHELF_1 = 0.1 + 2.11 / 5 + 0.015


def answering_machine():
    """Puhelinvastaaja sivupöydällä, etupuoli kohti huonetta (-z)."""
    p = Part("answering_machine")
    x0, x1, z0, z1, y = 0.42, 0.68, 1.62, 1.82, SIDEBOARD_TOP
    p.box("plastic_black", x0, x1, y, y + 0.045, z0, z1)
    # loivasti etuviistoon kallistuva kansi
    p.box("plastic_black", x0 + 0.005, x1 - 0.005, y + 0.04, y + 0.06, z0 + 0.01, z1 - 0.01,
          rot_x=math.radians(-6))
    # kasettiluukku
    p.box("plastic_grey", x0 + 0.13, x1 - 0.02, y + 0.06, y + 0.066, z0 + 0.06, z1 - 0.04)
    # näppäimet kahdessa rivissä
    for i in range(4):
        for j in range(2):
            bx = x0 + 0.02 + i * 0.026
            bz = z0 + 0.03 + j * 0.03
            p.box("plastic_grey", bx, bx + 0.018, y + 0.055, y + 0.066, bz, bz + 0.018)
    # punainen merkkivalo: "3 uutta viestiä"
    p.box("led_red", x1 - 0.035, x1 - 0.02, y + 0.058, y + 0.068, z0 + 0.025, z0 + 0.035)
    # luuri vasemmalla
    p.box("plastic_black", x0 - 0.065, x0 - 0.01, y, y + 0.045, z0 + 0.0, z1)
    p.box("plastic_black", x0 - 0.06, x0 - 0.015, y + 0.04, y + 0.07, z0 + 0.0, z0 + 0.05)
    p.box("plastic_black", x0 - 0.06, x0 - 0.015, y + 0.04, y + 0.07, z1 - 0.05, z1)
    p.build(bevel=0.004)


def safe():
    """Pieni kassakaappi kirjahyllyn alimmalla tasolla, ovi kohti huonetta (+x)."""
    p = Part("safe")
    x0, x1, y0, y1, z0, z1 = -2.44, -2.16, SHELF_BASE, 0.42, -0.6, -0.22
    p.box("steel_dark", x0, x1, y0, y1, z0, z1)
    # ovi hieman runkoa ulompana, ja sen ympärillä sauma
    p.box("steel_dark", x1, x1 + 0.012, y0 + 0.02, y1 - 0.02, z0 + 0.02, z1 - 0.02)
    # numerolukko ja kahva
    p.cylinder_x("chrome", 0.29, -0.36, x1 + 0.012, x1 + 0.03, 0.032)
    p.cylinder_x("plastic_black", 0.29, -0.36, x1 + 0.03, x1 + 0.034, 0.024)
    p.box("chrome", x1 + 0.012, x1 + 0.03, 0.2, 0.215, -0.33, -0.25)
    p.box("chrome", x1 + 0.012, x1 + 0.045, 0.195, 0.22, -0.26, -0.24)
    # saranat vasemmalla
    for y in (y0 + 0.06, y1 - 0.08):
        p.box("chrome", x1, x1 + 0.016, y, y + 0.04, z0 + 0.005, z0 + 0.02)
    p.build(bevel=0.006)


def binders():
    """Kolme mappia kirjahyllyn alemmalla tasolla, selkämykset kohti huonetta (+x)."""
    specs = [("binder_1", "binder_blue", 0.10), ("binder_2", "binder_blue", 0.185), ("binder_3", "binder_red", 0.27)]
    for name, mat, z in specs:
        p = Part(name)
        p.box(mat, -2.44, -2.16, SHELF_1, SHELF_1 + 0.32, z, z + 0.075)
        # metallinen sormireikä selkämyksessä
        p.box("chrome", -2.16, -2.155, SHELF_1 + 0.05, SHELF_1 + 0.075, z + 0.02, z + 0.055)
        p.build(bevel=0.004)


def shredder():
    """Paperisilppuri ikkunan vieressä työpöydän vasemmalla puolella."""
    p = Part("shredder")
    x0, x1, z0, z1 = -0.95, -0.6, -1.84, -1.6
    p.box("plastic_grey", x0 + 0.01, x1 - 0.01, 0.0, 0.36, z0 + 0.01, z1 - 0.01)
    p.box("plastic_black", x0, x1, 0.36, 0.44, z0, z1)
    p.box("steel_dark", x0 + 0.04, x1 - 0.04, 0.44, 0.445, -1.73, -1.71)
    # silppusuikaleita roikkuu vielä raosta
    for i in range(6):
        sx = x0 + 0.07 + i * 0.035
        p.box("paper", sx, sx + 0.01, 0.44, 0.47 + (i % 3) * 0.015, -1.725, -1.722,
              rot_y=math.radians((i - 3) * 4))
    p.build(bevel=0.005)

    b = Part("waste_bin")
    b.cylinder("steel_dark", -1.2, -1.72, 0.0, 0.34, 0.13, 0.15, segments=40)
    b.cylinder("paper", -1.2, -1.72, 0.27, 0.3, 0.12, 0.12, segments=12)
    b.build()


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    answering_machine()
    safe()
    binders()
    shredder()
    export(OUT)


main()
