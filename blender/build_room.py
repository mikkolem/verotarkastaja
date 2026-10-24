"""Rakentaa toimitusjohtajan työhuoneen ja vie sen tiedostoon public/models/room.glb.

Aja projektin juuresta:  npm run model

Kaikki mitat annetaan three.js:n koordinaatistossa (metreinä, Y ylöspäin),
ja ne muunnetaan Blenderin Z-ylös-koordinaatistoon vasta verteksitasolla.
Huone: x = -2.5 … 2.5 (leveys), z = -2 … 2 (syvyys), y = 0 … 2.8 (korkeus).
Ikkuna on pohjoisseinällä (z = -2), ovi eteläseinällä (z = +2).
"""

import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "models", "room.glb")

W, D, H = 5.0, 4.0, 2.8          # huoneen sisämitat
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
T = 0.15                         # seinän paksuus

WIN_X0, WIN_X1, WIN_Y0, WIN_Y1 = -0.2, 1.4, 0.9, 2.3
DOOR_X0, DOOR_X1, DOOR_Y1 = -1.65, -0.75, 2.1
WAINSCOT = 0.85                  # puupaneelin korkeus

# Materiaalit: nimi -> perusväri. three.js korvaa nämä nimen perusteella
# omilla materiaaleillaan, mutta värit näkyvät myös pelkässä GLB:ssä.
MATERIALS = {
    "wall_paint": (0.20, 0.27, 0.21),
    "wood_panel": (0.23, 0.12, 0.06),
    "floor_parquet": (0.45, 0.30, 0.17),
    "ceiling": (0.85, 0.83, 0.78),
    "window_frame": (0.85, 0.85, 0.82),
    "glass": (0.8, 0.9, 1.0),
    "blind": (0.88, 0.86, 0.80),
    "brass": (0.70, 0.55, 0.30),
    "desk_wood": (0.30, 0.13, 0.07),
    "leather": (0.20, 0.10, 0.06),
    "terracotta": (0.60, 0.30, 0.18),
    "drawer_inner": (0.55, 0.40, 0.25),
    "wall_hall": (0.62, 0.60, 0.55),
    "plastic_black": (0.02, 0.02, 0.02),
}
# metalliset materiaalit ja niiden karheus
METALS = {"brass": 0.3}


def to_blender(v):
    # three.js (x, y, z) -> Blender (x, -z, y); glTF-vienti tekee käänteisen.
    return Vector((v[0], -v[2], v[1]))


class Part:
    """Yksi vietävä objekti, johon kerätään laatikoita eri materiaaleilla."""

    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.mats = []

    def mat_index(self, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        return self.mats.index(mat)

    def _add(self, geom_verts, mat):
        idx = self.mat_index(mat)
        faces = {f for v in geom_verts for f in v.link_faces}
        for f in faces:
            f.material_index = idx
        return faces

    def box(self, mat, x0, x1, y0, y1, z0, z1, rot_x=0.0, rot_y=0.0):
        """Akselin suuntainen laatikko min/max-rajoilla (valinnainen kierto keskipisteen ympäri)."""
        cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
        sx, sy, sz = x1 - x0, y1 - y0, z1 - z0
        res = bmesh.ops.create_cube(self.bm, size=1.0)
        rot = Matrix.Rotation(rot_y, 3, "Y") @ Matrix.Rotation(rot_x, 3, "X")
        for v in res["verts"]:
            local = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz))
            local = rot @ local
            v.co = to_blender((cx + local.x, cy + local.y, cz + local.z))
        self._add(res["verts"], mat)

    def cylinder(self, mat, cx, cz, y0, y1, r0, r1=None, segments=32):
        """Pystysuora sylinteri tai kartio (r1 = yläsäde)."""
        r1 = r0 if r1 is None else r1
        res = bmesh.ops.create_cone(
            self.bm, cap_ends=True, segments=segments,
            radius1=r0, radius2=r1, depth=y1 - y0,
        )
        cy = (y0 + y1) / 2
        for v in res["verts"]:
            # create_cone tekee kartion Blenderin Z-akselin suuntaan.
            v.co = to_blender((cx + v.co.x, cy + v.co.z, cz - v.co.y))
        self._add(res["verts"], mat)

    def cylinder_x(self, mat, cy, cz, x0, x1, r, segments=32):
        """Vaakasuora sylinteri x-akselin suuntaan (esim. kassakaapin nuppi)."""
        res = bmesh.ops.create_cone(
            self.bm, cap_ends=True, segments=segments, radius1=r, radius2=r, depth=x1 - x0,
        )
        cx = (x0 + x1) / 2
        for v in res["verts"]:
            v.co = to_blender((cx + v.co.z, cy + v.co.x, cz + v.co.y))
        self._add(res["verts"], mat)

    def build(self, bevel=0.0):
        """Luo objektin. bevel > 0 pyöristää terävät reunat (näyttää heti aidommalta)."""
        uv = self.bm.loops.layers.uv.new("UVMap")
        # Laatikkoprojektio maailmankoordinaateista: 1 UV-yksikkö = 1 metri,
        # joten tekstuurit ovat samassa mittakaavassa kaikilla pinnoilla.
        for f in self.bm.faces:
            f.normal_update()
            n = f.normal
            ax = max(range(3), key=lambda i: abs(n[i]))
            for loop in f.loops:
                x, y, z = loop.vert.co
                if ax == 2:      # vaakapinta (Blenderin Z = three.js:n Y)
                    loop[uv].uv = (x, y)
                elif ax == 0:    # x-suuntainen normaali
                    loop[uv].uv = (y, z)
                else:
                    loop[uv].uv = (x, z)
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for m in self.mats:
            mesh.materials.append(material(m))
        obj = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        if bevel > 0:
            mod = obj.modifiers.new("Bevel", "BEVEL")
            mod.width = bevel
            mod.segments = 2
            mod.limit_method = "ANGLE"
        return obj


_mat_cache = {}


def material(name):
    if name not in _mat_cache:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        bsdf = m.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (*MATERIALS[name], 1.0)
        if name in METALS:
            bsdf.inputs["Metallic"].default_value = 1.0
            bsdf.inputs["Roughness"].default_value = METALS[name]
        _mat_cache[name] = m
    return _mat_cache[name]


def panel_run(part, axis, fixed, inward, a0, a1, skip=()):
    """Puupaneloitu seinänosa: pohjalevy, pystylistat, kaiteet ja jalkalista.

    axis: 'x' tai 'z' (seinän suunta), fixed: seinäpinnan koordinaatti,
    inward: +1/-1 kohti huoneen sisäosaa, a0..a1: seinän alue,
    skip: alueet (alku, loppu), joihin ei tehdä paneelia (esim. ovi).
    """
    def slab(s0, s1, y0, y1, d0, d1):
        if s1 <= s0:
            return
        p0, p1 = sorted((fixed + inward * d0, fixed + inward * d1))
        if axis == "x":
            part.box("wood_panel", s0, s1, y0, y1, p0, p1)
        else:
            part.box("wood_panel", p0, p1, y0, y1, s0, s1)

    segments = []
    cur = a0
    for s0, s1 in sorted(skip):
        segments.append((cur, s0))
        cur = s1
    segments.append((cur, a1))

    for s0, s1 in segments:
        if s1 - s0 < 0.01:
            continue
        slab(s0, s1, 0.0, WAINSCOT, 0.0, 0.015)               # pohjalevy
        slab(s0, s1, 0.0, 0.14, 0.0, 0.03)                    # jalkalista
        slab(s0, s1, WAINSCOT - 0.06, WAINSCOT, 0.0, 0.045)   # kaide
        slab(s0, s1, WAINSCOT - 0.10, WAINSCOT - 0.06, 0.0, 0.025)
        slab(s0, s1, 0.14, 0.22, 0.0, 0.025)                  # alakaide
        # pystylistat noin 0.6 m välein
        n = max(1, round((s1 - s0) / 0.6))
        step = (s1 - s0) / n
        for i in range(n + 1):
            c = s0 + i * step
            slab(max(s0, c - 0.04), min(s1, c + 0.04), 0.22, WAINSCOT - 0.10, 0.0, 0.025)


def build_room():
    room = Part("room")
    # lattia ja katto
    room.box("floor_parquet", X0 - T, X1 + T, -0.05, 0.0, Z0 - T, Z1 + T)
    room.box("ceiling", X0 - T, X1 + T, H, H + 0.05, Z0 - T, Z1 + T)

    # itä- ja länsiseinä (kattavat myös nurkat)
    room.box("wall_paint", X0 - T, X0, 0, H, Z0 - T, Z1 + T)
    room.box("wall_paint", X1, X1 + T, 0, H, Z0 - T, Z1 + T)
    # pohjoisseinä ikkuna-aukon ympäriltä
    room.box("wall_paint", X0, WIN_X0, 0, H, Z0 - T, Z0)
    room.box("wall_paint", WIN_X1, X1, 0, H, Z0 - T, Z0)
    room.box("wall_paint", WIN_X0, WIN_X1, 0, WIN_Y0, Z0 - T, Z0)
    room.box("wall_paint", WIN_X0, WIN_X1, WIN_Y1, H, Z0 - T, Z0)
    # eteläseinä oviaukon ympäriltä
    room.box("wall_paint", X0, DOOR_X0, 0, H, Z1, Z1 + T)
    room.box("wall_paint", DOOR_X1, X1, 0, H, Z1, Z1 + T)
    room.box("wall_paint", DOOR_X0, DOOR_X1, DOOR_Y1, H, Z1, Z1 + T)

    # kattolista
    for (x0, x1, z0, z1) in [
        (X0, X1, Z0, Z0 + 0.06), (X0, X1, Z1 - 0.06, Z1),
        (X0, X0 + 0.06, Z0, Z1), (X1 - 0.06, X1, Z0, Z1),
    ]:
        room.box("wood_panel", x0, x1, H - 0.09, H, z0, z1)

    # paneloinnit
    panel_run(room, "x", Z0, +1, X0, X1)
    panel_run(room, "x", Z1, -1, X0, X1, skip=[(DOOR_X0 - 0.08, DOOR_X1 + 0.08)])
    panel_run(room, "z", X0, +1, Z0, Z1)
    panel_run(room, "z", X1, -1, Z0, Z1)
    return room


def build_window():
    win = Part("window")
    f = 0.06
    zf0, zf1 = Z0 - 0.10, Z0 - 0.04
    # karmi aukon reunoilla
    win.box("window_frame", WIN_X0, WIN_X0 + f, WIN_Y0, WIN_Y1, Z0 - T, Z0)
    win.box("window_frame", WIN_X1 - f, WIN_X1, WIN_Y0, WIN_Y1, Z0 - T, Z0)
    win.box("window_frame", WIN_X0, WIN_X1, WIN_Y1 - f, WIN_Y1, Z0 - T, Z0)
    win.box("window_frame", WIN_X0, WIN_X1, WIN_Y0, WIN_Y0 + f, Z0 - T, Z0)
    # välipuitteet
    mx = (WIN_X0 + WIN_X1) / 2
    win.box("window_frame", mx - 0.03, mx + 0.03, WIN_Y0, WIN_Y1, zf0, zf1)
    win.box("window_frame", WIN_X0, WIN_X1, 1.75, 1.80, zf0, zf1)
    # ikkunalauta ja vuorilistat sisäpuolella
    win.box("window_frame", WIN_X0 - 0.1, WIN_X1 + 0.1, WIN_Y0 - 0.03, WIN_Y0, Z0 - 0.04, Z0 + 0.16)
    for x0, x1 in [(WIN_X0 - 0.08, WIN_X0), (WIN_X1, WIN_X1 + 0.08)]:
        win.box("window_frame", x0, x1, WIN_Y0, WIN_Y1 + 0.08, Z0, Z0 + 0.02)
    win.box("window_frame", WIN_X0 - 0.08, WIN_X1 + 0.08, WIN_Y1, WIN_Y1 + 0.08, Z0, Z0 + 0.02)
    win.build()

    glass = Part("glass")
    glass.box("glass", WIN_X0, WIN_X1, WIN_Y0, WIN_Y1, Z0 - 0.075, Z0 - 0.07)
    glass.build()

    blinds = Part("blinds")
    top = WIN_Y1 - 0.02
    blinds.box("blind", WIN_X0 + 0.02, WIN_X1 - 0.02, top - 0.04, top, Z0 - 0.035, Z0 - 0.005)
    y = top - 0.07
    while y > WIN_Y0 + 0.03:
        # lamellit hieman alaspäin kallellaan, jolloin osa auringosta
        # pääsee läpi ja valo siivilöityy raitoina
        blinds.box("blind", WIN_X0 + 0.03, WIN_X1 - 0.03, y - 0.002, y + 0.002,
                   Z0 - 0.055, Z0 - 0.005, rot_x=math.radians(10))
        y -= 0.042
    blinds.box("blind", WIN_X0 + 0.03, WIN_X1 - 0.03, WIN_Y0 + 0.01, WIN_Y0 + 0.03, Z0 - 0.04, Z0 - 0.01)
    blinds.build()


def build_door():
    door = Part("door")
    # vuorilistat
    for x0, x1 in [(DOOR_X0 - 0.09, DOOR_X0), (DOOR_X1, DOOR_X1 + 0.09)]:
        door.box("wood_panel", x0, x1, 0, DOOR_Y1 + 0.09, Z1 - 0.025, Z1)
    door.box("wood_panel", DOOR_X0 - 0.09, DOOR_X1 + 0.09, DOOR_Y1, DOOR_Y1 + 0.09, Z1 - 0.025, Z1)
    # karmi aukon sisällä
    door.box("wood_panel", DOOR_X0, DOOR_X0 + 0.03, 0, DOOR_Y1, Z1, Z1 + T)
    door.box("wood_panel", DOOR_X1 - 0.03, DOOR_X1, 0, DOOR_Y1, Z1, Z1 + T)
    door.box("wood_panel", DOOR_X0, DOOR_X1, DOOR_Y1 - 0.03, DOOR_Y1, Z1, Z1 + T)
    door.build()

    # Ovilevy omana objektinaan: three.js kääntää sen saranan (vasen reuna)
    # ympäri loppukohtauksessa, kun Kalevi palaa.
    slab = Part("door_slab")
    dz0, dz1 = Z1 + 0.04, Z1 + 0.08
    slab.box("desk_wood", DOOR_X0 + 0.03, DOOR_X1 - 0.03, 0.005, DOOR_Y1 - 0.03, dz0, dz1)
    for y0, y1 in [(0.15, 0.95), (1.1, 1.95)]:
        slab.box("desk_wood", DOOR_X0 + 0.14, DOOR_X1 - 0.14, y0, y1, dz0 - 0.012, dz0)
    hx = DOOR_X1 - 0.12
    slab.box("brass", hx - 0.025, hx + 0.025, 0.95, 1.12, dz0 - 0.008, dz0)
    slab.box("brass", hx - 0.13, hx + 0.01, 1.05, 1.07, dz0 - 0.06, dz0 - 0.04)
    slab.box("brass", hx - 0.01, hx + 0.01, 1.05, 1.07, dz0 - 0.06, dz0)
    slab.build(bevel=0.003)

    # Käytävä oven takana (näkyy vain, kun ovi aukeaa)
    hall = Part("hallway")
    hx0, hx1, hz0, hz1 = -2.6, 0.2, Z1 + T, Z1 + T + 2.2
    hall.box("floor_parquet", hx0, hx1, -0.05, 0, hz0, hz1)
    hall.box("ceiling", hx0, hx1, H, H + 0.05, hz0, hz1)
    hall.box("wall_hall", hx0, hx1, 0, H, hz1, hz1 + 0.1)
    hall.box("wall_hall", hx0 - 0.1, hx0, 0, H, hz0, hz1)
    hall.box("wall_hall", hx1, hx1 + 0.1, 0, H, hz0, hz1)
    hall.build()


DRAWER_Y0 = 0.08 + 2 * 0.215     # ylimpien laatikoiden alareuna
DRAWER_BACK = -0.6               # laatikon takaseinä (suljettuna)


def build_drawer(name, px0, px1, z1):
    """Avattava pöytälaatikko omana objektinaan (three.js liu'uttaa sitä +z-suuntaan).

    drawer_a: avaimella aukeava (avaimenreikä), drawer_b: nelinumeroinen numerolukko.
    """
    p = Part(name)
    y0 = DRAWER_Y0
    fz0, fz1 = z1 - 0.03, z1 - 0.012
    ix0, ix1 = px0 + 0.03, px1 - 0.03
    p.box("desk_wood", px0 + 0.02, px1 - 0.02, y0, y0 + 0.19, fz0, fz1)          # etulevy
    p.box("drawer_inner", ix0, ix0 + 0.012, y0 + 0.01, y0 + 0.17, DRAWER_BACK, fz0)  # sivut
    p.box("drawer_inner", ix1 - 0.012, ix1, y0 + 0.01, y0 + 0.17, DRAWER_BACK, fz0)
    p.box("drawer_inner", ix0, ix1, y0 + 0.01, y0 + 0.022, DRAWER_BACK, fz0)          # pohja
    p.box("drawer_inner", ix0, ix1, y0 + 0.01, y0 + 0.17, DRAWER_BACK, DRAWER_BACK + 0.012)
    hx = (px0 + px1) / 2
    p.box("brass", hx - 0.05, hx + 0.05, y0 + 0.085, y0 + 0.105, fz1, fz1 + 0.017)
    if name == "drawer_a":
        p.box("brass", hx - 0.012, hx + 0.012, y0 + 0.135, y0 + 0.165, fz1, fz1 + 0.003)
        p.box("plastic_black", hx - 0.003, hx + 0.003, y0 + 0.14, y0 + 0.158, fz1 + 0.003, fz1 + 0.004)
    else:
        # nelinumeroinen numerolukko
        p.box("brass", hx - 0.05, hx + 0.05, y0 + 0.13, y0 + 0.17, fz1, fz1 + 0.012)
        for i in range(4):
            wx = hx - 0.042 + i * 0.022
            p.box("plastic_black", wx, wx + 0.016, y0 + 0.136, y0 + 0.164, fz1 + 0.012, fz1 + 0.016)
    p.build(bevel=0.003)


def build_furniture():
    # Työpöytä ikkunan edessä. Laatikot pelaajan puolella (etelään, +z),
    # jotta ne näkyvät "Työpöytä"-kuvakulmasta.
    desk = Part("desk")
    cx, cz, w, d = 0.6, -0.6, 1.8, 0.9
    x0, x1, z0, z1 = cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2
    desk.box("desk_wood", x0, x1, 0.74, 0.78, z0, z1)
    desk.box("leather", x0 + 0.35, x1 - 0.35, 0.78, 0.782, z0 + 0.15, z1 - 0.12)
    for name, px0 in (("drawer_a", x0 + 0.03), ("drawer_b", x1 - 0.48)):
        px1 = px0 + 0.45
        # Jalusta on ontto ylimmän laatikon kohdalta, jotta avattu laatikko
        # paljastaa oikean kolon eikä umpinaista puuta.
        sy0, sy1, w_ = DRAWER_Y0 - 0.005, DRAWER_Y0 + 0.195, 0.025
        desk.box("desk_wood", px0, px1, 0.04, sy0, z0 + 0.03, z1 - 0.03)
        desk.box("desk_wood", px0, px1, sy1, 0.74, z0 + 0.03, z1 - 0.03)
        desk.box("desk_wood", px0, px0 + w_, sy0, sy1, z0 + 0.03, z1 - 0.03)
        desk.box("desk_wood", px1 - w_, px1, sy0, sy1, z0 + 0.03, z1 - 0.03)
        desk.box("desk_wood", px0 + w_, px1 - w_, sy0, sy1, z0 + 0.03, DRAWER_BACK - 0.01)
        desk.box("desk_wood", px0 - 0.01, px1 + 0.01, 0.0, 0.05, z0 + 0.02, z1 - 0.02)
        hx = (px0 + px1) / 2
        for i in range(2):
            dy0 = 0.08 + i * 0.215
            desk.box("desk_wood", px0 + 0.02, px1 - 0.02, dy0, dy0 + 0.19, z1 - 0.03, z1 - 0.012)
            desk.box("brass", hx - 0.05, hx + 0.05, dy0 + 0.085, dy0 + 0.105, z1 - 0.012, z1 + 0.005)
        build_drawer(name, px0, px1, z1)
    desk.box("desk_wood", x0 + 0.48, x1 - 0.48, 0.3, 0.72, z0 + 0.05, z0 + 0.08)
    desk.build(bevel=0.006)

    shelf = Part("bookshelf")
    sx0, sx1, sz0, sz1, sh = X0 + 0.02, X0 + 0.38, -1.0, 1.0, 2.25
    shelf.box("desk_wood", sx0, sx1, 0, 0.1, sz0, sz1)
    shelf.box("desk_wood", sx0, sx1, sh - 0.04, sh, sz0 - 0.02, sz1 + 0.02)
    shelf.box("desk_wood", sx0, sx0 + 0.02, 0, sh, sz0, sz1)
    for z in (sz0, 0.0, sz1):
        shelf.box("desk_wood", sx0, sx1, 0, sh - 0.04, z - 0.02, z + 0.02)
    for i in range(1, 5):
        y = 0.1 + i * (sh - 0.14) / 5
        shelf.box("desk_wood", sx0, sx1 - 0.01, y - 0.015, y + 0.015, sz0, sz1)
    shelf.build(bevel=0.006)

    side = Part("sideboard")
    bx0, bx1, bz0, bz1 = 0.3, 1.7, Z1 - 0.48, Z1 - 0.03
    side.box("desk_wood", bx0, bx1, 0.08, 0.82, bz0, bz1)
    side.box("desk_wood", bx0 - 0.02, bx1 + 0.02, 0.82, 0.85, bz0 - 0.02, bz1)
    for i in range(3):
        dx0 = bx0 + 0.03 + i * (bx1 - bx0 - 0.06) / 3
        dx1 = dx0 + (bx1 - bx0 - 0.06) / 3 - 0.01
        side.box("desk_wood", dx0, dx1, 0.12, 0.78, bz0 - 0.015, bz0)
        side.box("brass", (dx0 + dx1) / 2 - 0.01, (dx0 + dx1) / 2 + 0.01, 0.6, 0.7, bz0 - 0.03, bz0 - 0.015)
    side.build(bevel=0.006)



def export(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
    )
    print(f"Valmis: {path}")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_room().build()
    build_window()
    build_door()
    build_furniture()
    export(OUT)


# build_props.py tuo tämän tiedoston apufunktiot, jolloin main() ei saa käynnistyä.
if __name__ == "__main__":
    main()
